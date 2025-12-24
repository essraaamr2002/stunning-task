# Stunning — Prompt Improver (Full-Stack Task)

A landing-page hero feature that helps users turn a rough website idea into a clearer, build-ready prompt they can paste into an AI website builder.

## What I built
- A hero section where the user writes a rough idea and submits it
- The system returns an improved, structured, copy-paste-ready prompt
- Two modes:
  - **Standard** (fast + deterministic): heuristic-based improvement
  - **AI** (higher quality): OpenAI rewrite with graceful fallback when unavailable

## Product choices
- Simple 1-input flow → improved output (real product feel, not a demo)
- Clear feedback for users:
  - **Mode used** chip (AI vs Standard)
  - Language + industry detection chips
  - Friendly warnings when AI isn't available (no key / no credits / rate limit)
- Copy button + readable output formatting

## Tech stack
- Next.js (App Router) + TypeScript
- Material UI (MUI)
- Backend via Next Route Handler: `src/app/api/improve/route.ts`
- Optional OpenAI integration via Responses API

## Run locally
```bash
npm install
npm run dev
