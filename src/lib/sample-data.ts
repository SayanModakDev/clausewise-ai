import { DocumentAnalysisResult, DocumentComparisonResult, DocumentAnalysisData } from './types';

export const SAMPLE_CONSULTING_CONTRACT_TEXT = `
INDEPENDENT CONSULTOR & IP ASSIGNMENT AGREEMENT

This Independent Consulting Agreement ("Agreement") is entered into as of October 1, 2026 ("Effective Date"), by and between Apex Ventures Inc., a Delaware corporation with its principal place of business at 500 Market St, San Francisco, CA ("Company"), and Alex Mercer, an independent contractor ("Consultant").

1. ENGAGEMENT & SERVICES
1.1 Services: Consultant shall provide software architecture, technical advisory, and artificial intelligence engineering services as described in Statement of Work #1.
1.2 Standard of Performance: Consultant agrees to devote best efforts to perform the Services in a diligent, workmanlike, and professional manner.

2. COMPENSATION & PAYMENT TERMS
2.1 Consulting Fees: Company shall pay Consultant a fixed advisory retainer of $12,500 per month, payable net 30 days upon receipt of Consultant's invoice.
2.2 Expenses: Company shall reimburse pre-approved, documented travel and lodging expenses exceeding $100 within 15 calendar days of invoice submission.
2.3 Late Payment: Late invoices shall accrue interest at a rate of 1.5% per month or the highest amount allowed by applicable law.

3. TERM AND TERMINATION
3.1 Term: This Agreement shall commence on the Effective Date and remain in full effect for an initial period of twelve (12) months.
3.2 Termination for Convenience: Either party may terminate this Agreement without cause upon providing sixty (60) calendar days prior written notice.
3.3 Immediate Termination for Cause: Either party may terminate immediately if the other party commits a material breach and fails to cure such breach within ten (10) calendar days of receiving written notice.
3.4 Effect of Termination: Upon termination, Company shall pay Consultant for all undisputed Services rendered up to the effective termination date.

4. INTELLECTUAL PROPERTY & WORK PRODUCT
4.1 Assignment of Work Product: Consultant agrees that all work product, code, documentation, algorithms, patentable inventions, and copyrightable materials created solely or jointly by Consultant during the engagement ("Work Product") shall belong exclusively to Company as a "work made for hire."
4.2 Pre-Existing IP: Consultant retains exclusive ownership of all Pre-Existing Intellectual Property, developer tools, and generic utility libraries created prior to or outside of this Agreement. Consultant grants Company a non-exclusive, perpetual, worldwide, royalty-free license to use Pre-Existing IP embedded in the deliverables.

5. CONFIDENTIALITY
5.1 Definition: "Confidential Information" includes technical data, trade secrets, software blueprints, customer lists, and financial information disclosed by either party.
5.2 Non-Disclosure Obligation: Each party agrees to protect the Confidential Information of the other using the same degree of care it uses for its own confidential data, but not less than reasonable care, for a period of five (5) years following termination.

6. LIMITATION OF LIABILITY & INDEMNIFICATION
6.1 Limitation of Liability: TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES. EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING UNDER THIS AGREEMENT SHALL BE STRICTLY CAPPED AT THE TOTAL FEES PAID OR PAYABLE BY COMPANY TO CONSULTANT IN THE PRECEDING TWELVE (12) MONTHS.
6.2 Mutual Indemnification: Consultant shall defend, indemnify, and hold harmless Company from any third-party claims alleging that the Deliverables infringe any third-party copyright, patent, or trade secret. Company shall indemnify Consultant against third-party claims arising from materials or specifications provided by Company.

7. RESTRICTIVE COVENANTS
7.1 Non-Solicitation: During the term of this Agreement and for twelve (12) months thereafter, Consultant shall not directly solicit for employment any employee or contractor of Company without prior written consent.
7.2 Non-Compete: Consultant shall not provide competitive GenAI legal-document consulting services to direct competitors within North America for a period of six (6) months post-termination.

8. GOVERNING LAW & DISPUTE RESOLUTION
8.1 Governing Law: This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to conflict of law principles.
8.2 Arbitration: Any dispute or claim arising out of this Agreement shall be resolved through confidential, binding arbitration administered by JAMS in San Francisco, California. Each party shall bear its own legal fees.
`;

