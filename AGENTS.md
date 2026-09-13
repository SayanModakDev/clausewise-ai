# ClauseWise AI — Legal Document Navigator
> **Tagline:** Understand the document before you sign it.
> **Status:** PromptWars Hackathon Project

## Project Overview & Mission
ClauseWise AI is a GenAI-powered legal document assistance application designed to help non-lawyers and professionals understand complex legal contracts (PDF / TXT) before signing.
It provides **INFORMATIONAL ASSISTANCE ONLY** and **NEVER** claims to replace professional legal counsel.

---

## Core Product Pillars & Features
1. **Document Upload & Analysis**: Upload legal PDF/TXT documents (server-side validation, size limit <= 10MB).
2. **Plain-Language Overview**: Executive summary, identified parties, vital dates, payment & financial terms, and high-level risk profile.
3. **Clause Inspector**: Categorized clause breakdown (Termination, Liability, IP, Payment, Confidentiality, etc.) with exact source quotes, plain-English explanations, and standardized attention badges:
   - `INFORMATIONAL` (administrative, definitions, standard terms)
   - `IMPORTANT` (payment, IP assignment, core obligations)
   - `REVIEW` (unilateral rights, broad indemnities, non-competes, aggressive penalties)
4. **Document-Grounded Q&A**: Interactive chat grounded strictly in the uploaded document. If an answer cannot be determined from the document, it must explicitly state:
   *"This information is not specified in the provided document."*
5. **Smart Document Comparison**: Version comparison between two contracts or revision diffs, highlighting modified obligations, added/removed clauses, and risk shifts.
6. **Action Plan / Lawyer Prep**: Actionable checklist and targeted questions to discuss with an attorney.

---

## Responsible Legal AI Guardrails (Mandatory)
- **Never declare legality**: NEVER state that a clause is legal, illegal, enforceable, unenforceable, valid, or invalid.
- **Never hallucinate terms**: NEVER fabricate clauses, dates, monetary amounts, penalties, or obligations.
- **Preserve numbers exactly**: Retain exact dollar figures, percentages, days, and deadlines verbatim from the source.
- **Strict absence fallback**: If information is not in the document, explicitly output:
  *"This information is not specified in the provided document."*
- **Clear attribution**: Always visually and structurally distinguish source contract text from AI explanations.
- **Persistent disclaimers**: Every view must present the clear notice that ClauseWise provides informational analysis and is not legal advice.

---

## Technical Stack & Architecture
- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (Clean, calm, premium legal-tech SaaS design — no crypto aesthetics, no glassmorphism overload)
- **AI SDK**: `@google/genai` (current official Google GenAI SDK)
- **Model**: `gemini-3.8-flash`
- **Validation**: Zod for runtime schema validation and structured JSON outputs
- **Icons**: `lucide-react`
- **Zero Database / Zero Vector DB / Zero External Backend**: Keep the architecture lean, self-contained, and performant.

---

## Security & Secrets
- All Gemini API calls **MUST BE SERVER-SIDE** (`src/server/` or `src/app/api/`).
- `GEMINI_API_KEY` must **NEVER** reach the client bundle or browser. Never prefix with `NEXT_PUBLIC_`.
- Server-side file validation for MIME type (PDF, text/plain) and max size (10MB).
- Do not log sensitive document contents or expose raw stack traces to the client.
- `.env.local` must remain gitignored at all times.
- Never commit `node_modules`, `.next`, or large binaries. The public GitHub repository must remain comfortably under 10MB.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
