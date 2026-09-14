'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  X,
  ArrowRight,
  Shield,
  RefreshCw,
  Scale,
  FileCheck2,
} from 'lucide-react';
import {
  SAMPLE_CONSULTING_CONTRACT_TEXT,
  SAMPLE_NDA_CONTRACT_TEXT,
  SAMPLE_DIFF_DOC_A,
} from '@/lib/sample-data';

interface DocumentUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  onSampleSelect: (sampleName: string, text: string) => void;
  isAnalyzing: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DocumentUploader({
  selectedFile,
  onFileSelect,
  onAnalyze,
  onSampleSelect,
  isAnalyzing,
  error,
  onRetry,
}: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear file input and client error when selectedFile is reset
  useEffect(() => {
    if (!selectedFile && fileInputRef.current) {
      fileInputRef.current.value = '';
      setClientError(null);
    }
  }, [selectedFile]);

  // Progressive loading step animation during Gemini 3.8 Flash analysis
  useEffect(() => {
    if (!isAnalyzing) return;

    const timer1 = setTimeout(() => setAnalysisStep(1), 2000);
    const timer2 = setTimeout(() => setAnalysisStep(2), 5000);
    const timer3 = setTimeout(() => setAnalysisStep(3), 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isAnalyzing]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleIncomingFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleIncomingFile(e.target.files[0]);
    }
  };

  const handleIncomingFile = (file: File) => {
    setClientError(null);

    // Client-side validation: Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setClientError('File size exceeds the 10MB limit. Please upload a smaller document under 10MB.');
      return;
    }

    const validExtensions = ['.pdf', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setClientError('Unsupported file format. Please upload a PDF (.pdf) or plain text (.txt) contract document.');
      return;
    }

    onFileSelect(file);
  };

  const analysisSteps = [
    'Reading document & verifying text structure...',
    'Extracting clauses, parties, and vital commitments...',
    'Evaluating attention levels (Informational, Important, Review)...',
    'Assembling plain-language guide and attorney prep checklist...',
  ];

  const activeErrorMessage = clientError || error;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Landing / Empty State Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <Scale className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span>Legal Document Navigator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Understand the document before you sign it.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Turn complex agreements into plain-language explanations, key obligations and useful questions.
        </p>
      </div>

      {/* Accessible API / File Error Alert */}
      {activeErrorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 text-sm shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Upload or Analysis Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{activeErrorMessage}</p>
            </div>
          </div>
          {onRetry && !clientError && (
            <button
              onClick={onRetry}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Primary Upload Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileChange}
          disabled={isAnalyzing}
          aria-label="Choose a PDF or plain text legal document to analyze"
          className="hidden"
          id="clausewise-file-input"
        />

        {isAnalyzing ? (
          /* Multi-Stage Loading Skeleton & Progress State */
          <div
            role="status"
            aria-live="polite"
            className="py-8 space-y-6"
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-6 h-6 animate-pulse" aria-hidden="true" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Analyzing Document with Gemini 3.8 Flash
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Extracting legal provisions with zero hallucinations and strict source grounding.
                </p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="w-full max-w-md bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 text-left">
                {analysisSteps.map((stepText, idx) => {
                  const isCurrent = idx === analysisStep;
                  const isDone = idx < analysisStep;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" aria-hidden="true" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" aria-hidden="true" />
                      )}
                      <span
                        className={`${
                          isCurrent
                            ? 'font-bold text-blue-900'
                            : isDone
                            ? 'text-slate-600 line-through'
                            : 'text-slate-400'
                        }`}
                      >
                        {stepText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skeleton Placeholders */}
            <div className="space-y-3 pt-4 border-t border-slate-100" aria-hidden="true">
              <div className="h-4 bg-slate-100 rounded-md w-1/3 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              </div>
              <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Drag & Drop Zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload contract document: drag and drop your file here, or press Enter to browse files"
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-all duration-150 ${
                dragActive
                  ? 'border-blue-600 bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" aria-hidden="true" />
                </div>
                <p className="text-base font-semibold text-slate-800">
                  Drag and drop your contract here, or browse files
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  PDF and TXT supported • Up to 10MB file size
                </p>

                <div className="mt-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors pointer-events-none">
                    <FileText className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Select Document</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Selected File Card & Action Button */}
            {selectedFile && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(selectedFile.size)} • {selectedFile.name.endsWith('.pdf') ? 'PDF Document' : 'Plain Text'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onFileSelect(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
                    aria-label="Remove selected file"
                    title="Remove selected file"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={onAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                    <span>Analyze Document</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* Visible Responsible-Use & Truthful Privacy Disclosure */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-blue-950 text-xs">
              <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed space-y-1.5">
                <div>
                  <strong className="text-blue-900 font-bold">Responsible Legal AI Notice:</strong> ClauseWise provides informational assistance and document interpretation, not legal advice. It does not replace professional legal counsel.
                </div>
                <div className="text-[11px] text-blue-900/80">
                  <strong className="text-blue-900 font-semibold">Privacy & Processing Disclosure:</strong> Documents are transmitted securely to Google Gemini for real-time document analysis and may be temporarily retained by the processing service in accordance with Google Cloud APIs. ClauseWise AI does not maintain its own document database.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 1-Click Sample Contracts for Instant Testing */}
      {!isAnalyzing && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Or Try a Sample Contract (1-Click Demo)</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Preloaded legal documents for testing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() =>
                onSampleSelect('employment_agreement_v1.txt', SAMPLE_DIFF_DOC_A)
              }
              className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 hover:border-blue-500 hover:bg-blue-50/60 transition-all text-left group shadow-xs disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    Employment Agreement (v1)
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wide">
                    Demo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  ₹40k/mo salary, 30-day termination notice, 3-mo non-compete, and Bangalore arbitration.
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() =>
                onSampleSelect('Independent_Consulting_Agreement_Apex.txt', SAMPLE_CONSULTING_CONTRACT_TEXT)
              }
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/20 transition-all text-left group shadow-xs disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 shrink-0 transition-colors">
                <Scale className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  Consulting & IP Agreement
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  $12.5k/mo retainer, IP assignment, liability caps, and 6-mo non-compete covenant.
                </p>
              </div>
            </button>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() =>
                onSampleSelect('Mutual_Non_Disclosure_Agreement_Meridian.txt', SAMPLE_NDA_CONTRACT_TEXT)
              }
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/20 transition-all text-left group shadow-xs disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 shrink-0 transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  Mutual NDA Agreement
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  2-year term with 5-year survival, trade secrets, non-solicitation, and injunctive relief.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