export const SAMPLE_NDA_CONTRACT_TEXT = `
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made effective as of November 15, 2026, by and between Meridian Robotics Corp. ("Party A") and Nexus Data Labs LLC ("Party B").

1. PURPOSE
The parties wish to explore a potential strategic business collaboration regarding autonomous navigation technologies ("Permitted Purpose").

2. CONFIDENTIAL INFORMATION
Confidential Information refers to proprietary technical, financial, and operational information marked as "Confidential" or reasonably understood to be confidential given the nature of the information.

3. EXCLUSIONS
Confidential Information does not include information that:
(a) is or becomes publicly known through no breach of this Agreement;
(b) was already known to the receiving party without confidentiality obligations;
(c) is independently developed by the receiving party without reference to disclosed information;
(d) is required to be disclosed by court order or applicable statute, provided reasonable prior notice is given.

4. DURATION & SURVIVAL
This Agreement remains in effect for two (2) years from the Effective Date. The confidentiality obligations shall survive termination for an additional period of three (3) years; provided that trade secrets shall remain confidential indefinitely.

5. REMEDIES & INJUNCTIVE RELIEF
The parties acknowledge that unauthorized disclosure may cause irreparable injury for which monetary damages alone would be inadequate, and agree that the disclosing party shall be entitled to seek injunctive relief without posting a bond.

6. GOVERNING LAW
This Agreement shall be governed by the laws of the State of New York.
`;

