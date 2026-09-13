import 'server-only';
import { ai, GEMINI_CONFIG, withGeminiRetry } from './gemini';
import {
  LEGAL_GUARDRAILS_SYSTEM_INSTRUCTION,
  DOCUMENT_ANALYSIS_PROMPT,
  DOCUMENT_QA_SYSTEM_PROMPT,
  DOCUMENT_ASK_SYSTEM_PROMPT,
  DOCUMENT_COMPARISON_PROMPT,
} from './prompts';
import {
  documentAnalysisDataSchema,
  GEMINI_DOCUMENT_ANALYSIS_SCHEMA,
  chatResponseSchema,
  askResponseSchema,
  GEMINI_ASK_RESPONSE_SCHEMA,
  comparisonResultSchema,
} from '@/lib/schemas';
import type {
  DocumentAnalysisData,
  DocumentAnalysisResult,
  ChatCitation,
  AskDocumentResponse,
  DocumentComparisonResult,
  ProcessedUpload,
  ClauseCategory,
} from '@/lib/types';
import fs from 'fs';
import path from 'path';
import os from 'os';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

type GenerateContentParamContents = Parameters<typeof ai.models.generateContent>[0]['contents'];
type GenerateContentParamConfig = NonNullable<Parameters<typeof ai.models.generateContent>[0]['config']>;
type ResponseSchemaParam = GenerateContentParamConfig['responseSchema'];

/**
 * Validates uploaded file and prepares it for Gemini processing (via Files API for PDF or UTF-8 text).
 * Rejects empty, oversized, or unsupported files with clear user-safe messages.
 * Never logs full document contents.
 */
export async function processUploadedFile(file: File): Promise<ProcessedUpload> {
  if (!file || file.size === 0) {
    throw new Error('The uploaded file is empty (0 bytes). Please upload a valid contract document.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 10MB limit. Please provide a document under 10MB.');
  }

  const fileNameLower = file.name.toLowerCase();
  const isPdf = fileNameLower.endsWith('.pdf') || file.type === 'application/pdf';
  const isTxt = fileNameLower.endsWith('.txt') || file.type === 'text/plain';

  if (!isPdf && !isTxt) {
    throw new Error('Unsupported file format. ClauseWise supports PDF (.pdf) and Plain Text (.txt) documents only.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Plain text processing
  if (isTxt) {
    const textContent = buffer.toString('utf-8');
    if (textContent.trim().length === 0) {
      throw new Error('The uploaded text file contains no readable text content.');
    }

    return {
      mimeType: 'text/plain',
      textContent,
      originalName: file.name,
      size: file.size,
    };
  }

  // PDF processing via Gemini Files API
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
  } catch (uploadErr: unknown) {
    const msg = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
    console.error('Gemini Files API upload error:', msg);
    throw new Error('Failed to process and upload PDF document to Gemini. Please try again.');
  } finally {
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch {
        // Ignore temporary file cleanup failure
      }
    }
  }
}

/**
 * Categorizes clause into standard legal categories based on title/content
 */
function inferClauseCategory(title: string, text: string): ClauseCategory {
  const combined = `${title} ${text}`.toLowerCase();
  if (combined.includes('terminat') || combined.includes('cancel') || combined.includes('cure period')) {
    return 'Termination';
  }
  if (combined.includes('liabilit') || combined.includes('indemnif') || combined.includes('damages') || combined.includes('hold harmless')) {
    return 'Liability & Indemnification';
  }
  if (combined.includes('intellectual property') || combined.includes('work made for hire') || combined.includes('patent') || combined.includes('copyright') || combined.includes('invention')) {
    return 'Intellectual Property';
  }
  if (combined.includes('fee') || combined.includes('payment') || combined.includes('compensation') || combined.includes('invoice') || combined.includes('retainer') || combined.includes('interest')) {
    return 'Payment & Fees';
  }
  if (combined.includes('confidential') || combined.includes('non-disclosure') || combined.includes('trade secret') || combined.includes('proprietary')) {
    return 'Confidentiality';
  }
  if (combined.includes('governing law') || combined.includes('arbitrat') || combined.includes('jurisdiction') || combined.includes('dispute') || combined.includes('court')) {
    return 'Governing Law & Dispute Resolution';
  }
  if (combined.includes('non-compete') || combined.includes('non-solicit') || combined.includes('restrictive covenant') || combined.includes('restraint')) {
    return 'Non-Compete & Restrictive Covenants';
  }
  if (combined.includes('warrant') || combined.includes('disclaimer') || combined.includes('as is') || combined.includes('merchantability')) {
    return 'Warranties & Disclaimers';
  }
  return 'General & Miscellaneous';
}

