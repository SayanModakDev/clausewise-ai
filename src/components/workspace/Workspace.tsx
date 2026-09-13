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
import {
  FileText,
  Search,
  MessageSquare,
  GitCompare,
  CheckCircle,
  Plus,
} from 'lucide-react';

type WorkspaceTab = 'OVERVIEW' | 'CLAUSES' | 'ASK' | 'COMPARE' | 'ACTION_PLAN';

export function Workspace() {
  // Empty landing state on initial visit
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedUpload, setProcessedUpload] = useState<ProcessedUpload | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('OVERVIEW');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Core file analysis handler triggering the real /api/analyze backend
  const handleFileAnalysis = async (fileToAnalyze?: File | null) => {
    const targetFile = fileToAnalyze || selectedFile;
    if (!targetFile) {
      setAnalysisError('Please select a PDF or plain text document first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      formData.append('file', targetFile);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Document analysis failed. Please try again.');
      }

      if (data.document && data.overview) {
        setAnalysis({
          documentId: data.document.id,
          fileName: data.document.fileName,
          fileUri: data.document.fileUri,
          mimeType: data.document.mimeType,
          fileSize: data.document.fileSize,
          analyzedAt: data.document.analyzedAt,
          textContent: data.document.textContent,
          analysis: data.analysis,
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

      setActiveTab('OVERVIEW');
    } catch (err: unknown) {
      setAnalysisError(
        err instanceof Error ? err.message : 'An unexpected error occurred during document analysis.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Sample contract 1-click test handler
  const handleSampleSelect = async (sampleName: string, sampleText: string) => {
    const file = new File([sampleText], sampleName, { type: 'text/plain' });
    setSelectedFile(file);
    await handleFileAnalysis(file);
  };

  // Reset to landing / empty state
  const handleNewAnalysis = () => {
    setAnalysis(null);
    setSelectedFile(null);
    setProcessedUpload(undefined);
    setAnalysisError(null);
    setActiveTab('OVERVIEW');
  };

  const reviewCount = analysis?.overview?.riskProfile?.reviewCount ?? 0;
  const documentType = analysis?.overview?.documentType || analysis?.analysis?.documentType;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Persistent Legal Notice Banner */}
      <DisclaimerBanner />

      {/* Main Navbar */}
      <Navbar
        currentDocumentName={analysis?.fileName}
        detectedType={documentType}
        onNewAnalysis={handleNewAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!analysis ? (
          /* Landing / Empty State */
          <DocumentUploader
            selectedFile={selectedFile}
            onFileSelect={(file) => {
              setSelectedFile(file);
              setAnalysisError(null);
            }}
            onAnalyze={() => handleFileAnalysis(selectedFile)}
            onSampleSelect={handleSampleSelect}
            isAnalyzing={isAnalyzing}
            error={analysisError}
            onRetry={() => handleFileAnalysis(selectedFile)}
          />
        ) : (
          /* Analysis Workspace */
          <div className="space-y-6">
            {/* Workspace Sub-header with Document Title & Type */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active Contract
                  </span>
                  {documentType && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {documentType}
                    </span>
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 truncate">
                  {analysis.overview?.title || analysis.fileName}
                </h1>
              </div>

              <div className="flex items-center gap-2 shrink-0 no-print">
                <button
                  onClick={handleNewAnalysis}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>New Analysis</span>
                </button>
              </div>
            </div>

            {/* 5-Tab Navigation Bar */}
            <div
              role="tablist"
              aria-label="Document analysis sections"
              className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto no-print"
            >
              <button
                role="tab"
                id="tab-overview"
                aria-selected={activeTab === 'OVERVIEW'}
                aria-controls="panel-overview"
                tabIndex={activeTab === 'OVERVIEW' ? 0 : -1}
                onClick={() => setActiveTab('OVERVIEW')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Overview</span>
              </button>

              <button
                role="tab"
                id="tab-clauses"
                aria-selected={activeTab === 'CLAUSES'}
                aria-controls="panel-clauses"
                tabIndex={activeTab === 'CLAUSES' ? 0 : -1}
                onClick={() => setActiveTab('CLAUSES')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none ${
                  activeTab === 'CLAUSES'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clauses</span>
                {reviewCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      activeTab === 'CLAUSES'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {reviewCount} Review
                  </span>
                )}
              </button>

              <button
                role="tab"
                id="tab-ask"
                aria-selected={activeTab === 'ASK'}
                aria-controls="panel-ask"
                tabIndex={activeTab === 'ASK' ? 0 : -1}
                onClick={() => setActiveTab('ASK')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none ${
                  activeTab === 'ASK'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ask</span>
              </button>

              <button
                role="tab"
                id="tab-compare"
                aria-selected={activeTab === 'COMPARE'}
                aria-controls="panel-compare"
                tabIndex={activeTab === 'COMPARE' ? 0 : -1}
                onClick={() => setActiveTab('COMPARE')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none ${
                  activeTab === 'COMPARE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Compare</span>
              </button>

              <button
                role="tab"
                id="tab-action-plan"
                aria-selected={activeTab === 'ACTION_PLAN'}
                aria-controls="panel-action-plan"
                tabIndex={activeTab === 'ACTION_PLAN' ? 0 : -1}
                onClick={() => setActiveTab('ACTION_PLAN')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none ${
                  activeTab === 'ACTION_PLAN'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Action Plan</span>
              </button>
            </div>

            {/* Tab Views */}
            <div
              role="tabpanel"
              id={`panel-${activeTab.toLowerCase().replace('_', '-')}`}
              aria-labelledby={`tab-${activeTab.toLowerCase().replace('_', '-')}`}
              tabIndex={0}
              className="transition-all duration-150 focus-visible:outline-none"
            >
              {activeTab === 'OVERVIEW' && analysis.overview && (
                <OverviewTab
                  overview={analysis.overview}
                  analysis={analysis.analysis || analysis.rawAnalysis}
                />
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
                  documentTitle={analysis.overview?.title || analysis.fileName}
                />
              )}

              {activeTab === 'COMPARE' && (
                <CompareTab currentUpload={processedUpload} />
              )}

              {activeTab === 'ACTION_PLAN' && (
                <ActionPlanTab
                  actionPlan={analysis.actionPlan}
                  documentTitle={analysis.overview?.title || analysis.fileName}
                  obligations={analysis.analysis?.obligations || analysis.rawAnalysis?.obligations}
                  itemsToClarify={analysis.analysis?.itemsToClarify || analysis.rawAnalysis?.itemsToClarify}
                  questionsForProfessional={
                    analysis.analysis?.questionsForProfessional ||
                    analysis.rawAnalysis?.questionsForProfessional
                  }
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Screen Reader Live Loading Announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {isAnalyzing ? 'Analyzing contract document with ClauseWise AI. Please wait.' : ''}
      </div>

      {/* Footer with Persistent Legal Notice & Truthful Privacy Disclosure */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ClauseWise AI</span>
            <span>—</span>
            <span>Understand the document before you sign it.</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-xl text-center sm:text-right leading-relaxed">
            Informational assistance only. Not legal advice. Documents are transmitted to Google Gemini for AI analysis and may be temporarily retained by the processing service. ClauseWise does not maintain its own document database.
          </p>
        </div>
      </footer>
    </div>
  );
}
