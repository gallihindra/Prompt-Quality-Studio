# Prompt Quality Studio

Prompt Quality Studio is a free, rule-based web application for turning vague prompts into structured AI instructions. It helps users assess prompt quality, identify missing context, clarify their requirements, and produce a cleaner prompt they can use in any AI tool.

## What the product does

The Studio guides users through a practical four-step workflow:

1. **Score** — Evaluate a raw prompt across five quality dimensions.
2. **Diagnose** — Identify strengths and missing information.
3. **Clarify** — Complete required, prompt-type-specific fields.
4. **Rewrite** — Generate a structured instruction using deterministic templates.

The current MVP supports six prompt types:

- Business idea
- Content writing
- Career and resume
- Product planning
- Learning plan
- General

## Core features

- Weighted prompt-quality score from 0 to 100
- Diagnosis across goal clarity, context, constraints, output format, and audience
- Prompt-type-specific clarification forms
- Required-field validation with clear missing-field feedback
- Type-specific structured prompt templates
- Rule-based “What Changed” explanations for generated prompts
- Copy-to-clipboard feedback and fallback behavior
- Before-and-after prompt examples
- Transparent scoring methodology
- Responsive desktop and mobile layouts
- Deterministic scoring regression tests

## Tech stack

- [Next.js](https://nextjs.org/) App Router
- TypeScript
- Tailwind CSS
- React
- Vitest

## Privacy and zero-cost architecture

Prompt Quality Studio runs entirely in the browser and uses rule-based logic only.

- No API calls
- No external AI or model integration
- No database
- No authentication
- No payments or analytics
- No prompt storage
- No paid dependencies or services required

Prompt text is analyzed locally and is not sent to an external service.

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

```bash
# Start the local development server
npm run dev

# Run scoring regression tests
npm run test

# Run the TypeScript compiler checks
npm run typecheck

# Create an optimized production build
npm run build
```

## Deploying to Vercel

The project can be deployed on the Vercel free tier using the standard Next.js preset.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Keep the framework preset set to **Next.js**.
4. Deploy using the build command from `package.json`.

No environment variables or external services are required.

## Current limitations

- Scoring is based on deterministic keyword and phrase signals rather than semantic understanding.
- Prompt scoring uses the same five weighted dimensions for every prompt type.
- Indonesian-language scoring support is limited.
- Generated prompts use curated rule-based templates and do not rewrite prose using an AI model.
- User inputs and generated prompts are not persisted between sessions.
- The application does not evaluate the quality of responses produced by other AI tools.

## Future roadmap

Potential future extensions include:

- AI-assisted rewrite
- Prompt template library
- Prompt-type-aware scoring
- Rubric Linter / Eval Ops Mode

These roadmap items are not part of the current rule-based MVP.
