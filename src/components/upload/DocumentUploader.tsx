'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import { SAMPLE_CONSULTING_CONTRACT_TEXT, SAMPLE_NDA_CONTRACT_TEXT } from '@/lib/sample-data';

interface DocumentUploaderProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sampleName: string, text: string) => void;
  isAnalyzing: boolean;
  error?: string | null;
}

export function DocumentUploader({
  onFileSelect,
  onSampleSelect,
  isAnalyzing,
  error,
}: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Client-side quick check
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }
    const validExtensions = ['.pdf', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt && file.type !== 'application/pdf' && file.type !== 'text/plain') {
      alert('Please upload a PDF (.pdf) or plain text (.txt) document.');
      return;
    }

    setSelectedFileName(file.name);
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Upload Your Legal Document
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          ClauseWise analyzes PDF or text contracts using server-side Gemini 3.8 Flash to extract key obligations, financial terms, and high-priority clauses before you sign.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-600 bg-blue-50/50'
            : isAnalyzing
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileChange}
          disabled={isAnalyzing}
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
            <div>
              <p className="font-medium text-slate-800 text-base">Analyzing Document with Gemini 3.8 Flash...</p>
              <p className="text-xs text-slate-500 mt-1">
                Extracting legal clauses, calculating attention levels, and generating lawyer prep checklist.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-800">
              Drag and drop your contract here, or <span className="text-blue-600 hover:underline">browse files</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              Supports PDF (.pdf) and Plain Text (.txt) up to 10MB
            </p>

            {selectedFileName && (
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium text-blue-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Selected: {selectedFileName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1-Click Sample Contracts */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Try a Sample Contract (1-Click Demo)
          </div>
          <span className="text-xs text-slate-400">Instant test for judges</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() =>
              onSampleSelect('Independent_Consulting_Agreement_Apex.txt', SAMPLE_CONSULTING_CONTRACT_TEXT)
            }
            className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 shrink-0 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Software Consulting & IP Agreement
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                $12.5k/mo retainer, IP work-made-for-hire assignment, liability caps, and 6-month non-compete.
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() =>
              onSampleSelect('Mutual_Non_Disclosure_Agreement_Meridian.txt', SAMPLE_NDA_CONTRACT_TEXT)
            }
            className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 shrink-0 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Mutual Non-Disclosure Agreement (NDA)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                2-year term with 3-year survival, trade secret carveouts, and injunctive relief clauses.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
