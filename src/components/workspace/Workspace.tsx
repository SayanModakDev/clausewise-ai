'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { OverviewTab } from '@/components/overview/OverviewTab';
import { ClauseInspectorTab } from '@/components/clauses/ClauseInspectorTab';
import { ChatTab } from '@/components/chat/ChatTab';
import { CompareTab } from '@/components/compare/CompareTab';
import { ActionPlanTab } from '@/components/action-plan/ActionPlanTab';
import { DocumentAnalysisResult, ProcessedUpload } from '@/lib/types';
import { SAMPLE_INITIAL_ANALYSIS, SAMPLE_CONSULTING_CONTRACT_TEXT } from '@/lib/sample-data';
import {
  FileText,
  Search,
  MessageSquare,
  GitCompare,
  CheckCircle,
  X,
} from 'lucide-react';

type WorkspaceTab = 'OVERVIEW' | 'CLAUSES' | 'ASK' | 'COMPARE' | 'ACTION_PLAN';

export function Workspace() {
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(SAMPLE_INITIAL_ANALYSIS);
  const [processedUpload, setProcessedUpload] = useState<ProcessedUpload | undefined>({
    mimeType: 'text/plain',
    textContent: SAMPLE_CONSULTING_CONTRACT_TEXT,
    originalName: 'Independent_Consulting_Agreement_Apex.txt',
    size: 4280,
  });
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('OVERVIEW');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Handle upload of file (PDF or TXT)
  const handleFileAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Document analysis failed.');
      }

      if (data.document && data.overview) {
        setAnalysis({
          documentId: data.document.id,
          fileName: data.document.fileName,
          fileUri: data.document.fileUri,
          mimeType: data.document.mimeType,
          fileSize: data.document.fileSize,
          analyzedAt: data.document.analyzedAt,
          rawAnalysis: data.analysis,
          overview: data.overview,
          clauses: data.clauses,
          actionPlan: data.actionPlan,
        });
        setProcessedUpload({
          fileUri: data.document.fileUri,
          mimeType: data.document.mimeType,
          textContent: data.document.textContent,
          originalName: data.document.fileName,
          size: data.document.fileSize,
        });
      } else {
        setAnalysis(data.analysis);
        setProcessedUpload(data.processedUpload);
      }
      setShowUploadModal(false);
      setActiveTab('OVERVIEW');
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle sample selection with real live Gemini analysis
  const handleSampleSelect = async (sampleName: string, sampleText: string) => {
    const file = new File([sampleText], sampleName, { type: 'text/plain' });
    await handleFileAnalysis(file);
  };

  const reviewCount = analysis?.overview.riskProfile.reviewCount ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DisclaimerBanner />
      <Navbar
        currentDocumentName={analysis?.fileName}
        onOpenUpload={() => setShowUploadModal(true)}
        onResetDocument={() => {
          setAnalysis(null);
          setShowUploadModal(true);
        }}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!analysis || showUploadModal ? (
          <div className="relative">
            {analysis && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg"
                >
                  <X className="w-4 h-4" />
                  <span>Return to current document</span>
                </button>
              </div>
            )}
            <DocumentUploader
              onFileSelect={handleFileAnalysis}
              onSampleSelect={handleSampleSelect}
              isAnalyzing={isAnalyzing}
              error={analysisError}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* 5-Tab Navigation Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto no-print">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('CLAUSES')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeTab === 'CLAUSES'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Clause Inspector</span>
                {reviewCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === 'CLAUSES'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reviewCount} Review
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('ASK')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeTab === 'ASK'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Document</span>
              </button>

              <button
                onClick={() => setActiveTab('COMPARE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeTab === 'COMPARE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Versions</span>
              </button>

              <button
                onClick={() => setActiveTab('ACTION_PLAN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeTab === 'ACTION_PLAN'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Action Plan / Lawyer Prep</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="transition-all">
              {activeTab === 'OVERVIEW' && (
                <OverviewTab overview={analysis.overview} />
              )}

              {activeTab === 'CLAUSES' && (
                <ClauseInspectorTab clauses={analysis.clauses} />
              )}

              {activeTab === 'ASK' && (
                <ChatTab
                  documentId={analysis.documentId}
                  fileUri={processedUpload?.fileUri}
                  mimeType={processedUpload?.mimeType}
                  textContent={processedUpload?.textContent}
                  documentTitle={analysis.overview.title}
                />
              )}

              {activeTab === 'COMPARE' && (
                <CompareTab currentUpload={processedUpload} />
              )}

              {activeTab === 'ACTION_PLAN' && (
                <ActionPlanTab
                  actionPlan={analysis.actionPlan}
                  documentTitle={analysis.overview.title}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer with Persistent Legal Notice */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ClauseWise AI</span>
            <span>—</span>
            <span>Understand the document before you sign it.</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Informational assistance only. Not legal advice. Model: gemini-3.8-flash.
          </p>
        </div>
      </footer>
    </div>
  );
}
