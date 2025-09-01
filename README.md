# Contract Redliner - Next.js App

A Next.js application for AI-powered contract redlining that analyzes contracts against user preferences. This application provides an intuitive web interface for the Contract Redliner API, allowing users to upload contracts, specify their preferences, and receive detailed AI-powered analysis with highlighted issues and suggested fixes.

## Features

- **AI-Powered Analysis**: Uses OpenAI/OpenRouter for intelligent contract analysis with support for multiple models including Claude 3.5 Sonnet and DeepSeek R1
- **Interactive UI**: Real-time highlighting and sidebar for issue management with color-coded severity levels
- **Modern Stack**: Next.js 14, React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **Built-in API**: Next.js API routes replace the external FastAPI backend for seamless integration
- **Responsive Design**: Mobile-friendly interface with dark/light theme support
- **Type Safety**: Full TypeScript integration with Zod validation
- **Form Handling**: React Hook Form with proper validation and error handling
- **State Management**: TanStack Query for efficient API state management
- **Accessibility**: WCAG compliant components from Radix UI

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- OpenRouter API key (or OpenAI API key)

### 1. Install Dependencies

In the `nextjs-app/` directory:

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in `nextjs-app/` with:

```bash
OPENROUTER_API_KEY=your_openrouter_key
# Optional: override the default model
MODEL=anthropic/claude-3.5-sonnet
```

### 3. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`.

## API

The app includes built-in API routes that replace the external FastAPI backend.

### POST /api/redline
Analyze a contract against user preferences using the configured model via OpenRouter.

Request body:
```json
{
  "preferences": "I prefer short term contracts under 1 year, and no non-compete clauses.",
  "contract": "This agreement shall be for a term of 2 years..."
}
```

Response:
```json
{
  "issues": [
    {
      "issue_name": "Long Term Contract",
      "line_range": { "start": "This agreement shall", "end": "2 years" },
      "severity": 4,
      "issue_description": "Contract term exceeds preferred 1 year limit",
      "issue_fix": "Reduce contract term to under 1 year",
      "replace_with": "This agreement shall be for a term of 11 months"
    }
  ],
  "summary": {
    "total_issues": 1,
    "high_severity_issues": 1,
    "medium_severity_issues": 0,
    "low_severity_issues": 0,
    "average_severity": 4.0
  }
}
```

Possible errors:
- 400: `{ "error": "Both preferences and contract are required" }`
- 500: `{ "error": "Invalid response format from AI model" }` or `{ "error": "Internal server error" }`

Example calls:
```bash
curl -sS -X POST http://localhost:3000/api/redline \
  -H 'Content-Type: application/json' \
  -d '{
    "preferences": "I prefer short term contracts under 1 year, and no non-compete clauses.",
    "contract": "This agreement shall be for a term of 2 years..."
  }'
```

```javascript
// Client-side example
const res = await fetch('/api/redline', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ preferences, contract })
});
const data = await res.json();
```

### POST /api/redline_mock
Returns a deterministic mock response for UI testing and development.

```bash
curl -sS -X POST http://localhost:3000/api/redline_mock \
  -H 'Content-Type: application/json' \
  -d '{"preferences":"p","contract":"c"}'
```

### GET /api/health
Simple health check.

```bash
curl -sS http://localhost:3000/api/health
```

## Design Overview

- LLM integration and prompts: `lib/redliner.ts`
  - Builds system/user prompts and calls OpenRouter via the `openai` client
  - Parses model output; returns array or raw string for downstream validation
- API routes: `app/api/redline/route.ts`, `app/api/redline_mock/route.ts`, `app/api/health/route.ts`
  - Validate input, parse/clean issues, compute summary, and return JSON
- Client helpers: `lib/api-service.ts`
  - `analyzeContract`, `analyzeContractMock`, `healthCheck`
- UI: Next.js 14, React 19, Tailwind, shadcn/ui components

Notes:
- The server normalizes model output. If the model returns a JSON string, it is parsed and invalid entries are dropped before summarization.
- You can change the model with the `MODEL` env variable; default is `anthropic/claude-3.5-sonnet`.

## Scripts

From `nextjs-app/`:

```bash
npm run dev    # start dev server
npm run build  # production build
npm run start  # start production server
npm run lint   # lint
```

## Built and maintained by Mercity AI