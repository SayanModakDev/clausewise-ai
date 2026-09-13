import { z } from 'zod';

export const attentionLevelSchema = z.enum(['INFORMATIONAL', 'IMPORTANT', 'REVIEW']);

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
