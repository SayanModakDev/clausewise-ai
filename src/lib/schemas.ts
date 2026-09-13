import { z } from 'zod';
import { Type } from '@google/genai';

export const attentionLevelSchema = z.enum(['INFORMATIONAL', 'IMPORTANT', 'REVIEW']);

export const importantDateSchema = z.object({
  label: z.string(),
  value: z.string(),
  source: z.string().optional(),
});

export const financialTermItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  source: z.string().optional(),
});

export const legalObligationSchema = z.object({
  party: z.string().optional(),
  obligation: z.string(),
  source: z.string().optional(),
});

export const legalClauseSchema = z.object({
  title: z.string(),
  source: z.string().nullable().default(null),
  originalText: z.string(),
  plainLanguage: z.string(),
  attentionLevel: attentionLevelSchema,
  whyItMatters: z.string(),
});

/**
 * Standard structured document analysis Zod schema
 */
export const documentAnalysisDataSchema = z.object({
  documentType: z.string(),
  summary: z.string(),
  parties: z.array(z.string()).default([]),
  importantDates: z.array(importantDateSchema).default([]),
  financialTerms: z.array(financialTermItemSchema).default([]),
  obligations: z.array(legalObligationSchema).default([]),
  clauses: z.array(legalClauseSchema).default([]),
  itemsToClarify: z.array(z.string()).default([]),
  questionsForProfessional: z.array(z.string()).default([]),
});

/**
 * Native Gemini SDK Structured Output Schema for Document Analysis
 */
export const GEMINI_DOCUMENT_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    documentType: {
      type: Type.STRING,
      description: 'The type or title of the legal agreement (e.g., Non-Disclosure Agreement, Independent Consulting Agreement)',
    },
    summary: {
      type: Type.STRING,
      description: 'Comprehensive plain-language executive summary of the document and its core commitments',
    },
    parties: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'All identified contracting parties and their roles (e.g. "Apex Ventures Inc. (Company)", "Alex Mercer (Consultant)")',
    },
    importantDates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: 'Date name, e.g. "Effective Date", "Initial Term Expiration", "Notice Period"' },
          value: { type: Type.STRING, description: 'Exact date or duration verbatim from the contract' },
          source: { type: Type.STRING, description: 'Source section or clause reference' },
        },
        required: ['label', 'value'],
      },
      description: 'Critical deadlines, effective dates, notice windows, and cure periods',
    },
    financialTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: 'Payment item name, e.g. "Monthly Retainer", "Late Payment Interest"' },
          value: { type: Type.STRING, description: 'Exact dollar amount, rate, or percentage verbatim from the contract' },
          source: { type: Type.STRING, description: 'Source section reference' },
        },
        required: ['label', 'value'],
      },
      description: 'All compensation, fee, reimbursement, and penalty terms',
    },
    obligations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          party: { type: Type.STRING, description: 'The party bound by this obligation' },
          obligation: { type: Type.STRING, description: 'Plain-language explanation of what must be done or avoided' },
          source: { type: Type.STRING, description: 'Source clause or section number' },
        },
        required: ['obligation'],
      },
      description: 'Core contractual duties, commitments, and restrictions for each party',
    },
    clauses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Descriptive title of the clause' },
          source: { type: Type.STRING, nullable: true, description: 'Section number, paragraph, or page reference' },
          originalText: { type: Type.STRING, description: 'Exact verbatim excerpt of the contract language' },
          plainLanguage: { type: Type.STRING, description: 'Clear translation in simple, everyday language' },
          attentionLevel: {
            type: Type.STRING,
            enum: ['INFORMATIONAL', 'IMPORTANT', 'REVIEW'],
            description: 'INFORMATIONAL: standard boilerplate; IMPORTANT: core rights/payments; REVIEW: unilateral, liability caps, or non-competes',
          },
          whyItMatters: { type: Type.STRING, description: 'Practical meaning and consequences for the signer' },
        },
        required: ['title', 'originalText', 'plainLanguage', 'attentionLevel', 'whyItMatters'],
      },
      description: 'Categorized breakdown of substantive clauses in the agreement',
    },
    itemsToClarify: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Ambiguities, potential traps, or items to verify before signing',
    },
    questionsForProfessional: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific, high-value questions to discuss with an attorney',
    },
  },
  required: [
    'documentType',
    'summary',
    'parties',
    'importantDates',
    'financialTerms',
    'obligations',
    'clauses',
    'itemsToClarify',
    'questionsForProfessional',
  ],
};

