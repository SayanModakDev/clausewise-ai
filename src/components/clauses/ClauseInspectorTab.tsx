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
  FileText,
} from 'lucide-react';

interface ClauseInspectorTabProps {
  clauses?: ClauseItem[];
}

export function ClauseInspectorTab({ clauses = [] }: ClauseInspectorTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttention, setSelectedAttention] = useState<AttentionLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ClauseCategory | 'ALL'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    // Expand REVIEW and IMPORTANT by default for best scannability
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
    clauses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
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
        const matchesSource = clause.source?.toLowerCase().includes(q);
        return matchesTitle || matchesPlain || matchesQuote || matchesImplications || Boolean(matchesSource);
      }
      return true;
    });
  }, [clauses, selectedAttention, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Filter Options */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clauses, terms, numbers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search and filter clauses by topic, phrase, or section"
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Attention Level Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'REVIEW', 'IMPORTANT', 'INFORMATIONAL'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedAttention(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
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
        {categories.length > 0 && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 overflow-x-auto text-xs pb-1">
            <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-md shrink-0 font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-100 text-blue-900 font-bold'
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
                  className={`px-2.5 py-1 rounded-md shrink-0 font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-100 text-blue-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header & Expand/Collapse All */}
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
          aria-label={Object.keys(expandedIds).length === clauses.length ? 'Collapse all clause details' : 'Expand all clause details'}
          className="text-blue-600 hover:underline font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
        >
          {Object.keys(expandedIds).length === clauses.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Clause Cards List */}
      {filteredClauses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No clauses match your current filter</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or switching attention level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClauses.map((clause) => {
            const isExpanded = expandedIds[clause.id] ?? false;

            return (
              <div
                key={clause.id}
                className={`bg-white rounded-2xl border transition-all ${
                  clause.attentionLevel === 'REVIEW'
                    ? 'border-amber-300 shadow-xs ring-1 ring-amber-100'
                    : clause.attentionLevel === 'IMPORTANT'
                    ? 'border-blue-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-controls={`clause-details-${clause.id}`}
                  onClick={() => toggleExpand(clause.id)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleExpand(clause.id);
                    }
                  }}
                  className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-slate-50/60 rounded-2xl transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Attention Badge */}
                      <AttentionBadge level={clause.attentionLevel} />

                      {/* Source/Section */}
                      {clause.source && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          <FileText className="w-3 h-3 text-slate-500" aria-hidden="true" />
                          {clause.source}
                        </span>
                      )}

                      {/* Category */}
                      {clause.category && (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                          {clause.category}
                        </span>
                      )}
                    </div>

                    {/* Clause Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {clause.title}
                    </h3>

                    {/* Plain-Language Explanation */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {clause.plainExplanation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1 text-slate-400">
                    <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
                      {isExpanded ? 'Hide details' : 'View full text'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" aria-hidden="true" />
                    )}
                  </div>
                </div>

                {/* Expanded Details: Source Text & Why It Matters */}
                {isExpanded && (
                  <div
                    id={`clause-details-${clause.id}`}
                    className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs animate-in fade-in duration-150"
                  >
                    {/* Why It Matters */}
                    {clause.practicalImplications && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-1.5">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          <span>Why It Matters (Practical Meaning for Signer)</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {clause.practicalImplications}
                        </p>
                      </div>
                    )}

                    {/* Original Source Text Quote */}
                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-2">
                        <Quote className="w-4 h-4 text-amber-700" />
                        <span className="text-[11px] uppercase tracking-wider text-amber-900 font-extrabold">
                          Original Source Text {clause.source ? `(${clause.source})` : ''}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-900 bg-white/90 p-3 rounded-lg border border-amber-200/60 leading-relaxed whitespace-pre-wrap">
                        &quot;{clause.sourceQuote}&quot;
                      </p>
                    </div>

                    {/* Suggested Questions */}
                    {clause.suggestedQuestions && clause.suggestedQuestions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <HelpCircle className="w-4 h-4 text-indigo-600" />
                          <span>Suggested Questions to Raise</span>
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
