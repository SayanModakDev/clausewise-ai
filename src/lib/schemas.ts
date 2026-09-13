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

export const askRequestSchema = z.object({
  fileUri: z.string().optional(),
  mimeType: z.string().default('application/pdf'),
  textContent: z.string().optional(),
  documentId: z.string().optional(),
  question: z.string().min(1, 'Question cannot be empty.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .default([]),
});

export const askResponseSchema = z.object({
  status: z.enum(['ANSWERED', 'NOT_SPECIFIED']),
  answer: z.string(),
  source: z.string().nullable(),
  supportingText: z.string().nullable(),
});

/**
 * Native Gemini SDK Structured Output Schema for Document-Grounded Q&A (/api/ask)
 */
export const GEMINI_ASK_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      enum: ['ANSWERED', 'NOT_SPECIFIED'],
      description:
        'Must be ANSWERED if the document contains enough facts to answer the question, or NOT_SPECIFIED if the information is absent from the document.',
    },
    answer: {
      type: Type.STRING,
      description:
        'Plain-language explanation grounded strictly in the document. If status is NOT_SPECIFIED, this must be exactly: "This information is not specified in the provided document."',
    },
    source: {
      type: Type.STRING,
      nullable: true,
      description:
        'Exact section title or clause number where the supporting text is located (e.g. "Section 3.2" or "Clause 4"). Must be null if status is NOT_SPECIFIED or no section heading exists.',
    },
    supportingText: {
      type: Type.STRING,
      nullable: true,
      description:
        'Verbatim excerpt quote directly from the document supporting the answer. Must be null if status is NOT_SPECIFIED.',
    },
  },
  required: ['status', 'answer', 'source', 'supportingText'],
};

export const materialContractChangeSchema = z.object({
  clause: z.string(),
  sourceA: z.string().nullable().default(null),
  sourceB: z.string().nullable().default(null),
  before: z.string(),
  after: z.string(),
  explanation: z.string(),
  whyItMatters: z.string(),
  attentionLevel: attentionLevelSchema,
});

export const smartComparisonResultSchema = z.object({
  summary: z.string(),
  changes: z.array(materialContractChangeSchema).default([]),
});

/**
 * Native Gemini SDK Structured Output Schema for Material Contract Comparison (/api/compare)
 */
export const GEMINI_SMART_COMPARISON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        'Concise executive summary of the revision and key material shifts between Original and Revised versions.',
    },
    changes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clause: {
            type: Type.STRING,
            description:
              'Specific clause name or topic changed (e.g., "Termination Notice Period", "Monthly Compensation", "Non-Compete Covenant")',
          },
          sourceA: {
            type: Type.STRING,
            nullable: true,
            description:
              'Section number or title in original document (e.g. "Section 3.2" or null if newly added)',
          },
          sourceB: {
            type: Type.STRING,
            nullable: true,
            description:
              'Section number or title in revised document (e.g. "Section 3.2" or null if removed)',
          },
          before: {
            type: Type.STRING,
            description:
              'Key verbatim term, number, or excerpt in original document (e.g. "30 days" or "₹40,000 per month")',
          },
          after: {
            type: Type.STRING,
            description:
              'Key verbatim term, number, or excerpt in revised document (e.g. "60 days" or "₹45,000 per month")',
          },
          explanation: {
            type: Type.STRING,
            description:
              'Plain-language explanation of what specifically changed between the two versions',
          },
          whyItMatters: {
            type: Type.STRING,
            description:
              'Practical implications and business/legal significance for the signer',
          },
          attentionLevel: {
            type: Type.STRING,
            enum: ['INFORMATIONAL', 'IMPORTANT', 'REVIEW'],
            description:
              'Standardized attention level: INFORMATIONAL (minor administrative/clerical shifts), IMPORTANT (core duties, compensation, dates), or REVIEW (expanded restrictions, longer notice periods, altered liability/indemnity)',
          },
        },
        required: [
          'clause',
          'sourceA',
          'sourceB',
          'before',
          'after',
          'explanation',
          'whyItMatters',
          'attentionLevel',
        ],
      },
      description: 'Array of material contractual differences between the documents',
    },
  },
  required: ['summary', 'changes'],
};

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
