'use client';

import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <aside
      aria-label="Legal disclaimer and privacy disclosure"
      className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="leading-snug">
            <strong className="text-white font-semibold">Informational Assistance Only:</strong> ClauseWise AI explains contract provisions in plain language and does not provide formal legal advice, representation, or enforceability determinations. Consult a licensed attorney for binding legal counsel.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300 md:shrink-0">
          <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-slate-200">Privacy Notice:</strong> Documents are transmitted to Google Gemini for AI analysis and may be temporarily retained by the processing service. ClauseWise maintains no document database.
          </span>
        </div>
      </div>
    </aside>
  );
}
