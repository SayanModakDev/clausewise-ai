'use client';

import React from 'react';
import { Scale, FileText, UploadCloud, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentDocumentName?: string;
  onResetDocument?: () => void;
  onOpenUpload?: () => void;
  isAnalyzing?: boolean;
}

export function Navbar({
  currentDocumentName,
  onResetDocument,
  onOpenUpload,
  isAnalyzing,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Scale className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">ClauseWise AI</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                <Sparkles className="w-3 h-3" />
                gemini-3.8-flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">Understand the document before you sign it.</p>
          </div>
        </div>

        {/* Current Document / Actions */}
        <div className="flex items-center gap-3">
          {currentDocumentName ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 max-w-xs sm:max-w-md truncate">
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate font-medium">{currentDocumentName}</span>
            </div>
          ) : null}

          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-slate-300" />
                  <span>{currentDocumentName ? 'Change Document' : 'Upload Contract'}</span>
                </>
              )}
            </button>
          )}

          {currentDocumentName && onResetDocument && (
            <button
              onClick={onResetDocument}
              className="p-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset workspace"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
