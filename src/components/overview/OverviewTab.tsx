'use client';

import React from 'react';
import { DocumentOverview, DocumentAnalysisData } from '@/lib/types';
import {
  FileText,
  Users,
  Calendar,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Info,
  Tag,
} from 'lucide-react';

interface OverviewTabProps {
  overview: DocumentOverview;
  analysis?: DocumentAnalysisData;
}

export function OverviewTab({ overview, analysis }: OverviewTabProps) {
  const { informationalCount, importantCount, reviewCount } = overview.riskProfile;
  const totalCount = informationalCount + importantCount + reviewCount || 1;

  // Use rawAnalysis dates/financial terms/obligations if available to show exact sources
  const dates = analysis?.importantDates?.length
    ? analysis.importantDates.map((d) => ({
        label: d.label,
        value: d.value,
        source: d.source,
      }))
    : overview.keyDates.map((d) => ({
        label: d.label,
        value: d.date,
        source: d.description,
      }));

  const finances = analysis?.financialTerms?.length
    ? analysis.financialTerms.map((f) => ({
        label: f.label,
        value: f.value,
        source: f.source,
      }))
    : overview.financialTerms.map((f) => ({
        label: f.label,
        value: f.amountOrRate,
        source: f.description,
      }));

  const obligations = analysis?.obligations?.length
    ? analysis.obligations.map((o) => ({
        party: o.party || 'Signer',
        obligation: o.obligation,
        source: o.source,
      }))
    : overview.coreObligations.map((o) => ({
        party: o.party,
        obligation: o.obligation,
        source: undefined,
      }));

  return (
    <div className="space-y-6">
      {/* 1. Document at a Glance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Document at a Glance
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                <Tag className="w-3 h-3 text-slate-500" />
                {overview.documentType || 'Legal Document'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
              {overview.title}
            </h2>
          </div>

          {/* Attention Badge Counts */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block leading-tight">
                  Review
                </span>
                <span className="text-sm font-extrabold text-amber-950">{reviewCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-2 rounded-xl">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block leading-tight">
                  Important
                </span>
                <span className="text-sm font-extrabold text-blue-950">{importantCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block leading-tight">
                  Informational
                </span>
                <span className="text-sm font-extrabold text-slate-900">{informationalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attention Distribution Bar */}
        <div>
          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-700">Clause Attention Distribution</span>
            <span>{reviewCount + importantCount + informationalCount} substantive provisions analyzed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(reviewCount / totalCount) * 100}%` }}
              className="bg-amber-500 transition-all duration-300"
              title={`${reviewCount} Review provisions`}
            />
            <div
              style={{ width: `${(importantCount / totalCount) * 100}%` }}
              className="bg-blue-600 transition-all duration-300"
              title={`${importantCount} Important provisions`}
            />
            <div
              style={{ width: `${(informationalCount / totalCount) * 100}%` }}
              className="bg-slate-300 transition-all duration-300"
              title={`${informationalCount} Informational provisions`}
            />
          </div>

          <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 font-semibold">Grounded Risk Profile:</strong>{' '}
            {overview.riskProfile.summary}
          </div>
        </div>
      </div>

      {/* 2. Executive Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3>Plain-Language Summary</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          {overview.executiveSummary}
        </p>
      </div>

      {/* 3. Grid: Identified Parties & Important Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Parties */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3>Identified Parties ({overview.parties.length})</h3>
          </div>
          <div className="space-y-3">
            {overview.parties.map((party, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900">{party.name}</span>
                  <span className="text-[11px] px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-semibold shrink-0">
                    {party.role}
                  </span>
                </div>
                {party.details && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{party.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Important Dates */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3>Important Dates & Deadlines</h3>
          </div>
          <div className="space-y-3">
            {dates.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70"
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                  {item.source && (
                    <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                      {item.source}
                    </span>
                  )}
                </div>
                <span className="text-xs font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shrink-0 shadow-xs">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Financial & Payment Terms */}
      {finances.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3>Financial & Payment Terms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {finances.map((term, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                    {term.label}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 mt-1 block">
                    {term.value}
                  </span>
                </div>
                {term.source && (
                  <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2 line-clamp-2">
                    {term.source}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Important Obligations */}
      {obligations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3>Important Obligations</h3>
          </div>
          <div className="space-y-3">
            {obligations.map((ob, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70"
              >
                <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shrink-0 shadow-xs">
                  {ob.party}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {ob.obligation}
                  </p>
                  {ob.source && (
                    <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                      Ref: {ob.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
