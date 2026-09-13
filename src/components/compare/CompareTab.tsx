'use client';

import React, { useState } from 'react';
import { DocumentComparisonResult, ProcessedUpload } from '@/lib/types';
import { SAMPLE_COMPARISON_RESULT } from '@/lib/sample-data';
import { AttentionBadge } from '@/components/common/AttentionBadge';
import {
  GitCompare,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface CompareTabProps {
  currentUpload?: ProcessedUpload;
}

export function CompareTab({ currentUpload }: CompareTabProps) {
  const [comparison, setComparison] = useState<DocumentComparisonResult | null>(SAMPLE_COMPARISON_RESULT);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunComparison = async () => {
    if (!fileB) {
      setError('Please select a second document (Version B) to compare.');
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const formData = new FormData();
      if (currentUpload?.textContent) {
        formData.append('docA_text', currentUpload.textContent);
      }
      formData.append('fileB', fileB);

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docA: {
            textContent: currentUpload?.textContent || 'Current Document',
            fileUri: currentUpload?.fileUri,
            mimeType: currentUpload?.mimeType || 'text/plain',
            originalName: currentUpload?.originalName || 'Document A',
          },
          docB: {
            textContent: await fileB.text(),
            originalName: fileB.name,
            mimeType: fileB.type || 'text/plain',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to compare documents.');
      }

      setComparison(data.comparison);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Comparison failed.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compare Header & Upload Revision */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Smart Document Comparison</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Compare two versions or draft revisions to detect added obligations, deleted rights, and subtle risk shifts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparison(SAMPLE_COMPARISON_RESULT)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Diff
            </button>
          </div>
        </div>

        {/* Upload Revision Secondary Bar */}
        <div className="mt-4 pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full text-xs">
            <label className="block text-slate-600 font-medium mb-1">
              Upload Revision / Version B to compare against active document:
            </label>
            <input
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={(e) => setFileB(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
            />
          </div>

          <button
            onClick={handleRunComparison}
            disabled={!fileB || isComparing}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 self-end shadow-xs"
          >
            {isComparing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Comparing Versions...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Versions</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Summary & Risk Shift Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Summary of Changes
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {comparison.summaryOfChanges}
              </p>
            </div>

            <div className="bg-amber-50/50 rounded-xl border border-amber-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Risk Shift Overview
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {comparison.riskShiftSummary}
              </p>
            </div>
          </div>

          {/* Modified Clauses */}
          {comparison.modifiedClauses.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Modified Clauses ({comparison.modifiedClauses.length})
                </h4>
                <span className="text-xs text-slate-500">Redline & Shift Analysis</span>
              </div>

              <div className="space-y-4">
                {comparison.modifiedClauses.map((clause, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-xs text-slate-900">{clause.title}</span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          clause.riskShift === 'Favors Signer'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : clause.riskShift === 'Increased Risk' || clause.riskShift === 'Favors Other Party'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {clause.riskShift}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      <strong>Impact:</strong> {clause.changeExplanation}
                    </p>

                    {/* Excerpt Comparison Side-by-Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-3 bg-rose-50/50 border border-rose-200/70 rounded-lg">
                        <span className="font-bold uppercase text-rose-800 text-[10px] block mb-1">
                          Previous Version Excerpt:
                        </span>
                        <p className="font-mono text-slate-700 whitespace-pre-wrap">{clause.beforeExcerpt}</p>
                      </div>

                      <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-lg">
                        <span className="font-bold uppercase text-emerald-800 text-[10px] block mb-1">
                          Revision Version Excerpt:
                        </span>
                        <p className="font-mono text-slate-700 whitespace-pre-wrap">{clause.afterExcerpt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added & Removed Clauses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Added Clauses */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <PlusCircle className="w-4 h-4" />
                <h4>Added Clauses ({comparison.addedClauses.length})</h4>
              </div>

              {comparison.addedClauses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No new clauses added.</p>
              ) : (
                comparison.addedClauses.map((clause, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{clause.title}</span>
                      <AttentionBadge level={clause.attentionLevel} />
                    </div>
                    <p className="text-xs text-slate-600">{clause.explanation}</p>
                  </div>
                ))
              )}
            </div>

            {/* Removed Clauses */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <MinusCircle className="w-4 h-4" />
                <h4>Removed Clauses ({comparison.removedClauses.length})</h4>
              </div>

              {comparison.removedClauses.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No clauses removed.</p>
              ) : (
                comparison.removedClauses.map((clause, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-rose-50/40 border border-rose-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{clause.title}</span>
                      <AttentionBadge level={clause.attentionLevel} />
                    </div>
                    <p className="text-xs text-slate-600">{clause.explanation}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
