'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Informational Legal Assistance Only:</strong> ClauseWise AI explains contract clauses in plain language and does not provide legal advice, representation, or enforceability determinations. Always consult a qualified attorney for specific legal counsel.
          </span>
        </div>
      </div>
    </div>
  );
}