/**
 * Performs full legal analysis of a document using Gemini 3.8 Flash structured output.
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

  let response;
  try {
    response = await withGeminiRetry(async () => {
      return await ai.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: contents as GenerateContentParamContents,
        config: {
          systemInstruction: LEGAL_GUARDRAILS_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_DOCUMENT_ANALYSIS_SCHEMA as ResponseSchemaParam,
          temperature: GEMINI_CONFIG.temperature,
          thinkingConfig: GEMINI_CONFIG.thinkingConfig,
        },
      });
    }, 2);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
      console.warn(`Gemini 3.8 Flash quota reached; activating ${GEMINI_CONFIG.fallbackModel} fallback.`);
      response = await withGeminiRetry(async () => {
        return await ai.models.generateContent({
          model: GEMINI_CONFIG.fallbackModel,
          contents: contents as GenerateContentParamContents,
          config: {
            systemInstruction: LEGAL_GUARDRAILS_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: GEMINI_DOCUMENT_ANALYSIS_SCHEMA as ResponseSchemaParam,
            temperature: GEMINI_CONFIG.temperature,
            thinkingConfig: GEMINI_CONFIG.thinkingConfig,
          },
        });
      }, 3);
    } else {
      throw err;
    }
  }

  const responseText = response.text || '{}';
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(responseText);
  } catch {
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      throw new Error('Gemini response could not be parsed as valid JSON.');
    }
  }

  const rawAnalysis: DocumentAnalysisData = documentAnalysisDataSchema.parse(parsedJson);

  // Derive counts for attention badges
  let informationalCount = 0;
  let importantCount = 0;
  let reviewCount = 0;

  const mappedClauses = rawAnalysis.clauses.map((c, idx) => {
    if (c.attentionLevel === 'REVIEW') reviewCount++;
    else if (c.attentionLevel === 'IMPORTANT') importantCount++;
    else informationalCount++;

    return {
      id: `cl-${idx + 1}`,
      title: c.title,
      source: c.source || null,
      category: inferClauseCategory(c.title, c.originalText),
      attentionLevel: c.attentionLevel,
      plainExplanation: c.plainLanguage,
      sourceQuote: c.originalText,
      practicalImplications: c.whyItMatters,
      suggestedQuestions: [
        `How does this ${c.title} term compare to standard industry norms?`,
        `Can this provision be revised to minimize potential risk before signing?`,
      ],
    };
  });

  const riskSummary =
    reviewCount > 0
      ? `Contains ${reviewCount} clause(s) requiring careful review (e.g., restrictive covenants, unilateral rights, or aggressive indemnities). We recommend discussing these specific items with a qualified attorney.`
      : importantCount > 0
      ? `Contains ${importantCount} important substantive obligation(s) regarding core commitments, intellectual property, or payments. Generally balanced, but verify all numbers and timelines.`
      : 'Standard operational agreement composed predominantly of informational and customary commercial terms.';

  const mappedOverview = {
    title: rawAnalysis.documentType || upload.originalName,
    documentType: rawAnalysis.documentType,
    executiveSummary: rawAnalysis.summary,
    parties: rawAnalysis.parties.map((p) => {
      const parts = p.split(/[()]/).map((s) => s.trim()).filter(Boolean);
      return {
        name: parts[0] || p,
        role: parts[1] || 'Contracting Party',
      };
    }),
    keyDates: rawAnalysis.importantDates.map((d) => ({
      label: d.label,
      date: d.value,
      description: d.source ? `Reference: ${d.source}` : 'Specified in agreement',
    })),
    financialTerms: rawAnalysis.financialTerms.map((f) => ({
      label: f.label,
      amountOrRate: f.value,
      description: f.source ? `Reference: ${f.source}` : 'Payment condition',
    })),
    coreObligations: rawAnalysis.obligations.map((o) => ({
      party: o.party || 'Signer',
      obligation: o.obligation,
    })),
    riskProfile: {
      summary: riskSummary,
      informationalCount,
      importantCount,
      reviewCount,
    },
  };

  const mappedActionPlan = {
    highPriorityChecklist: rawAnalysis.itemsToClarify.map((item, idx) => ({
      id: `chk-${idx + 1}`,
      item,
      reason: 'Item to clarify, verify, or negotiate before signing',
      category: 'Pre-Signing Verification',
      completed: false,
    })),
    attorneyDiscussionQuestions: rawAnalysis.questionsForProfessional.map((q) => ({
      category: 'Attorney Review',
      question: q,
      context: 'Identified during automated legal document inspection',
    })),
    signingReadiness: {
      assessment:
        reviewCount > 0
          ? 'Requires Legal Review Prior to Signing'
          : importantCount > 0
          ? 'Moderately Favorable with Verification Points'
          : 'Ready for Administrative Review',
      keyBlockers: rawAnalysis.itemsToClarify.slice(0, 3),
    },
  };

  return {
    documentId: `doc_${Date.now()}`,
    fileName: upload.originalName,
    fileUri: upload.fileUri,
    mimeType: upload.mimeType,
    fileSize: upload.size,
    analyzedAt: new Date().toISOString(),
    textContent: upload.textContent,
    analysis: rawAnalysis,
    rawAnalysis,
    overview: mappedOverview,
    clauses: mappedClauses,
    actionPlan: mappedActionPlan,
  };
}

/**
 * Answers a document-grounded question using Gemini 3.8 Flash.
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

  let response;
  try {
    response = await withGeminiRetry(async () => {
      return await ai.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: contents as GenerateContentParamContents,
        config: {
          systemInstruction: DOCUMENT_QA_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
    }, 2);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
      console.warn(`Gemini 3.8 Flash quota reached; activating ${GEMINI_CONFIG.fallbackModel} fallback for Q&A.`);
      response = await withGeminiRetry(async () => {
        return await ai.models.generateContent({
          model: GEMINI_CONFIG.fallbackModel,
          contents: contents as GenerateContentParamContents,
          config: {
            systemInstruction: DOCUMENT_QA_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
      }, 3);
    } else {
      throw err;
    }
  }

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
 * Production-quality Document-Grounded Q&A endpoint service (/api/ask).
 * Adheres strictly to grounding rules and outputs:
 * {
 *   status: "ANSWERED" | "NOT_SPECIFIED",
 *   answer: string,
 *   source: string | null,
 *   supportingText: string | null
 * }
 */
