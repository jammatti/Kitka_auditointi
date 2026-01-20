# Sludge Audit Tool

A multi-user web-based tool for government organizations to systematically identify friction points in their service delivery processes.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. Run the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   ├── layout/      # Layout components
│   └── audit/       # Audit-specific components
├── pages/           # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── AuditView.tsx
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
│   └── supabase.ts  # Supabase client
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## Features

### Current Implementation

- Authentication (placeholder)
- Dashboard view
- Audit view with tabs:
  - Setup: Configure audit parameters
  - Journey: Map service delivery steps
  - Time: Analyze time spent
  - Ease: Evaluate ease of use
  - Summary: Review findings

### Planned Features

- User authentication with Supabase
- Multi-user collaboration
- Data persistence
- Export functionality
- Analytics and reporting

## Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT
