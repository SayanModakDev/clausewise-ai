import { NextRequest, NextResponse } from 'next/server';
import { processUploadedFile, compareDocuments } from '@/server/document-service';
import type { ProcessedUpload } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured on the server. Please check server settings.' },
      { status: 500 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let uploadA: ProcessedUpload;
    let uploadB: ProcessedUpload;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const fileA = (formData.get('fileA') || formData.get('originalFile')) as File | null;
      const fileB = (formData.get('fileB') || formData.get('revisedFile')) as File | null;

      if (!fileA || !fileB) {
        return NextResponse.json(
          { error: 'Both Original Document (fileA) and Revised Document (fileB) are required for comparison.' },
          { status: 400 }
        );
      }

      uploadA = await processUploadedFile(fileA);
      uploadB = await processUploadedFile(fileB);
    } else {
      const body = await req.json();
      const docA = body.docA || body.originalDoc;
      const docB = body.docB || body.revisedDoc;

      if (!docA || !docB) {
        return NextResponse.json(
          { error: 'Both docA (Original Document) and docB (Revised Document) payloads are required.' },
          { status: 400 }
        );
      }

      uploadA = {
        fileUri: docA.fileUri,
        mimeType: docA.mimeType || 'text/plain',
        textContent: docA.textContent,
        originalName: docA.originalName || 'Original Document',
        size: docA.size || 0,
      };

      uploadB = {
        fileUri: docB.fileUri,
        mimeType: docB.mimeType || 'text/plain',
        textContent: docB.textContent,
        originalName: docB.originalName || 'Revised Document',
        size: docB.size || 0,
      };
    }

    const comparison = await compareDocuments(uploadA, uploadB, { signal: req.signal });

    return NextResponse.json({
      success: true,
      summary: comparison.summary,
      changes: comparison.changes,
      comparison,
    });
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : String(err);
    console.error('Document comparison error:', rawMessage);

    let userMessage = 'An unexpected error occurred during document comparison. Please try again.';
    let statusCode = 500;

    if (
      rawMessage.includes('Both Document A and Document B') ||
      rawMessage.includes('empty') ||
      rawMessage.includes('Unsupported file format') ||
      rawMessage.includes('limit') ||
      rawMessage.includes('Invalid')
    ) {
      userMessage = rawMessage;
      statusCode = 400;
    } else if (
      rawMessage.includes('503') ||
      rawMessage.includes('high demand') ||
      rawMessage.includes('UNAVAILABLE') ||
      rawMessage.includes('Service Unavailable')
    ) {
      userMessage = 'AI document comparison is temporarily unavailable. Please try again shortly.';
      statusCode = 503;
    } else if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
      userMessage = 'The AI comparison engine is currently experiencing high demand. Please try again in a few moments.';
      statusCode = 429;
    } else if (rawMessage.includes('API key') || rawMessage.includes('GEMINI_API_KEY')) {
      userMessage = 'AI service authentication error. Please contact the administrator.';
      statusCode = 500;
    } else if (rawMessage.includes('aborted') || req.signal?.aborted) {
      userMessage = 'Document comparison request was cancelled.';
      statusCode = 499;
    }

    return NextResponse.json({ error: userMessage }, { status: statusCode });
  }
}
