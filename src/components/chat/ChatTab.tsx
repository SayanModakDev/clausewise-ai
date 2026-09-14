'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AskSessionItem, AskDocumentResponse } from '@/lib/types';
import {
  Send,
  User,
  Quote,
  Sparkles,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckCircle2,
  HelpCircle,
  Scale,
  SearchX,
} from 'lucide-react';

interface ChatTabProps {
  documentId?: string;
  fileUri?: string;
  mimeType?: string;
  textContent?: string;
  documentTitle: string;
}

function getSessionTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatTab({
  fileUri,
  mimeType,
  textContent,
  documentTitle,
}: ChatTabProps) {
  // Conversational history for current page session without database
  const [history, setHistory] = useState<AskSessionItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [
    'Can this agreement be terminated early?',
    'Who pays the arbitration fees?',
    'What payment obligations are specified?',
    'Does this agreement provide maternity leave or health insurance?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleAsk = async (questionText?: string) => {
    const q = (questionText || inputValue).trim();
    if (!q || isLoading) return;

    setError(null);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build session history for multi-turn context
      const conversationHistory = history.slice(-4).flatMap((item) => [
        { role: 'user' as const, content: item.question },
        { role: 'assistant' as const, content: item.response.answer },
      ]);

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUri,
          mimeType,
          textContent,
          question: q,
          history: conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to query document.');
      }

      const askResponse: AskDocumentResponse = {
        status: data.status,
        answer: data.answer,
        source: data.source,
        supportingText: data.supportingText,
      };

      const timeStr = getSessionTimestamp();
      setHistory((prev) => [
        ...prev,
        {
          id: `ask_${prev.length + 1}_${timeStr}`,
          question: q,
          response: askResponse,
          timestamp: timeStr,
        },
      ]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'An unexpected error occurred while querying.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interactive Q&A
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <Scale className="w-3 h-3 text-blue-600" />
              Document Grounded
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Ask Document
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Strictly grounded in <span className="font-semibold text-slate-800">&quot;{documentTitle}&quot;</span>. Zero external legal assumptions or hallucinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-semibold text-slate-500 block">Grounding Mode</span>
            <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Strict Source Verification
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Questions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Suggested Questions (Click to Ask)</span>
          </div>
          <span className="text-[11px] text-slate-400">Live Gemini evaluation</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 text-slate-700 font-medium transition-all shrink-0 shadow-xs disabled:opacity-50 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Q&A Session Feed */}
      <div className="space-y-4">
        {history.length === 0 && !isLoading && (
          <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No questions asked yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Ask any specific question about fees, dates, termination clauses, liability caps, or restrictive covenants in this agreement.
              </p>
            </div>
          </div>
        )}

        {/* Conversation Items */}
        {history.map((item) => {
          const isAnswered = item.response.status === 'ANSWERED';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Question Row */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Your Question
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                      {item.question}
                    </h3>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{item.timestamp}</span>
              </div>

              {/* Answer Content */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Status Badge Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {isAnswered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ANSWERED (DOCUMENT GROUNDED)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                        <SearchX className="w-3.5 h-3.5 text-amber-700" />
                        NOT SPECIFIED IN DOCUMENT
                      </span>
                    )}

                    {item.response.source && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        {item.response.source}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plain-Language Answer Body */}
                <div
                  className={`p-4 rounded-xl leading-relaxed text-sm ${
                    isAnswered
                      ? 'bg-slate-50 border border-slate-200 text-slate-800 font-normal'
                      : 'bg-amber-50/50 border border-amber-200 text-amber-950 font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.response.answer}</p>

                  {!isAnswered && (
                    <p className="text-xs text-amber-800 mt-2 pt-2 border-t border-amber-200/80 leading-relaxed font-normal">
                      <strong>Absence Verification:</strong> The uploaded agreement does not contain explicit provisions or terms addressing this inquiry. ClauseWise strictly refrains from guessing or fabricating missing terms.
                    </p>
                  )}
                </div>

                {/* Verbatim Supporting Excerpt Quote */}
                {item.response.supportingText && (
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                      <Quote className="w-3.5 h-3.5 text-amber-700" />
                      <span className="uppercase tracking-wider text-amber-950 font-extrabold text-[11px]">
                        Supporting Contract Excerpt {item.response.source ? `(${item.response.source})` : ''}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-900 bg-white/90 p-3 rounded-lg border border-amber-200/60 leading-relaxed whitespace-pre-wrap">
                      &quot;{item.response.supportingText}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Card State */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Scanning contract and verifying citations...
                </p>
                <p className="text-[11px] text-slate-500">
                  Gemini 3.8 Flash is cross-referencing document sections and enforcing strict absence fallback.
                </p>
              </div>
            </div>
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" aria-hidden="true" />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold">Query Error:</span> {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              id="ask-question-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about this agreement (e.g. 'Can this agreement be terminated early?')..."
              disabled={isLoading}
              aria-label="Ask a question about this contract document"
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            id="ask-submit-button"
            disabled={isLoading || !inputValue.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            aria-label="Submit question to contract"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Ask Document</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
          <span>
            Answers are grounded strictly in the uploaded document. If terms are not in the contract, absence is explicitly reported.
          </span>
        </p>
      </div>
    </div>
  );
}
