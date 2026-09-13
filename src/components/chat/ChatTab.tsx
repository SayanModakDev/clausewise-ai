'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatCitation } from '@/lib/types';
import { Send, Bot, User, Quote, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatTabProps {
  documentId: string;
  fileUri?: string;
  mimeType?: string;
  textContent?: string;
  documentTitle: string;
}

let messageCounter = 0;
function createChatMessage(
  role: 'user' | 'assistant',
  content: string,
  citations?: ChatCitation[]
): ChatMessage {
  messageCounter += 1;
  return {
    id: `msg_${messageCounter}`,
    role,
    content,
    citations,
    timestamp: 'Just now',
  };
}

export function ChatTab({
  fileUri,
  mimeType,
  textContent,
  documentTitle,
}: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your grounded document assistant for "${documentTitle}". I will only answer questions using facts explicitly written in this contract. If a term or condition is not mentioned, I will let you know.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'What are the termination rules and notice periods?',
    'Is there a non-compete or non-solicitation restriction?',
    'What is the maximum liability cap?',
    'What are the payment deadlines and late interest fees?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputValue).trim();
    if (!q || isLoading) return;

    const userMessage = createChatMessage('user', q);

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUri,
          mimeType,
          textContent,
          question: q,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to obtain answer from document.');
      }

      const assistantMessage = createChatMessage(
        'assistant',
        data.answer,
        data.citations || []
      );

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error communicating with document engine.';
      setMessages((prev) => [
        ...prev,
        createChatMessage(
          'assistant',
          `Unable to complete query: ${errorMsg}. Please verify your network and try again.`
        ),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Document-Grounded Q&A</h4>
            <p className="text-[11px] text-slate-500">
              Grounded exclusively in <span className="font-semibold text-slate-700">{documentTitle}</span>
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Zero Hallucination Guard
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl rounded-xl p-3.5 text-xs leading-relaxed space-y-2.5 ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <Quote className="w-3 h-3 text-blue-600" />
                    Document Citations
                  </div>
                  {msg.citations.map((cite, cIdx) => (
                    <div key={cIdx} className="bg-white p-2 rounded border border-slate-200 text-[11px]">
                      <span className="font-semibold text-slate-800 block text-[10px]">{cite.clauseTitle}</span>
                      <p className="font-mono text-slate-600 italic text-[10px] mt-0.5">
                        &quot;{cite.sourceQuote}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`block text-[10px] ${
                  msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-none p-3.5 text-xs text-slate-600 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Checking contract terms...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Suggested:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-md border border-slate-200 shrink-0 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about this document (e.g. 'Can I be fired without notice?')..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          Answers are derived strictly from contract text. If not in the contract, absence is explicitly noted.
        </p>
      </div>
    </div>
  );
}