export const SAMPLE_DOCUMENT_ANALYSIS_DATA: DocumentAnalysisData = {
  documentType: 'Independent Consulting & IP Assignment Agreement',
  summary:
    'This is a professional services contract between Apex Ventures Inc. and Alex Mercer for software architecture and GenAI engineering advisory services. It establishes a fixed monthly retainer of $12,500, sets clear intellectual property transfer terms, outlines mutual confidentiality protections, and limits liability to 12 months of paid fees.',
  parties: [
    'Apex Ventures Inc. (Company / Client)',
    'Alex Mercer (Consultant / Contractor)',
  ],
  importantDates: [
    { label: 'Effective Date', value: 'October 1, 2026', source: 'Preamble' },
    { label: 'Initial Term', value: '12 months', source: 'Section 3.1' },
    { label: 'Termination Notice', value: '60 calendar days', source: 'Section 3.2' },
    { label: 'Breach Cure Period', value: '10 calendar days', source: 'Section 3.3' },
  ],
  financialTerms: [
    { label: 'Monthly Retainer', value: '$12,500 / month', source: 'Section 2.1' },
    { label: 'Expense Reimbursement', value: 'Over $100', source: 'Section 2.2' },
    { label: 'Late Interest Penalty', value: '1.5% per month', source: 'Section 2.3' },
  ],
  obligations: [
    { party: 'Consultant', obligation: 'Provide software architecture and AI engineering advisory in a diligent manner.', source: 'Section 1.2' },
    { party: 'Company', obligation: 'Pay monthly retainer of $12,500 net 30 days and reimburse pre-approved expenses over $100.', source: 'Section 2.1' },
    { party: 'Consultant', obligation: 'Assign all Work Product created during engagement as work made for hire.', source: 'Section 4.1' },
    { party: 'Both Parties', obligation: 'Maintain confidentiality of proprietary information for five (5) years.', source: 'Section 5.2' },
    { party: 'Consultant', obligation: 'Refrain from competitive GenAI consulting in North America for 6 months.', source: 'Section 7.2' },
  ],
  clauses: [
    {
      title: 'Consulting Retainer & Late Fees',
      source: 'Section 2.1 & 2.3',
      originalText: "Company shall pay Consultant a fixed advisory retainer of $12,500 per month, payable net 30 days upon receipt of Consultant's invoice... Late invoices shall accrue interest at a rate of 1.5% per month.",
      plainLanguage: 'You receive $12,500 every month on net-30 terms. Late payments accrue interest at 1.5% monthly.',
      attentionLevel: 'IMPORTANT',
      whyItMatters: 'Guarantees regular advisory revenue with late fee protection, but requires waiting up to 30 days for payment.',
    },
    {
      title: 'IP Assignment & Pre-Existing IP Carveout',
      source: 'Section 4.1 & 4.2',
      originalText: 'Consultant agrees that all work product... created solely or jointly by Consultant during the engagement ("Work Product") shall belong exclusively to Company as a "work made for hire." Consultant retains exclusive ownership of all Pre-Existing Intellectual Property...',
      plainLanguage: 'Apex owns new custom deliverables made for them, but you retain full ownership of existing toolkits and libraries.',
      attentionLevel: 'IMPORTANT',
      whyItMatters: 'Protects your background proprietary code and reusable starter kits while assigning client deliverables.',
    },
    {
      title: 'Termination for Convenience (60 Days)',
      source: 'Section 3.2',
      originalText: 'Either party may terminate this Agreement without cause upon providing sixty (60) calendar days prior written notice.',
      plainLanguage: 'Either party can exit the contract at any time for any reason by giving 60 days advance written notice.',
      attentionLevel: 'INFORMATIONAL',
      whyItMatters: 'Provides a predictable 2-month runway if either party chooses to discontinue the consulting arrangement.',
    },
    {
      title: 'Mutual Liability Cap (12 Months of Fees)',
      source: 'Section 6.1',
      originalText: "EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING UNDER THIS AGREEMENT SHALL BE STRICTLY CAPPED AT THE TOTAL FEES PAID OR PAYABLE BY COMPANY TO CONSULTANT IN THE PRECEDING TWELVE (12) MONTHS.",
      plainLanguage: 'Maximum legal damages either party can recover are limited to the fees paid over the previous 12 months ($150,000 max).',
      attentionLevel: 'IMPORTANT',
      whyItMatters: 'Prevents unlimited financial liability in case of breach or commercial dispute.',
    },
    {
      title: 'Non-Compete in GenAI Legal Space (6 Months)',
      source: 'Section 7.2',
      originalText: 'Consultant shall not provide competitive GenAI legal-document consulting services to direct competitors within North America for a period of six (6) months post-termination.',
      plainLanguage: 'You are restricted from consulting for direct legal-tech competitors in North America for 6 months after ending this engagement.',
      attentionLevel: 'REVIEW',
      whyItMatters: 'Potentially restricts future advisory opportunities. Post-termination non-competes require attorney review, particularly given California governing law limitations.',
    },
    {
      title: 'Confidentiality Duration (5 Years)',
      source: 'Section 5.2',
      originalText: 'Each party agrees to protect the Confidential Information... for a period of five (5) years following termination.',
      plainLanguage: 'Both parties must protect confidential and trade secret information for 5 years after termination.',
      attentionLevel: 'INFORMATIONAL',
      whyItMatters: 'Standard non-disclosure commitment across commercial technology agreements.',
    },
  ],
  itemsToClarify: [
    'Clarify scope and specific named competitor list for the Section 7.2 non-compete covenant.',
    'Attach an Exhibit A listing pre-existing libraries and tools to prevent ownership ambiguities.',
    'Negotiate invoice payment timeline from Net 30 to Net 15 days.',
    'Confirm expense pre-approval workflow for travel exceeding $100.',
  ],
  questionsForProfessional: [
    'Is Section 7.2\'s non-compete restriction enforceable against an independent contractor under California law (Cal. Bus. & Prof. Code § 16600)?',
    'Does the 12-month liability cap in Section 6.1 adequately protect against third-party indemnification claims under Section 6.2?',
    'Does the "work made for hire" language in Section 4.1 correctly carve out pre-existing toolkits without title clouding?',
    'Should the JAMS arbitration clause include mandatory good-faith executive escalation before formal filing?',
  ],
};

