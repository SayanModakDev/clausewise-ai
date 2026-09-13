export type AttentionLevel = 'INFORMATIONAL' | 'IMPORTANT' | 'REVIEW';

export interface ImportantDate {
  label: string;
  value: string;
  source?: string;
}

export interface FinancialTermItem {
  label: string;
  value: string;
  source?: string;
}

export interface LegalObligation {
  party?: string;
  obligation: string;
  source?: string;
}

export interface LegalClause {
  title: string;
  source: string | null;
  originalText: string;
  plainLanguage: string;
  attentionLevel: AttentionLevel;
  whyItMatters: string;
}

/**
 * Structured document-grounded legal analysis output from Gemini 3.8 Flash
 */
export interface DocumentAnalysisData {
  documentType: string;
  summary: string;
  parties: string[];
  importantDates: ImportantDate[];
  financialTerms: FinancialTermItem[];
  obligations: LegalObligation[];
  clauses: LegalClause[];
  itemsToClarify: string[];
  questionsForProfessional: string[];
}

export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileUri?: string;
  mimeType: string;
  fileSize: number;
  analyzedAt: string;
  textContent?: string;
}

// Retain legacy interface aliases for UI view compatibility
export interface DocumentParty {
  name: string;
  role: string;
  details?: string;
}

export interface DocumentDate {
  label: string;
  date: string;
  description: string;
}

export interface FinancialTerm {
  label: string;
  amountOrRate: string;
  description: string;
}

export interface DocumentObligation {
  party: string;
  obligation: string;
}

export interface DocumentOverview {
  title: string;
  documentType: string;
  executiveSummary: string;
  parties: DocumentParty[];
  keyDates: DocumentDate[];
  financialTerms: FinancialTerm[];
  coreObligations: DocumentObligation[];
  riskProfile: {
    summary: string;
    informationalCount: number;
    importantCount: number;
    reviewCount: number;
  };
}

export type ClauseCategory =
  | 'Termination'
  | 'Liability & Indemnification'
  | 'Intellectual Property'
  | 'Payment & Fees'
  | 'Confidentiality'
  | 'Governing Law & Dispute Resolution'
  | 'Warranties & Disclaimers'
  | 'Non-Compete & Restrictive Covenants'
  | 'General & Miscellaneous';

export interface ClauseItem {
  id: string;
  title: string;
  category: ClauseCategory;
  attentionLevel: AttentionLevel;
  plainExplanation: string;
  sourceQuote: string;
  practicalImplications: string;
  suggestedQuestions?: string[];
  source?: string | null;
}

export interface ChecklistItem {
  id: string;
  item: string;
  reason: string;
  category: string;
  completed?: boolean;
}

export interface LawyerQuestion {
  category: string;
  question: string;
  context: string;
}

export interface ActionPlan {
  highPriorityChecklist: ChecklistItem[];
  attorneyDiscussionQuestions: LawyerQuestion[];
  signingReadiness: {
    assessment: string;
    keyBlockers: string[];
  };
}

export interface DocumentAnalysisResult {
  documentId: string;
  fileName: string;
  fileUri?: string;
  mimeType: string;
  fileSize: number;
  analyzedAt: string;
  textContent?: string;
  analysis: DocumentAnalysisData;
  rawAnalysis?: DocumentAnalysisData;
  overview?: DocumentOverview;
  clauses?: ClauseItem[];
  actionPlan?: ActionPlan;
}

export interface ChatCitation {
  clauseTitle: string;
  sourceQuote: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: ChatCitation[];
  timestamp: string;
}

export interface ModifiedClauseDiff {
  title: string;
  beforeExcerpt: string;
  afterExcerpt: string;
  changeExplanation: string;
  riskShift: 'Favors Signer' | 'Neutral' | 'Favors Other Party' | 'Increased Risk';
}

export interface ComparisonDelta {
  title: string;
  explanation: string;
  attentionLevel: AttentionLevel;
}

export interface ProcessedUpload {
  fileUri?: string;
  mimeType: string;
  textContent?: string;
  originalName: string;
  size: number;
}

export interface DocumentComparisonResult {
  documentATitle: string;
  documentBTitle: string;
  summaryOfChanges: string;
  riskShiftSummary: string;
  addedClauses: ComparisonDelta[];
  removedClauses: ComparisonDelta[];
  modifiedClauses: ModifiedClauseDiff[];
}
