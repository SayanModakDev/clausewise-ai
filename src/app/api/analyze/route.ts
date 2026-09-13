import { NextRequest, NextResponse } from 'next/server';
import { processUploadedFile, analyzeDocument } from '@/server/document-service';

export const maxDuration = 60; // Allow sufficient duration for Gemini document analysis

export async function POST(req: NextRequest) {
  // Check API key configuration early
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gemini API key is not configured on the server. Please check the server environment settings.',
      },
      { status: 500 }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format. Content-Type must be multipart/form-data.',
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No document file provided. Please upload a PDF (.pdf) or text (.txt) file.',
        },
        { status: 400 }
      );
    }

    // Validate empty file
    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'The uploaded file is empty (0 bytes). Please provide a document with content.',
        },
        { status: 400 }
      );
    }

    // Validate size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size exceeds the 10MB limit. Please upload a document smaller than 10MB.',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const nameLower = file.name.toLowerCase();
    const isPdf = nameLower.endsWith('.pdf') || file.type === 'application/pdf';
    const isTxt = nameLower.endsWith('.txt') || file.type === 'text/plain';

    if (!isPdf && !isTxt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file format. ClauseWise only supports PDF (.pdf) and Plain Text (.txt) documents.',
        },
        { status: 400 }
      );
    }

    // Process file (Gemini Files API upload for PDF or in-memory text extraction)
    const processed = await processUploadedFile(file);

    // Run structured legal analysis via Gemini 3.8 Flash
    const analysisResult = await analyzeDocument(processed);

    return NextResponse.json({
      success: true,
      document: {
        id: analysisResult.documentId,
        fileName: analysisResult.fileName,
        fileUri: analysisResult.fileUri,
        mimeType: analysisResult.mimeType,
        fileSize: analysisResult.fileSize,
        analyzedAt: analysisResult.analyzedAt,
        textContent: processed.textContent ? processed.textContent.slice(0, 50000) : undefined,
      },
      // Exact structured fields specified in requirements
      analysis: analysisResult.rawAnalysis,
      // UI-ready structured representations for instant display
      overview: analysisResult.overview,
      clauses: analysisResult.clauses,
      actionPlan: analysisResult.actionPlan,
    });
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : String(err);
    // Log sanitized error without printing sensitive document contents or API credentials
    console.error('API /api/analyze error:', rawMessage);

    // Determine user-friendly error response without leaking stack traces
    let userMessage = 'An unexpected error occurred during document analysis. Please try again.';
    let statusCode = 500;

    if (
      rawMessage.includes('empty') ||
      rawMessage.includes('Unsupported file format') ||
      rawMessage.includes('limit') ||
      rawMessage.includes('Invalid file type')
    ) {
      userMessage = rawMessage;
      statusCode = 400;
    } else if (
      rawMessage.includes('503') ||
      rawMessage.includes('high demand') ||
      rawMessage.includes('UNAVAILABLE')
    ) {
      userMessage = 'The AI legal analysis engine is currently experiencing high demand. Please try again in a few moments.';
      statusCode = 503;
    } else if (rawMessage.includes('API key') || rawMessage.includes('GEMINI_API_KEY')) {
      userMessage = 'Gemini service authentication error. Please contact the administrator.';
      statusCode = 500;
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
      },
      { status: statusCode }
    );
  }
}
