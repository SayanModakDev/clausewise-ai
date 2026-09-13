'use client';

import React, { useState } from 'react';
import { ActionPlan } from '@/lib/types';
import {
  CheckSquare,
  Square,
  HelpCircle,
  Printer,
  Copy,
  Check,
  AlertOctagon,
  FileCheck,
} from 'lucide-react';

interface ActionPlanTabProps {
  actionPlan: ActionPlan;
  documentTitle: string;
}

export function ActionPlanTab({ actionPlan, documentTitle }: ActionPlanTabProps) {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleComplete = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuestions = () => {
    const text = actionPlan.attorneyDiscussionQuestions
      .map(
        (q, idx) =>
          `${idx + 1}. [${q.category}] ${q.question}\n   Context: ${q.context}`
      )
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
  const totalItems = actionPlan.highPriorityChecklist.length;

  return (
    <div className="space-y-6">
      {/* Top Header & Print Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Lawyer Prep & Action Plan</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized checklist and targeted questions to review with a qualified legal professional before signing.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handleCopyQuestions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Questions</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Lawyer Packet</span>
          </button>
        </div>
      </div>

      {/* Signing Readiness & Key Blockers */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Signing Readiness Assessment
          </span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {actionPlan.signingReadiness.assessment}
          </span>
        </div>

        {actionPlan.signingReadiness.keyBlockers.length > 0 && (
          <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-700" />
              <span>Items Requiring Resolution or Legal Guidance:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-800 pl-1">
              {actionPlan.signingReadiness.keyBlockers.map((blocker, idx) => (
                <li key={idx}>{blocker}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* High-Priority Negotiation Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Pre-Signing Verification Checklist</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Completed {completedCount} of {totalItems} items
            </p>
          </div>
          <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${totalItems > 0 ? (completedCount / totalItems) * 100 : 0}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
            />
          </div>
        </div>

        <div className="space-y-3">
          {actionPlan.highPriorityChecklist.map((item) => {
            const isDone = completedItems[item.id] ?? item.completed ?? false;

            return (
              <div
                key={item.id}
                onClick={() => toggleComplete(item.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                  isDone
                    ? 'bg-slate-50/80 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-500 hover:text-emerald-600 transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.item}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attorney Discussion Questions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Targeted Attorney Discussion Questions ({actionPlan.attorneyDiscussionQuestions.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">Organized by Legal Domain</span>
        </div>

        <div className="space-y-3">
          {actionPlan.attorneyDiscussionQuestions.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-slate-900">Question #{idx + 1}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-snug">
                &quot;{item.question}&quot;
              </p>
              <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                <strong>Context:</strong> {item.context}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
