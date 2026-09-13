'use client';

import React, { useState, useMemo } from 'react';
import { ClauseItem, AttentionLevel, ClauseCategory } from '@/lib/types';
import { AttentionBadge } from '@/components/common/AttentionBadge';
import {
  Search,
  Filter,
  Quote,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

interface ClauseInspectorTabProps {
  clauses: ClauseItem[];
}

export function ClauseInspectorTab({ clauses }: ClauseInspectorTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttention, setSelectedAttention] = useState<AttentionLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ClauseCategory | 'ALL'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    // Expand REVIEW and IMPORTANT by default
    const initial: Record<string, boolean> = {};
    clauses.forEach((c) => {
      if (c.attentionLevel === 'REVIEW' || c.attentionLevel === 'IMPORTANT') {
        initial[c.id] = true;
      }
    });
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = useMemo(() => {
    const set = new Set<ClauseCategory>();
    clauses.forEach((c) => set.add(c.category));
    return Array.from(set);
  }, [clauses]);

  const filteredClauses = useMemo(() => {
    return clauses.filter((clause) => {
      if (selectedAttention !== 'ALL' && clause.attentionLevel !== selectedAttention) {
        return false;
      }
      if (selectedCategory !== 'ALL' && clause.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = clause.title.toLowerCase().includes(q);
        const matchesPlain = clause.plainExplanation.toLowerCase().includes(q);
        const matchesQuote = clause.sourceQuote.toLowerCase().includes(q);
        const matchesImplications = clause.practicalImplications.toLowerCase().includes(q);
        return matchesTitle || matchesPlain || matchesQuote || matchesImplications;
      }
      return true;
    });
  }, [clauses, selectedAttention, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clauses, terms, numbers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Attention Level Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'REVIEW', 'IMPORTANT', 'INFORMATIONAL'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedAttention(lvl)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedAttention === lvl
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'ALL' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2 py-0.5 rounded-md shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-100 text-blue-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({clauses.length})
          </button>
          {categories.map((cat) => {
            const count = clauses.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-100 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredClauses.length}</strong> of {clauses.length} clauses
        </span>
        <button
          onClick={() => {
            const allExpanded = Object.keys(expandedIds).length === clauses.length;
            const next: Record<string, boolean> = {};
            if (!allExpanded) {
              clauses.forEach((c) => (next[c.id] = true));
            }
            setExpandedIds(next);
          }}
          className="text-blue-600 hover:underline font-medium"
        >
          {Object.keys(expandedIds).length === clauses.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Clause Cards */}
      {filteredClauses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No clauses match your current filter</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search or changing the attention level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClauses.map((clause) => {
            const isExpanded = expandedIds[clause.id] ?? false;

            return (
              <div
                key={clause.id}
                className={`bg-white rounded-xl border transition-all ${
                  clause.attentionLevel === 'REVIEW'
                    ? 'border-amber-300 shadow-xs'
                    : clause.attentionLevel === 'IMPORTANT'
                    ? 'border-blue-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Header / Summary row */}
                <div
                  onClick={() => toggleExpand(clause.id)}
                  className="p-4 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-slate-50/50 rounded-xl"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AttentionBadge level={clause.attentionLevel} />
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {clause.category}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {clause.title}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {clause.plainExplanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1 text-slate-400">
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      {isExpanded ? 'Hide details' : 'View excerpt'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4 text-xs">
                    {/* Practical Implications */}
                    {clause.practicalImplications && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold mb-1">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                          <span>Practical Meaning for the Signer</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {clause.practicalImplications}
                        </p>
                      </div>
                    )}

                    {/* Verbatim Source Quote Box */}
                    <div className="bg-amber-50/40 p-3.5 rounded-lg border border-amber-200/80">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold mb-1.5">
                        <Quote className="w-3.5 h-3.5 text-amber-700" />
                        <span className="text-[11px] uppercase tracking-wider text-amber-900 font-bold">
                          Verbatim Contract Text (Source)
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-800 bg-white/80 p-2.5 rounded border border-amber-200/60 leading-relaxed whitespace-pre-wrap">
                        {clause.sourceQuote}
                      </p>
                    </div>

                    {/* Suggested Questions */}
                    {clause.suggestedQuestions && clause.suggestedQuestions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Targeted Questions to Ask</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                          {clause.suggestedQuestions.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
