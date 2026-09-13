import { NextRequest, NextResponse } from 'next/server';
import { processUploadedFile, compareDocuments } from '@/server/document-service';
import type { ProcessedUpload } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let uploadA: ProcessedUpload;
    let uploadB: ProcessedUpload;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const fileA = formData.get('fileA') as File | null;
      const fileB = formData.get('fileB') as File | null;

      if (!fileA || !fileB) {
        return NextResponse.json(
          { error: 'Both Document A and Document B are required for comparison.' },
          { status: 400 }
        );
      }

      uploadA = await processUploadedFile(fileA);
      uploadB = await processUploadedFile(fileB);
    } else {
      const body = await req.json();
      const { docA, docB } = body;

      if (!docA || !docB) {
        return NextResponse.json(
          { error: 'Both docA and docB payloads are required.' },
          { status: 400 }
        );
      }

      uploadA = {
        fileUri: docA.fileUri,
        mimeType: docA.mimeType || 'text/plain',
        textContent: docA.textContent,
        originalName: docA.originalName || 'Document A',
        size: docA.size || 0,
      };

      uploadB = {
        fileUri: docB.fileUri,
        mimeType: docB.mimeType || 'text/plain',
        textContent: docB.textContent,
        originalName: docB.originalName || 'Document B',
        size: docB.size || 0,
      };
    }

    const comparison = await compareDocuments(uploadA, uploadB);

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to compare documents.';
    console.error('Document comparison error:', message);
    return NextResponse.json(
      { error: message || 'An unexpected error occurred during document comparison.' },
      { status: 500 }
    );
  }
}