export const SAMPLE_INITIAL_ANALYSIS: DocumentAnalysisResult = {
  documentId: 'sample-consulting-01',
  fileName: 'Independent_Consulting_Agreement_Apex.txt',
  mimeType: 'text/plain',
  fileSize: 4280,
  analyzedAt: '2026-10-01T10:00:00.000Z',
  textContent: SAMPLE_CONSULTING_CONTRACT_TEXT,
  analysis: SAMPLE_DOCUMENT_ANALYSIS_DATA,
  rawAnalysis: SAMPLE_DOCUMENT_ANALYSIS_DATA,
  overview: {
    title: 'Independent Consulting & IP Assignment Agreement',
    documentType: 'Independent Contractor Agreement',
    executiveSummary:
      'This is a professional services contract between Apex Ventures Inc. and Alex Mercer for software architecture and GenAI engineering advisory services. It establishes a fixed monthly retainer of $12,500, sets clear intellectual property transfer terms, outlines mutual confidentiality protections, and limits liability to 12 months of paid fees.',
    parties: [
      { name: 'Apex Ventures Inc.', role: 'Company / Client', details: 'Delaware corporation based in San Francisco, CA' },
      { name: 'Alex Mercer', role: 'Consultant / Contractor', details: 'Independent technical advisor' },
    ],
    keyDates: [
      { label: 'Effective Date', date: 'October 1, 2026', description: 'Agreement start date' },
      { label: 'Initial Term', date: '12 months', description: 'Duration of initial engagement' },
      { label: 'Termination Notice', date: '60 calendar days', description: 'Required notice for termination without cause' },
      { label: 'Breach Cure Period', date: '10 calendar days', description: 'Window to cure material breach before cause termination' },
    ],
    financialTerms: [
      { label: 'Monthly Retainer', amountOrRate: '$12,500 / month', description: 'Fixed advisory compensation, payable net 30 days' },
      { label: 'Expense Reimbursement', amountOrRate: 'Over $100', description: 'Pre-approved travel/lodging reimbursed within 15 days' },
      { label: 'Late Interest Penalty', amountOrRate: '1.5% per month', description: 'Accrues on overdue undisputed invoices' },
    ],
    coreObligations: [
      { party: 'Consultant', obligation: 'Provide software architecture and AI engineering services in a diligent, workmanlike manner.' },
      { party: 'Company', obligation: 'Pay monthly retainer of $12,500 net 30 days and reimburse pre-approved expenses over $100.' },
      { party: 'Consultant', obligation: 'Assign all Work Product created during engagement as work made for hire.' },
      { party: 'Both Parties', obligation: 'Maintain confidentiality of proprietary data for five (5) years.' },
    ],
    riskProfile: {
      summary: 'Well-structured bilateral agreement with reasonable liability caps, but contains a 6-month restrictive non-compete covenant and a 12-month non-solicit clause requiring careful evaluation.',
      informationalCount: 3,
      importantCount: 4,
      reviewCount: 2,
    },
  },
  clauses: [
    {
      id: 'cl-1',
      title: 'Consulting Retainer & Late Fees',
      source: 'Section 2.1 & 2.3',
      category: 'Payment & Fees',
      attentionLevel: 'IMPORTANT',
      sourceQuote: 'Company shall pay Consultant a fixed advisory retainer of $12,500 per month, payable net 30 days upon receipt of Consultant\'s invoice... Late invoices shall accrue interest at a rate of 1.5% per month.',
      plainExplanation: 'You receive $12,500 every month on net-30 terms. If the client pays late, interest accumulates at 1.5% per month.',
      practicalImplications: 'Ensures predictable cash flow with late-payment protection, but net-30 means you may wait up to 30 days after invoicing to receive funds.',
      suggestedQuestions: ['Can initial invoices be transitioned to net-15 for the first 90 days?', 'What is the exact invoicing schedule and billing portal?'],
    },
    {
      id: 'cl-2',
      title: 'IP Assignment & Pre-Existing IP Carveout',
      source: 'Section 4.1 & 4.2',
      category: 'Intellectual Property',
      attentionLevel: 'IMPORTANT',
      sourceQuote: 'Consultant agrees that all work product... created solely or jointly by Consultant during the engagement ("Work Product") shall belong exclusively to Company as a "work made for hire." Consultant retains exclusive ownership of all Pre-Existing Intellectual Property...',
      plainExplanation: 'Apex owns new deliverables created for them, while you keep full ownership of pre-existing software, libraries, and tools you already built.',
      practicalImplications: 'Protects your background proprietary code and reusable starter kits while assigning custom client deliverables.',
      suggestedQuestions: ['Should an Exhibit A be attached listing specific pre-existing tools and libraries to avoid future ambiguity?'],
    },
    {
      id: 'cl-3',
      title: 'Termination for Convenience (60 Days)',
      source: 'Section 3.2',
      category: 'Termination',
      attentionLevel: 'INFORMATIONAL',
      sourceQuote: 'Either party may terminate this Agreement without cause upon providing sixty (60) calendar days prior written notice.',
      plainExplanation: 'Either you or Apex can exit the contract at any time for any reason by giving 60 days advance written notice.',
      practicalImplications: 'Gives both sides a substantial 2-month transition runway if the partnership is discontinued.',
      suggestedQuestions: ['Is 60 days standard, or would 30 days offer more flexibility for your consulting pipeline?'],
    },
    {
      id: 'cl-4',
      title: 'Mutual Liability Cap (12 Months of Fees)',
      source: 'Section 6.1',
      category: 'Liability & Indemnification',
      attentionLevel: 'IMPORTANT',
      sourceQuote: 'EACH PARTY\'S TOTAL AGGREGATE LIABILITY ARISING UNDER THIS AGREEMENT SHALL BE STRICTLY CAPPED AT THE TOTAL FEES PAID OR PAYABLE BY COMPANY TO CONSULTANT IN THE PRECEDING TWELVE (12) MONTHS.',
      plainExplanation: 'The maximum damages either side can recover in any lawsuit or claim is strictly limited to the total fees paid over the previous 12 months ($150,000 max).',
      practicalImplications: 'Prevents open-ended financial exposure in the event of unforeseen contract disputes.',
      suggestedQuestions: ['Are gross negligence, willful misconduct, or IP infringement carved out from this cap?'],
    },
    {
      id: 'cl-5',
      title: 'Non-Compete in GenAI Legal Space (6 Months)',
      source: 'Section 7.2',
      category: 'Non-Compete & Restrictive Covenants',
      attentionLevel: 'REVIEW',
      sourceQuote: 'Consultant shall not provide competitive GenAI legal-document consulting services to direct competitors within North America for a period of six (6) months post-termination.',
      plainExplanation: 'You are restricted from taking consulting contracts with direct legal-tech GenAI competitors in North America for 6 months after this contract ends.',
      practicalImplications: 'May limit your ability to accept lucrative advisory engagements with other legal-tech startups following termination. Note: Non-compete covenants are subject to strict regional statutory restrictions (e.g., California law generally renders post-employment non-competes void for independent workers, though legal counsel should verify application).',
      suggestedQuestions: ['Can this restriction be narrowed to specific named competitors rather than the entire industry?', 'Can the duration be waived upon mutual termination?'],
    },
    {
      id: 'cl-6',
      title: 'Confidentiality Duration (5 Years)',
      source: 'Section 5.2',
      category: 'Confidentiality',
      attentionLevel: 'INFORMATIONAL',
      sourceQuote: 'Each party agrees to protect the Confidential Information... for a period of five (5) years following termination.',
      plainExplanation: 'Both sides must keep proprietary information secret for 5 years after the consulting relationship ends.',
      practicalImplications: 'Standard duration for commercial contracts, though you must ensure client confidential material is archived or destroyed upon departure.',
      suggestedQuestions: ['Does the 5-year requirement apply equally to public open-source project disclosures?'],
    },
    {
      id: 'cl-7',
      title: 'Binding JAMS Arbitration in San Francisco',
      source: 'Section 8.1 & 8.3',
      category: 'Governing Law & Dispute Resolution',
      attentionLevel: 'INFORMATIONAL',
      sourceQuote: 'Any dispute or claim arising out of this Agreement shall be resolved through confidential, binding arbitration administered by JAMS in San Francisco, California. Each party shall bear its own legal fees.',
      plainExplanation: 'Disputes are resolved through private arbitration in San Francisco rather than public court trials, and each side pays their own legal costs.',
      practicalImplications: 'Provides private, fast dispute resolution, but limits right to a jury trial.',
      suggestedQuestions: ['Are mediation steps required before formal arbitration can be filed?'],
    },
  ],
  actionPlan: {
    highPriorityChecklist: [
      {
        id: 'chk-1',
        item: 'Clarify scope of 6-month North America GenAI non-compete restriction',
        reason: 'Restricts taking other legal-tech consulting clients for half a year post-engagement.',
        category: 'Restrictive Covenants',
        completed: false,
      },
      {
        id: 'chk-2',
        item: 'Document pre-existing software libraries and AI toolkits in Exhibit A',
        reason: 'Ensures your personal developer toolkits remain 100% your property without dispute.',
        category: 'Intellectual Property',
        completed: false,
      },
      {
        id: 'chk-3',
        item: 'Negotiate invoice payment terms from net 30 to net 15 days',
        reason: 'Improves cash flow turnaround and reduces working capital lag.',
        category: 'Payment & Fees',
        completed: false,
      },
      {
        id: 'chk-4',
        item: 'Confirm expense pre-approval workflow for travel over $100',
        reason: 'Prevents disputed travel and lodging reimbursements.',
        category: 'Operational',
        completed: false,
      },
    ],
    attorneyDiscussionQuestions: [
      {
        category: 'Restrictive Covenants',
        question: 'Is Section 7.2\'s non-compete restriction enforceable against an independent contractor under California law (Cal. Bus. & Prof. Code § 16600)?',
        context: 'Agreement specifies California governing law, where post-engagement covenants are heavily restricted.',
      },
      {
        category: 'Liability',
        question: 'Does the 12-month liability cap in Section 6.1 adequately protect against third-party indemnification claims under Section 6.2?',
        context: 'Verify whether indemnity obligations are explicitly capped or remain unlimited.',
      },
      {
        category: 'Intellectual Property',
        question: 'Does the "work made for hire" language in Section 4.1 correctly assign rights without unintentionally clouding ownership of pre-existing code?',
        context: 'Confirm that Section 4.2 carveout sufficiently safeguards prior developer assets.',
      },
      {
        category: 'Dispute Resolution',
        question: 'Should the JAMS arbitration clause include mandatory good-faith executive escalation or non-binding mediation prior to formal filing?',
        context: 'Can avoid costly formal arbitration filings for minor invoice disputes.',
      },
    ],
    signingReadiness: {
      assessment: 'Moderately Favorable with Specific Negotiation Points',
      keyBlockers: [
        'Overly broad non-compete clause in Section 7.2 (needs narrowing or removal)',
        'Undefined pre-existing IP list (requires Exhibit A schedule)',
        'Net-30 payment terms (recommend shortening to Net-15)',
      ],
    },
  },
};

