# ClauseWise AI — PromptWars Demo & Evaluation Guide

> **Tagline:** Understand the document before you sign it.  
> **Evaluation Mode:** Informational legal assistance only — not legal advice.

This document outlines the reproducible evaluation sequence for judging ClauseWise AI during the PromptWars Hackathon.

---

## 1. Demo Document Fixtures

Two small, completely fictional employment agreements are provided in `demo_fixtures/` (available in both `.txt` and lightweight script-generated `.pdf` format):

| Fixture | Filename | Key Terms |
| :--- | :--- | :--- |
| **Version A** (Baseline) | `demo_fixtures/employment_agreement_v1.txt`<br/>`demo_fixtures/employment_agreement_v1.pdf` | • **Employer:** Novacorp Solutions Pvt Ltd<br/>• **Employee:** Priya Sen<br/>• **Compensation:** ₹40,000 / month<br/>• **Notice Period:** 30 days written notice<br/>• **Confidentiality:** 2 years post-exit<br/>• **Non-Compete:** 3 months post-termination<br/>• **Arbitration:** Binding, Bangalore (**Arbitration fees intentionally unspecified**) |
| **Version B** (Revised) | `demo_fixtures/employment_agreement_v2.txt`<br/>`demo_fixtures/employment_agreement_v2.pdf` | • **Compensation:** ₹45,000 / month (+₹5,000)<br/>• **Notice Period:** 60 days written notice (+30 days)<br/>• **Non-Compete:** 6 months post-termination (+3 months)<br/>• **Arbitration:** Binding, Bangalore (**Fees remain unspecified**) |

Both files are completely fictional and contain zero real corporate entities or copyrighted templates. Total asset weight is < 12 KB.

---

## 2. Quickstart & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure server-side API Key in .env.local
# (Never prefix with NEXT_PUBLIC_; kept strictly server-side)
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local

# 3. Start local development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 3. End-to-End Reproducible Test Sequence

### Step 1: Landing Page & Responsible Legal AI Disclaimers
1. Navigate to `http://localhost:3000`.
2. Notice the prominent **Responsible Legal AI Notice** banner:
   > *"ClauseWise provides informational assistance and document interpretation, not legal advice."*
3. Verify the drag-and-drop zone and 1-click sample contract buttons.

---

### Step 2 & 3: Upload & Analyze Version A
1. In the upload area, either:
   - Drag & drop `demo_fixtures/employment_agreement_v1.txt` (or `.pdf`), **OR**
   - Click the 1-click demo button: **"Employment Agreement (v1)"**.
2. Click **"Analyze Document"**.
3. Observe the multi-stage progress indicators (`Reading document`, `Extracting clauses`, `Synthesizing risk assessment`).

---

### Step 4: Executive Overview Verification
1. On the **Overview** tab:
   - **Document Type:** Correctly identified as an `Employment Agreement`.
   - **Identified Parties:** Novacorp Solutions Private Limited & Priya Sen.
   - **Key Dates:** Effective Date (October 15, 2024), Commencement (November 1, 2024), Termination Notice (30 days).
   - **Financial Terms:** Exact monthly compensation verbatim: **₹40,000**.
   - **Summary:** Plain-language summary explaining the engineering role, salary, notice rules, and dispute resolution.

---

### Step 5: Categorized Clause Inspector
1. Click the **Clauses** tab.
2. Confirm the clauses are extracted with source quotes, plain-English explanations, and attention badges:
   - **Section 3 (Term and Termination):** Tagged `REVIEW` badge (30 days written notice; employer immediate termination for cause).
   - **Section 5 (Restrictive Covenants / Non-Compete):** Tagged `REVIEW` badge (3-month non-compete restriction).
   - **Section 2 (Compensation and Benefits):** Tagged `IMPORTANT` badge (₹40,000 monthly).
   - **Section 4 (Confidentiality):** Tagged `IMPORTANT` badge (2-year survival).
   - **Section 6 (Dispute Resolution):** Tagged `INFORMATIONAL` badge (Bangalore arbitration).

---

### Step 6 & 7: Document-Grounded Q&A — Notice Clause Test
1. Click the **Ask** tab.
2. Enter the question:
   ```text
   Can I terminate this agreement immediately?
   ```
3. Click **"Ask Document"**.
4. **Expected Result:**
   - **Status Badge:** `ANSWERED (DOCUMENT GROUNDED)`
   - **Source:** `Section 3`
   - **Answer:** Explains that you cannot terminate immediately without cause; 30 days prior written notice is required. Immediate termination is reserved for gross misconduct or material breach.
   - **Supporting Excerpt:** Displays the exact quotation from Section 3.

---

### Step 8 & 9: Absence Fallback Guardrail — Arbitration Fees Edge Case
1. In the **Ask** tab, click the suggested question button **"Who pays the arbitration fees?"** (or type it into the input).
2. Click **"Ask Document"**.
3. **Expected Result:**
   - **Status Badge:** `NOT SPECIFIED IN DOCUMENT`
   - **Answer Body:**
     > *"This information is not specified in the provided document."*
   - **Absence Verification Note:** Explains that the contract omitted arbitration fee allocations, proving zero hallucination.

---

### Step 10 & 11: Smart Document Comparison (Version A vs Version B)
1. Click the **Compare** tab.
2. Either upload `demo_fixtures/employment_agreement_v2.txt` as Document B, **OR** click **"Run Live Comparison (v1 vs v2)"**.
3. **Expected Result:**
   ClauseWise detects and highlights all **three (3) material modifications**:
   1. **Monthly Compensation:** Increased by ₹5,000 (+12.5%) from **₹40,000** to **₹45,000** (`IMPORTANT`).
   2. **Termination Notice Period:** Extended from **30 days** to **60 days** (`REVIEW`).
   3. **Post-Termination Non-Compete:** Restriction duration doubled from **3 months** to **6 months** (`REVIEW`).

---

### Step 12: Action Plan & Lawyer Preparation
1. Click the **Action Plan** tab.
2. Confirm structured output:
   - **Core Commitments:** Actionable checklist for the employee before signing.
   - **Points of Ambiguity:** Highlighting the unspecified arbitration fee division.
   - **Targeted Questions for Legal Counsel:** Specific questions to ask an attorney (e.g. non-compete enforceability, arbitration fee allocation).

---

### Step 13: Reset / New Analysis
1. In the top header bar, click **"New Analysis"**.
2. Confirm the application resets completely back to the clean landing page dropzone without stale state.

---

### Step 14: Mobile Responsiveness Verification
1. Open Developer Tools and set viewport to mobile size (`390px × 844px`, iPhone 14/15/16).
2. Confirm that header, disclaimer notice, dropzone, and tab navigation stack cleanly without horizontal scrollbars or clipped text.

---

### Step 15: Invalid File Upload Guardrail
1. Attempt to upload an invalid file (e.g., `.exe`, `.png`, or empty file).
2. Confirm the client immediately displays the error banner:
   > *"Unsupported file format. Please upload a PDF (.pdf) or plain text (.txt) contract document."*
3. Verify that the server also rejects files over 10MB or invalid PDF headers.

---

## 4. Automated Code Quality & Build Verification

Run all verification checks locally:

```bash
# 1. Type check
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Production Build
npm run build
```

All commands must exit with code `0`.