// Legacy schemas for backward-compatibility with other modules
export const documentPartySchema = z.object({
  name: z.string(),
  role: z.string(),
  details: z.string().optional(),
});

export const documentDateSchema = z.object({
  label: z.string(),
  date: z.string(),
  description: z.string(),
});

export const financialTermSchema = z.object({
  label: z.string(),
  amountOrRate: z.string(),
  description: z.string(),
});

export const documentObligationSchema = z.object({
  party: z.string(),
  obligation: z.string(),
});

export const documentOverviewSchema = z.object({
  title: z.string(),
  documentType: z.string(),
  executiveSummary: z.string(),
  parties: z.array(documentPartySchema).default([]),
  keyDates: z.array(documentDateSchema).default([]),
  financialTerms: z.array(financialTermSchema).default([]),
  coreObligations: z.array(documentObligationSchema).default([]),
  riskProfile: z.object({
    summary: z.string(),
    informationalCount: z.number().default(0),
    importantCount: z.number().default(0),
    reviewCount: z.number().default(0),
  }),
});

export const clauseItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    'Termination',
    'Liability & Indemnification',
    'Intellectual Property',
    'Payment & Fees',
    'Confidentiality',
    'Governing Law & Dispute Resolution',
    'Warranties & Disclaimers',
    'Non-Compete & Restrictive Covenants',
    'General & Miscellaneous',
  ]),
  attentionLevel: attentionLevelSchema,
  plainExplanation: z.string(),
  sourceQuote: z.string(),
  practicalImplications: z.string(),
  suggestedQuestions: z.array(z.string()).default([]),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  item: z.string(),
  reason: z.string(),
  category: z.string(),
});

export const lawyerQuestionSchema = z.object({
  category: z.string(),
  question: z.string(),
  context: z.string(),
});

export const actionPlanSchema = z.object({
  highPriorityChecklist: z.array(checklistItemSchema).default([]),
  attorneyDiscussionQuestions: z.array(lawyerQuestionSchema).default([]),
  signingReadiness: z.object({
    assessment: z.string(),
    keyBlockers: z.array(z.string()).default([]),
  }),
});

export const fullAnalysisSchema = z.object({
  overview: documentOverviewSchema,
  clauses: z.array(clauseItemSchema),
  actionPlan: actionPlanSchema,
});

export const chatCitationSchema = z.object({
  clauseTitle: z.string(),
  sourceQuote: z.string(),
});

export const chatResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(chatCitationSchema).default([]),
});

export const comparisonResultSchema = z.object({
  documentATitle: z.string(),
  documentBTitle: z.string(),
  summaryOfChanges: z.string(),
  riskShiftSummary: z.string(),
  addedClauses: z.array(
    z.object({
      title: z.string(),
      explanation: z.string(),
      attentionLevel: attentionLevelSchema,
    })
  ).default([]),
  removedClauses: z.array(
    z.object({
      title: z.string(),
      explanation: z.string(),
      attentionLevel: attentionLevelSchema,
    })
  ).default([]),
  modifiedClauses: z.array(
    z.object({
      title: z.string(),
      beforeExcerpt: z.string(),
      afterExcerpt: z.string(),
      changeExplanation: z.string(),
      riskShift: z.enum(['Favors Signer', 'Neutral', 'Favors Other Party', 'Increased Risk']),
    })
  ).default([]),
});
