'use client';

import React from 'react';
import { Plus, RefreshCw, Tag } from 'lucide-react';
import { AI_MODEL_DISPLAY_LABEL } from '@/lib/constants';
import { LogoSymbol } from '@/components/brand/Logo';

interface NavbarProps {
  currentDocumentName?: string;
  detectedType?: string;
  onNewAnalysis?: () => void;
  isAnalyzing?: boolean;
}

export function Navbar({
  currentDocumentName,
  detectedType,
  onNewAnalysis,
  isAnalyzing,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 transition-transform hover:scale-105" title="ClauseWise AI">
            <LogoSymbol size={40} theme="light" withTile={true} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight select-none">
                Clause<span className="text-blue-600">Wise</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200">
                <span className="text-blue-500 font-bold text-xs" aria-hidden="true">✦</span>
                {AI_MODEL_DISPLAY_LABEL}
              </span>
            </div>
            {!currentDocumentName ? (
              <p className="text-xs text-slate-500 hidden md:block">
                Understand the document before you sign it.
              </p>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                <span className="font-medium text-slate-700 truncate">{currentDocumentName}</span>
                {detectedType && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {detectedType}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action: New Analysis / Status */}
        <div className="flex items-center gap-2 shrink-0">
          {currentDocumentName && onNewAnalysis && (
            <button
              onClick={onNewAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors shadow-xs disabled:opacity-50"
              title="Start a new document analysis"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>New Analysis</span>
            </button>
          )}

          {isAnalyzing && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
