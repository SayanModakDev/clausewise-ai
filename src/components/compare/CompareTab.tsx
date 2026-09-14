'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SmartComparisonResult, ProcessedUpload, AttentionLevel } from '@/lib/types';
import {
  SAMPLE_SMART_COMPARISON,
  SAMPLE_DIFF_DOC_A,
  SAMPLE_DIFF_DOC_B,
} from '@/lib/sample-data';
import { AttentionBadge } from '@/components/common/AttentionBadge';
import {
  GitCompare,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Sparkles,
  RefreshCw,
  X,
  Search,
  Scale,
  FileCheck2,
} from 'lucide-react';

interface CompareTabProps {
  currentUpload?: ProcessedUpload;
}

export function CompareTab({ currentUpload }: CompareTabProps) {
  const [comparison, setComparison] = useState<SmartComparisonResult | null>(null);

  // Document A (Original) state
  const [fileA, setFileA] = useState<File | null>(null);
  const [useCurrentForA, setUseCurrentForA] = useState(Boolean(currentUpload));

  // Document B (Revised) state
  const [fileB, setFileB] = useState<File | null>(null);

  const [isComparing, setIsComparing] = useState(false);
  const [compareStep, setCompareStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttention, setSelectedAttention] = useState<AttentionLevel | 'ALL'>('ALL');

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  // Progressive animation for loading stages
  useEffect(() => {
    if (!isComparing) return;

    const timer1 = setTimeout(() => setCompareStep(1), 2000);
    const timer2 = setTimeout(() => setCompareStep(2), 5500);
    const timer3 = setTimeout(() => setCompareStep(3), 9500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isComparing]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const hasDocA = Boolean(fileA || (useCurrentForA && currentUpload));
  const hasDocB = Boolean(fileB);

  const docAName = fileA
    ? fileA.name
    : useCurrentForA && currentUpload
    ? currentUpload.originalName
    : null;

  const docASize = fileA
    ? formatFileSize(fileA.size)
    : useCurrentForA && currentUpload
    ? formatFileSize(currentUpload.size)
    : null;

  const handleRunComparison = async (customDocA?: string, customDocB?: string) => {
    setIsComparing(true);
    setError(null);
    setCompareStep(0);

    try {
      let res: Response;

      if (customDocA && customDocB) {
        // Run with custom direct text (e.g. 1-click test fixture)
        res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docA: {
              originalName: 'employment_agreement_v1.txt',
              textContent: customDocA,
              mimeType: 'text/plain',
            },
            docB: {
              originalName: 'employment_agreement_v2.txt',
              textContent: customDocB,
              mimeType: 'text/plain',
            },
          }),
        });
      } else if (fileA && fileB) {
        // Both are user-uploaded files
        const formData = new FormData();
        formData.append('fileA', fileA);
        formData.append('fileB', fileB);

        res = await fetch('/api/compare', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Combination of current active upload and second file
        const docAText = fileA ? await fileA.text() : currentUpload?.textContent;
        const docBText = fileB ? await fileB.text() : undefined;

        res = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docA: {
              originalName: docAName || 'Original Document',
              textContent: docAText,
              fileUri: !fileA ? currentUpload?.fileUri : undefined,
              mimeType: fileA?.type || currentUpload?.mimeType || 'text/plain',
            },
            docB: {
              originalName: fileB?.name || 'Revised Document',
              textContent: docBText,
              mimeType: fileB?.type || 'text/plain',
            },
          }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Document comparison failed. Please try again.');
      }

      const result: SmartComparisonResult = {
        summary: data.summary || data.comparison?.summary || '',
        changes: data.changes || data.comparison?.changes || [],
      };

      setComparison(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred during comparison.'
      );
    } finally {
      setIsComparing(false);
    }
  };

  const handleRunDemoComparison = async () => {
    setUseCurrentForA(false);
    setFileA(new File([SAMPLE_DIFF_DOC_A], 'Zenith_Agreement_v1.0.txt', { type: 'text/plain' }));
    setFileB(new File([SAMPLE_DIFF_DOC_B], 'Zenith_Agreement_v2.0_Revised.txt', { type: 'text/plain' }));
    await handleRunComparison(SAMPLE_DIFF_DOC_A, SAMPLE_DIFF_DOC_B);
  };

  const filteredChanges = useMemo(() => {
    if (!comparison) return [];
    return comparison.changes.filter((c) => {
      if (selectedAttention !== 'ALL' && c.attentionLevel !== selectedAttention) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.clause.toLowerCase().includes(q) ||
          c.explanation.toLowerCase().includes(q) ||
          c.before.toLowerCase().includes(q) ||
          c.after.toLowerCase().includes(q) ||
          c.whyItMatters.toLowerCase().includes(q) ||
          Boolean(c.sourceA?.toLowerCase().includes(q)) ||
          Boolean(c.sourceB?.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [comparison, selectedAttention, searchQuery]);

  const comparisonSteps = [
    'Parsing and segmenting Original and Revised documents...',
    'Evaluating semantic shifts across obligations, rights, and timelines...',
    'Evaluating attention levels (Informational, Important, Review)...',
    'Assembling plain-language comparison report...',
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contract Version Intelligence
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <Scale className="w-3 h-3 text-blue-600" />
              Material Semantic Diff
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Smart Document Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Compare two contract versions to detect altered notice periods, fee adjustments, and shifted obligations in plain language.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={handleRunDemoComparison}
            disabled={isComparing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-900 transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Try 3-Change Known Demo</span>
          </button>
        </div>
      </div>

      {/* Dual Document Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900">Select Document Versions to Compare</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Document A (Original) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                  A
                </span>
                Original Document (Baseline)
              </span>
              {useCurrentForA && currentUpload && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Active Contract
                </span>
              )}
            </div>

            <input
              ref={fileInputARef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileA(e.target.files[0]);
                  setUseCurrentForA(false);
                }
              }}
              disabled={isComparing}
              className="hidden"
            />

            {hasDocA ? (
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{docAName}</p>
                    <p className="text-[11px] text-slate-500">{docASize}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputARef.current?.click()}
                  disabled={isComparing}
                  aria-label="Change original baseline document"
                  className="text-xs font-semibold text-blue-600 hover:underline shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
                >
                  Change
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="Select Original Document (Document A)"
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    fileInputARef.current?.click();
                  }
                }}
                onClick={() => fileInputARef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-slate-400 p-6 rounded-lg text-center cursor-pointer bg-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" aria-hidden="true" />
                <p className="text-xs font-bold text-slate-800">Select Original Document</p>
                <p className="text-[11px] text-slate-500 mt-0.5">PDF or TXT up to 10MB</p>
              </div>
            )}
          </div>

          {/* Document B (Revised) */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]" aria-hidden="true">
                  B
                </span>
                Revised Document (New Version)
              </span>
            </div>

            <input
              ref={fileInputBRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileB(e.target.files[0]);
                }
              }}
              disabled={isComparing}
              aria-label="Upload revised contract document"
              className="hidden"
            />

            {hasDocB && fileB ? (
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{fileB.name}</p>
                    <p className="text-[11px] text-slate-500">{formatFileSize(fileB.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputBRef.current?.click()}
                    disabled={isComparing}
                    aria-label="Change revised document"
                    className="text-xs font-semibold text-blue-600 hover:underline shrink-0 mr-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFileB(null);
                      if (fileInputBRef.current) fileInputBRef.current.value = '';
                    }}
                    aria-label="Remove revised document"
                    className="text-slate-400 hover:text-slate-600 p-1 rounded focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="Select Revised Document (Document B)"
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    fileInputBRef.current?.click();
                  }
                }}
                onClick={() => fileInputBRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-slate-400 p-6 rounded-lg text-center cursor-pointer bg-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              >
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" aria-hidden="true" />
                <p className="text-xs font-bold text-slate-800">Select Revised Document</p>
                <p className="text-[11px] text-slate-500 mt-0.5">PDF or TXT up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Semantic engine ignores whitespace and formatting differences to highlight actual contractual modifications.
          </p>

          <button
            type="button"
            onClick={() => handleRunComparison()}
            disabled={!hasDocA || !hasDocB || isComparing}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            {isComparing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Comparing Versions...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-4 h-4" aria-hidden="true" />
                <span>Compare Versions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-bold">Comparison Notice:</span> {error}
          </div>
        </div>
      )}

      {/* Multi-Stage Loading State */}
      {isComparing && (
        <div
          role="status"
          aria-live="polite"
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 animate-in fade-in duration-150"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Comparing Contract Versions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyzing material shifts in obligations, termination, compensation, and restrictions.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="w-full max-w-md bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-left">
              {comparisonSteps.map((stepText, idx) => {
                const isCurrent = idx === compareStep;
                const isDone = idx < compareStep;
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
        </div>
      )}

      {/* Meaningful Empty State */}
      {!comparison && !isComparing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <GitCompare className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No Comparison Run Yet</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload an Original Document and a Revised Document above to automatically highlight material changes, rights modifications, deadline extensions, and risk shifts.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleRunComparison(SAMPLE_DIFF_DOC_A, SAMPLE_DIFF_DOC_B)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Run Live Comparison (v1 vs v2)</span>
            </button>
            <button
              type="button"
              onClick={() => setComparison(SAMPLE_SMART_COMPARISON)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Preview Demo Results UI</span>
            </button>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && !isComparing && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Summary Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Revision Analysis
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  {comparison.changes.length} Material Changes
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Grounded semantic diff between Version A and Version B
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Comparison Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed mt-1 bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                {comparison.summary}
              </p>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter changes by clause, term, section, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(['ALL', 'REVIEW', 'IMPORTANT', 'INFORMATIONAL'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedAttention(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedAttention === lvl
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Changes' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Material Changes Cards */}
          {filteredChanges.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-600">
                No material changes match your search filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChanges.map((change, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border shadow-xs transition-all ${
                    change.attentionLevel === 'REVIEW'
                      ? 'border-amber-300 ring-1 ring-amber-100'
                      : change.attentionLevel === 'IMPORTANT'
                      ? 'border-blue-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 rounded-t-2xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <AttentionBadge level={change.attentionLevel} />
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {change.clause}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {change.sourceA && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          <FileText className="w-3 h-3 text-slate-400" />
                          Source A: {change.sourceA}
                        </span>
                      )}
                      {change.sourceB && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <FileText className="w-3 h-3 text-blue-500" />
                          Source B: {change.sourceB}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Before / After Visual Transition */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Visual Comparison Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      {/* Before */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Original Version (Doc A)
                        </span>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed shadow-xs">
                          {change.before || '(Not present in original)'}
                        </div>
                      </div>

                      {/* After */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 block">
                            Revised Version (Doc B)
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 hidden sm:inline">
                            Modified
                          </span>
                        </div>
                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 font-mono text-xs text-blue-950 font-semibold leading-relaxed shadow-xs">
                          {change.after || '(Removed in revision)'}
                        </div>
                      </div>
                    </div>

                    {/* Plain-Language Explanation */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Plain-Language Explanation
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {change.explanation}
                      </p>
                    </div>

                    {/* Why This May Matter */}
                    <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/70 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                        <span>Why This May Matter</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {change.whyItMatters}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
