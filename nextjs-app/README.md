# Contract Redliner - Next.js App

A Next.js application for AI-powered contract redlining that analyzes contracts against user preferences.

## Features

- **AI-Powered Analysis**: Uses OpenAI/OpenRouter for intelligent contract analysis
- **Interactive UI**: Real-time highlighting and sidebar for issue management
- **Modern Stack**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Built-in API**: Next.js API routes replace the external FastAPI backend

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL=anthropic/claude-3.5-sonnet

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `POST /api/redline` - Main contract analysis endpoint
- `POST /api/redline_mock` - Mock endpoint with sample data
- `GET /api/health` - Health check endpoint

## Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── redline/       # Main redline endpoint
│   │   ├── redline_mock/  # Mock endpoint
│   │   └── health/        # Health check
│   ├── results/           # Results page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── not-found.tsx      # 404 page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── contract-viewer.tsx
│   ├── issues-sidebar.tsx
│   └── react-query-provider.tsx
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── api-service.ts     # API service layer
│   ├── redliner.ts        # AI redlining logic
│   └── utils.ts           # Utility functions
└── next.config.js         # Next.js configuration
```

## Key Changes from Original

1. **Backend Integration**: FastAPI endpoints converted to Next.js API routes
2. **Routing**: React Router replaced with Next.js App Router
3. **API Calls**: Updated to use relative URLs for Next.js API routes
4. **Environment**: Uses Next.js environment variable conventions
5. **Build System**: Vite replaced with Next.js build system

## Usage

1. **Input**: Enter your preferences and contract text
2. **Analysis**: Click "Analyze Contract" to process
3. **Results**: Review highlighted issues in the contract viewer
4. **Actions**: Accept or reject suggested changes in the sidebar

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is licensed under the MIT License. 