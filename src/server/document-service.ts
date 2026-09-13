import 'server-only';
import { ai, GEMINI_MODEL, withGeminiRetry } from './gemini';
import {
  LEGAL_GUARDRAILS_SYSTEM_INSTRUCTION,
  DOCUMENT_ANALYSIS_PROMPT,
  DOCUMENT_QA_SYSTEM_PROMPT,
  DOCUMENT_COMPARISON_PROMPT,
} from './prompts';
import {
  fullAnalysisSchema,
  chatResponseSchema,
  comparisonResultSchema,
} from '@/lib/schemas';
import type {
  DocumentAnalysisResult,
  ChatCitation,
  DocumentComparisonResult,
  ProcessedUpload,
} from '@/lib/types';
import fs from 'fs';
import path from 'path';
import os from 'os';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
];

type GenerateContentParamContents = Parameters<typeof ai.models.generateContent>[0]['contents'];

/**
 * Validates uploaded file and prepares it for Gemini processing (via Files API or in-memory text).
 */
export async function processUploadedFile(file: File): Promise<ProcessedUpload> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 10MB limit.');
  }

  const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain');

  if (!ALLOWED_MIME_TYPES.includes(mimeType) && !file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
    throw new Error('Invalid file type. Only PDF (.pdf) and plain text (.txt) files are supported.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // For plain text, we can use both text content directly and/or Files API
  if (mimeType === 'text/plain' || file.name.endsWith('.txt')) {
    const textContent = buffer.toString('utf-8');
    return {
      mimeType: 'text/plain',
      textContent,
      originalName: file.name,
      size: file.size,
    };
  }

  // For PDF files, save temporarily and upload to Gemini Files API
  const tempFilePath = path.join(
    os.tmpdir(),
    `clausewise_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`
  );

  try {
    fs.writeFileSync(tempFilePath, buffer);
    const uploadedFile = await withGeminiRetry(async () => {
      return await ai.files.upload({
        file: tempFilePath,
        config: {
          mimeType: 'application/pdf',
        },
      });
    });

    return {
      fileUri: uploadedFile.uri,
      mimeType: 'application/pdf',
      originalName: file.name,
      size: file.size,
    };
  } finally {
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {
        // Ignore cleanup failure
      }
    }
  }
}

/**
 * Performs full legal analysis of a document using gemini-3.8-flash.
 */
export async function analyzeDocument(
  upload: ProcessedUpload
): Promise<DocumentAnalysisResult> {
  const contents: unknown[] = [];

  if (upload.fileUri) {
    contents.push({
      fileData: {
        fileUri: upload.fileUri,
        mimeType: upload.mimeType,
      },
    });
  } else if (upload.textContent) {
    contents.push({
      text: `DOCUMENT CONTENT:\n"""\n${upload.textContent}\n"""`,
    });
  }

  contents.push({ text: DOCUMENT_ANALYSIS_PROMPT });

  const response = await withGeminiRetry(async () => {
    return await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents as GenerateContentParamContents,
      config: {
        systemInstruction: LEGAL_GUARDRAILS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });
  });

  const responseText = response.text || '{}';
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(responseText);
  } catch {
    // Attempt markdown json code block stripping if necessary
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    parsedJson = JSON.parse(cleaned);
  }

  const validated = fullAnalysisSchema.parse(parsedJson);

  return {
    documentId: `doc_${Date.now()}`,
    fileName: upload.originalName,
    fileUri: upload.fileUri,
    mimeType: upload.mimeType,
    fileSize: upload.size,
    analyzedAt: new Date().toISOString(),
    overview: validated.overview,
    clauses: validated.clauses,
    actionPlan: validated.actionPlan,
  };
}

/**
 * Answers a document-grounded question using gemini-3.8-flash.
 */
export async function askDocumentQuestion(
  upload: { fileUri?: string; mimeType: string; textContent?: string },
  question: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ answer: string; citations: ChatCitation[] }> {
  const contents: unknown[] = [];

  if (upload.fileUri) {
    contents.push({
      fileData: {
        fileUri: upload.fileUri,
        mimeType: upload.mimeType,
      },
    });
  } else if (upload.textContent) {
    contents.push({
      text: `DOCUMENT CONTENT:\n"""\n${upload.textContent}\n"""`,
    });
  }

  // Append relevant conversation context
  if (history.length > 0) {
    const formattedHistory = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'User' : 'ClauseWise Assistant'}: ${h.content}`)
      .join('\n\n');
    contents.push({ text: `PREVIOUS CONVERSATION:\n${formattedHistory}` });
  }

  contents.push({
    text: `USER QUESTION:\n"${question}"\n\nProvide an answer formatted in JSON with the structure: { "answer": string, "citations": [{ "clauseTitle": string, "sourceQuote": string }] }. If not mentioned in the document, set answer to "This information is not specified in the provided document." and citations to [].`,
  });

  const response = await withGeminiRetry(async () => {
    return await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents as GenerateContentParamContents,
      config: {
        systemInstruction: DOCUMENT_QA_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    });
  });

  const responseText = response.text || '{}';
  try {
    const parsed = JSON.parse(responseText.replace(/```json\n?|\n?```/g, '').trim());
    return chatResponseSchema.parse(parsed);
  } catch {
    return {
      answer: responseText.trim() || 'This information is not specified in the provided document.',
      citations: [],
    };
  }
}

/**
 * Compares two documents and identifies substantive changes and risk shifts.
 */
export async function compareDocuments(
  docA: ProcessedUpload,
  docB: ProcessedUpload
): Promise<DocumentComparisonResult> {
  const contents: unknown[] = [];

  if (docA.fileUri) {
    contents.push({
      fileData: { fileUri: docA.fileUri, mimeType: docA.mimeType },
    });
  } else if (docA.textContent) {
    contents.push({ text: `DOCUMENT A (${docA.originalName}):\n"""\n${docA.textContent}\n"""` });
  }

  if (docB.fileUri) {
    contents.push({
      fileData: { fileUri: docB.fileUri, mimeType: docB.mimeType },
    });
  } else if (docB.textContent) {
    contents.push({ text: `DOCUMENT B (${docB.originalName}):\n"""\n${docB.textContent}\n"""` });
  }

  contents.push({ text: DOCUMENT_COMPARISON_PROMPT });

  const response = await withGeminiRetry(async () => {
    return await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents as GenerateContentParamContents,
      config: {
        systemInstruction: LEGAL_GUARDRAILS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });
  });

  const responseText = response.text || '{}';
  const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return comparisonResultSchema.parse(parsed);
}
