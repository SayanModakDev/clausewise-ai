import { NextRequest, NextResponse } from 'next/server';
import { askDocumentGroundedQuestion } from '@/server/document-service';
import { askRequestSchema } from '@/lib/schemas';

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  // Early check for Gemini API key
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error: 'Gemini API key is not configured on the server. Please check server environment.',
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    // Check empty question
    if (!body || !body.question || !body.question.trim()) {
      return NextResponse.json(
        {
          error: 'Question is required and cannot be empty.',
        },
        { status: 400 }
      );
    }

    const validated = askRequestSchema.parse(body);

    if (!validated.fileUri && !validated.textContent) {
      return NextResponse.json(
        {
          error: 'Document reference (fileUri or textContent) is required for document-grounded Q&A.',
        },
        { status: 400 }
      );
    }

    const result = await askDocumentGroundedQuestion(
      {
        fileUri: validated.fileUri,
        mimeType: validated.mimeType,
        textContent: validated.textContent,
      },
      validated.question.trim(),
      validated.history
    );

    return NextResponse.json({
      status: result.status,
      answer: result.answer,
      source: result.source,
      supportingText: result.supportingText,
    });
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : String(err);
    console.error('API /api/ask error:', rawMessage);

    let userMessage = 'An unexpected error occurred while querying the document.';
    let statusCode = 500;

    if (rawMessage.includes('required') || rawMessage.includes('empty')) {
      userMessage = rawMessage;
      statusCode = 400;
    } else if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
      userMessage = 'The AI engine is currently experiencing high demand. Please try again shortly.';
      statusCode = 429;
    } else if (rawMessage.includes('API key') || rawMessage.includes('GEMINI_API_KEY')) {
      userMessage = 'AI service authentication error. Please contact the administrator.';
      statusCode = 500;
    }

    return NextResponse.json({ error: userMessage }, { status: statusCode });
  }
}
