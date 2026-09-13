'use client';

import React, { useState } from 'react';
import { ActionPlan, LegalObligation } from '@/lib/types';
import {
  CheckSquare,
  Square,
  Printer,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface ActionPlanTabProps {
  actionPlan?: ActionPlan;
  documentTitle: string;
  obligations?: LegalObligation[];
  itemsToClarify?: string[];
  questionsForProfessional?: string[];
}

export function ActionPlanTab({
  actionPlan,
  documentTitle,
  obligations = [],
  itemsToClarify = [],
  questionsForProfessional = [],
}: ActionPlanTabProps) {
  // Normalize checklist items
  const clarifyItems = itemsToClarify.length
    ? itemsToClarify.map((item, idx) => ({
        id: `clarify-${idx + 1}`,
        text: item,
      }))
    : (actionPlan?.highPriorityChecklist || []).map((item) => ({
        id: item.id,
        text: item.item,
      }));

  // Normalize questions
  const lawyerQuestions = questionsForProfessional.length
    ? questionsForProfessional.map((q, idx) => ({
        id: `q-${idx + 1}`,
        question: q,
        category: 'Legal Review',
        context: 'Identified from automated contractual clause inspection',
      }))
    : (actionPlan?.attorneyDiscussionQuestions || []).map((q, idx) => ({
        id: `q-${idx + 1}`,
        question: q.question,
        category: q.category,
        context: q.context,
      }));

  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleComplete = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuestions = () => {
    const text = lawyerQuestions
      .map((q, idx) => `${idx + 1}. [${q.category}] ${q.question}\n   Context: ${q.context}`)
      .join('\n\n');

    navigator.clipboard.writeText(
      `ClauseWise AI — Attorney Discussion Questions for ${documentTitle}\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  const totalClarify = clarifyItems.length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pre-Signing Preparation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Action Plan & Lawyer Preparation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Structured roadmap of core obligations, ambiguities to resolve, and targeted questions for your attorney.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={handleCopyQuestions}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Questions</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Lawyer Packet</span>
          </button>
        </div>
      </div>

      {/* GROUP 1: OBLIGATIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Obligations</h3>
              <p className="text-xs text-slate-500">Core duties, deliverables, and contractual commitments</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {obligations.length} identified
          </span>
        </div>

        {obligations.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No explicit party obligations extracted.</p>
        ) : (
          <div className="space-y-3">
            {obligations.map((ob, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-xs">
                      {ob.party || 'Signer'}
                    </span>
                  </div>
                  {ob.source && (
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {ob.source}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {ob.obligation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GROUP 2: THINGS TO CLARIFY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Things to Clarify</h3>
              <p className="text-xs text-slate-500">
                Points of ambiguity, missing terms, or conditions to confirm before signing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">
              {completedCount} of {totalClarify} addressed
            </span>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${totalClarify > 0 ? (completedCount / totalClarify) * 100 : 0}%`,
                }}
                className="h-full bg-emerald-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {clarifyItems.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No clarification points flagged.</p>
        ) : (
          <div className="space-y-2.5">
            {clarifyItems.map((item) => {
              const isDone = completedItems[item.id] ?? false;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleComplete(item.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                  >
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold leading-relaxed ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GROUP 3: QUESTIONS FOR A LEGAL PROFESSIONAL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Questions for a Legal Professional
              </h3>
              <p className="text-xs text-slate-500">
                Targeted legal inquiries to review with a licensed attorney
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {lawyerQuestions.length} questions
          </span>
        </div>

        {lawyerQuestions.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No attorney questions generated.</p>
        ) : (
          <div className="space-y-3">
            {lawyerQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {q.category}
                  </span>
                  <span className="text-xs font-bold text-slate-900">Question #{idx + 1}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  &quot;{q.question}&quot;
                </p>
                {q.context && (
                  <p className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <strong>Context:</strong> {q.context}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
