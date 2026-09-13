import { NextRequest, NextResponse } from 'next/server';
import { processUploadedFile, analyzeDocument } from '@/server/document-service';

export const maxDuration = 60; // Allow sufficient time for Gemini document reasoning

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No document file provided.' },
        { status: 400 }
      );
    }

    const processed = await processUploadedFile(file);
    const analysis = await analyzeDocument(processed);

    return NextResponse.json({
      success: true,
      analysis,
      processedUpload: {
        fileUri: processed.fileUri,
        mimeType: processed.mimeType,
        textContent: processed.textContent ? processed.textContent.slice(0, 10000) : undefined,
        originalName: processed.originalName,
        size: processed.size,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to analyze document.';
    // Log generic error server-side without document content
    console.error('Document analysis error:', message);
    return NextResponse.json(
      { error: message || 'An unexpected error occurred during document analysis.' },
      { status: 500 }
    );
  }
}
