import { NextRequest, NextResponse } from 'next/server';
import { askDocumentQuestion } from '@/server/document-service';
import { z } from 'zod';

const chatRequestSchema = z.object({
  fileUri: z.string().optional(),
  mimeType: z.string().default('application/pdf'),
  textContent: z.string().optional(),
  question: z.string().min(1, 'Question cannot be empty.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .default([]),
});

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = chatRequestSchema.parse(body);

    if (!validated.fileUri && !validated.textContent) {
      return NextResponse.json(
        { error: 'Document reference (fileUri or textContent) is required for grounded Q&A.' },
        { status: 400 }
      );
    }

    const result = await askDocumentQuestion(
      {
        fileUri: validated.fileUri,
        mimeType: validated.mimeType,
        textContent: validated.textContent,
      },
      validated.question,
      validated.history
    );

    return NextResponse.json({
      success: true,
      answer: result.answer,
      citations: result.citations,
    });
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : String(err);
    console.error('Document Q&A error:', rawMessage);

    let userMessage = 'An unexpected error occurred during Q&A processing. Please try again.';
    let statusCode = 500;

    if (rawMessage.includes('required') || rawMessage.includes('empty')) {
      userMessage = rawMessage;
      statusCode = 400;
    } else if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
      userMessage = 'The AI engine is currently experiencing high demand. Please try again in a few moments.';
      statusCode = 429;
    } else if (rawMessage.includes('API key') || rawMessage.includes('GEMINI_API_KEY')) {
      userMessage = 'AI service authentication error. Please contact the administrator.';
      statusCode = 500;
    }

    return NextResponse.json({ error: userMessage }, { status: statusCode });
  }
}
