'use client';

import React from 'react';
import { DocumentOverview } from '@/lib/types';
import {
  FileText,
  Users,
  Calendar,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface OverviewTabProps {
  overview: DocumentOverview;
}

export function OverviewTab({ overview }: OverviewTabProps) {
  const { informationalCount, importantCount, reviewCount } = overview.riskProfile;
  const totalCount = informationalCount + importantCount + reviewCount || 1;

  return (
    <div className="space-y-6">
      {/* Risk Profile & Attention Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Document Type</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {overview.documentType || 'Legal Agreement'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{overview.title}</h3>
          </div>

          {/* Attention Badges Count */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-700 block leading-none">Review</span>
                <span className="text-sm font-bold text-amber-900">{reviewCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-blue-700 block leading-none">Important</span>
                <span className="text-sm font-bold text-blue-900">{importantCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Info className="w-4 h-4 text-slate-500" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-600 block leading-none">Info</span>
                <span className="text-sm font-bold text-slate-800">{informationalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attention distribution bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
            <span className="font-medium">Clause Attention Distribution</span>
            <span>{reviewCount + importantCount + informationalCount} substantive clauses analyzed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(reviewCount / totalCount) * 100}%` }}
              className="bg-amber-500 transition-all"
              title={`${reviewCount} Review Clauses`}
            />
            <div
              style={{ width: `${(importantCount / totalCount) * 100}%` }}
              className="bg-blue-600 transition-all"
              title={`${importantCount} Important Clauses`}
            />
            <div
              style={{ width: `${(informationalCount / totalCount) * 100}%` }}
              className="bg-slate-400 transition-all"
              title={`${informationalCount} Informational Clauses`}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            <strong>Risk Assessment:</strong> {overview.riskProfile.summary}
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-base">
          <FileText className="w-4 h-4 text-blue-600" />
          <h4>Plain-Language Executive Summary</h4>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {overview.executiveSummary}
        </p>
      </div>

      {/* Grid: Parties & Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Parties */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-base">
            <Users className="w-4 h-4 text-indigo-600" />
            <h4>Identified Parties ({overview.parties.length})</h4>
          </div>
          <div className="space-y-3">
            {overview.parties.map((party, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">{party.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-medium">
                    {party.role}
                  </span>
                </div>
                {party.details && (
                  <p className="text-xs text-slate-500 mt-1">{party.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Vital Dates */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-base">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h4>Vital Dates & Deadlines</h4>
          </div>
          <div className="space-y-3">
            {overview.keyDates.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">{item.label}</span>
                  <span className="text-xs text-slate-500">{item.description}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shrink-0 ml-2">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial & Payment Terms */}
      {overview.financialTerms.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-base">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <h4>Payment & Financial Terms</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {overview.financialTerms.map((term, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-500 block">{term.label}</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{term.amountOrRate}</span>
                <p className="text-xs text-slate-600 mt-1">{term.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Obligations */}
      {overview.coreObligations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold text-base">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <h4>Core Commitments & Obligations</h4>
          </div>
          <div className="space-y-2.5">
            {overview.coreObligations.map((ob, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                  {ob.party}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{ob.obligation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
