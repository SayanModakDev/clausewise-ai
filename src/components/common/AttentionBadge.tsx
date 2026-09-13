'use client';

import React from 'react';
import { AttentionLevel } from '@/lib/types';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react';

interface AttentionBadgeProps {
  level: AttentionLevel;
  className?: string;
  showIcon?: boolean;
}

export function AttentionBadge({ level, className = '', showIcon = true }: AttentionBadgeProps) {
  switch (level) {
    case 'REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          REVIEW
        </span>
      );
    case 'IMPORTANT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
          IMPORTANT
        </span>
      );
    case 'INFORMATIONAL':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {showIcon && <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          INFORMATIONAL
        </span>
      );
  }
}