export async function askDocumentGroundedQuestion(
  upload: { fileUri?: string; mimeType: string; textContent?: string },
  question: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<AskDocumentResponse> {
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

  if (history.length > 0) {
    const formattedHistory = history
      .slice(-4)
      .map((h) => `${h.role === 'user' ? 'User' : 'ClauseWise'}: ${h.content}`)
      .join('\n\n');
    contents.push({ text: `PREVIOUS CONVERSATION CONTEXT:\n${formattedHistory}` });
  }

  contents.push({
    text: `USER QUESTION: "${question}"

Analyze the document for this specific question.
- If the question is answered by the document text:
  * Set status to "ANSWERED".
  * Set answer to a clear, direct plain-language explanation of what the document says.
  * Set source to the exact clause or section number/title (e.g. "Section 3.2" or "Clause 8").
  * Set supportingText to the exact verbatim excerpt from the document that substantiates your answer.
- If the document does NOT contain sufficient information or if the term/topic is absent:
  * Set status to "NOT_SPECIFIED".
  * Set answer to: "This information is not specified in the provided document."
  * Set source to null.
  * Set supportingText to null.`,
  });

  let response;
  try {
    response = await withGeminiRetry(async () => {
      return await ai.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: contents as GenerateContentParamContents,
        config: {
          systemInstruction: DOCUMENT_ASK_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_ASK_RESPONSE_SCHEMA as ResponseSchemaParam,
          temperature: 0.1,
          thinkingConfig: GEMINI_CONFIG.thinkingConfig,
        },
      });
    }, 2);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429')) {
      console.warn(`Gemini 3.8 Flash quota reached; activating ${GEMINI_CONFIG.fallbackModel} fallback for /api/ask.`);
      response = await withGeminiRetry(async () => {
        return await ai.models.generateContent({
          model: GEMINI_CONFIG.fallbackModel,
          contents: contents as GenerateContentParamContents,
          config: {
            systemInstruction: DOCUMENT_ASK_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: GEMINI_ASK_RESPONSE_SCHEMA as ResponseSchemaParam,
            temperature: 0.1,
            thinkingConfig: GEMINI_CONFIG.thinkingConfig,
          },
        });
      }, 3);
    } else {
      throw err;
    }
  }

  const responseText = response.text || '{}';
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    return {
      status: 'NOT_SPECIFIED',
      answer: 'This information is not specified in the provided document.',
      source: null,
      supportingText: null,
    };
  }

  const validated = askResponseSchema.parse(parsed);

  // Absolute safety check: If not specified or if answer indicates absence
  if (
    validated.status === 'NOT_SPECIFIED' ||
    validated.answer.toLowerCase().includes('not specified in the provided document') ||
    validated.answer.toLowerCase().includes('not mentioned in the provided document')
  ) {
    return {
      status: 'NOT_SPECIFIED',
      answer: 'This information is not specified in the provided document.',
      source: null,
      supportingText: null,
    };
  }

  return validated;
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
      model: GEMINI_CONFIG.model,
      contents: contents as GenerateContentParamContents,
      config: {
        systemInstruction: LEGAL_GUARDRAILS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
  });

  const responseText = response.text || '{}';
  const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return comparisonResultSchema.parse(parsed);
}