export const SAMPLE_COMPARISON_RESULT: DocumentComparisonResult = {
  documentATitle: 'Consulting Agreement (Original Draft)',
  documentBTitle: 'Consulting Agreement (Counterparty Revision v2)',
  summaryOfChanges:
    'Version 2 incorporates several significant changes: the monthly advisory fee was adjusted from $10,000 to $12,500 (+25%), the termination notice was extended from 30 to 60 days, and a new 6-month non-compete covenant was introduced that did not exist in Draft 1.',
  riskShiftSummary:
    'Mixed risk shift: Higher financial compensation and longer transition runway benefit the consultant, but the newly added post-termination non-compete restriction introduces new career friction that requires legal review.',
  addedClauses: [
    {
      title: 'Section 7.2: Post-Termination Non-Compete',
      explanation: 'Newly introduced 6-month restriction prohibiting GenAI legal consulting for North American competitors.',
      attentionLevel: 'REVIEW',
    },
    {
      title: 'Section 2.3: Late Payment Interest (1.5%/mo)',
      explanation: 'Added late fee penalty on overdue undisputed invoices to protect timely payment.',
      attentionLevel: 'IMPORTANT',
    },
  ],
  removedClauses: [
    {
      title: 'Prior Section 4.3: Right of First Refusal for Full-Time Employment',
      explanation: 'Removed clause granting the company preferential option to convert contractor into full-time employee.',
      attentionLevel: 'INFORMATIONAL',
    },
  ],
  modifiedClauses: [
    {
      title: 'Section 2.1: Monthly Compensation',
      beforeExcerpt: 'Company shall pay Consultant a monthly fee of $10,000 payable net 45 days.',
      afterExcerpt: 'Company shall pay Consultant a fixed advisory retainer of $12,500 per month, payable net 30 days.',
      changeExplanation: 'Monthly fee increased by $2,500/month (+25%) and payment timeline accelerated from net-45 to net-30.',
      riskShift: 'Favors Signer',
    },
    {
      title: 'Section 3.2: Notice for Termination for Convenience',
      beforeExcerpt: 'Either party may terminate upon thirty (30) days prior written notice.',
      afterExcerpt: 'Either party may terminate without cause upon providing sixty (60) calendar days prior written notice.',
      changeExplanation: 'Notice period doubled from 30 days to 60 days, providing longer revenue visibility upon contract termination.',
      riskShift: 'Favors Signer',
    },
    {
      title: 'Section 6.1: Limitation of Liability Cap',
      beforeExcerpt: 'Liability capped at total fees paid in the preceding three (3) months ($30,000 max).',
      afterExcerpt: 'Liability strictly capped at total fees paid or payable in preceding twelve (12) months ($150,000 max).',
      changeExplanation: 'Aggregate liability ceiling quadrupled from 3 months to 12 months of fees.',
      riskShift: 'Increased Risk',
    },
  ],
};
