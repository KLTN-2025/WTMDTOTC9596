# React 2025 App

A modern React application built with TypeScript, Vite, and best practices for 2025.

## 🚀 Features

- ⚡ **Vite** - Lightning fast build tool
- ⚛️ **React 19** - Latest React with concurrent features
- 🔷 **TypeScript** - Type safety and better developer experience
- 🎨 **ESLint + Prettier** - Code quality and formatting
- 🛠️ **Path Aliases** - Clean imports with `@/` prefix
- 🎯 **Modern Tooling** - Latest development tools and configurations

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
├── services/           # API services
├── constants/          # App constants
├── assets/             # Static assets
│   ├── images/         # Image files
│   └── icons/          # Icon files
├── styles/             # Global styles
└── pages/              # Page components
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd react-2025-app
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Copy environment variables

```bash
cp env.example .env
```

4. Start development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Supabase Cloud Deployment

```bash
npx supabase login
```

3. Link the remote project:

```bash
npx supabase link --project-ref <SUPABASE_PROJECT_REF>
```

4. Push database migrations to the linked cloud project:

```bash
npx supabase db push --yes
```

5. Load environment variables for Lambda Functions:

```bash
npx supabase secrets set --env-file ./supabase/.env.example
```

6. Deploy Lambda Functions (if any):

```bash
npx supabase functions deploy
```

### Seed Master Data

Run the seed script after migrations to populate master data (brands, categories, etc.):

```bash
npm run seed
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## 🎯 Path Aliases

The project uses path aliases for cleaner imports:

```typescript
// Instead of
import { Button } from '../../../components/ui/Button'

// Use
import { Button } from '@/components/ui/Button'
```

Available aliases:

- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`
- `@/contexts/*` → `src/contexts/*`
- `@/services/*` → `src/services/*`
- `@/constants/*` → `src/constants/*`
- `@/assets/*` → `src/assets/*`
- `@/styles/*` → `src/styles/*`
- `@/pages/*` → `src/pages/*`

## 🔧 Configuration

### ESLint

The project uses ESLint with:

- TypeScript support
- React rules
- Accessibility rules
- Import organization
- Prettier integration

### Prettier

Code formatting with:

- Single quotes
- No semicolons
- 2-space indentation
- 100 character line length

### VSCode

Recommended extensions and settings are included in `.vscode/`:

- Auto-formatting on save
- ESLint integration
- TypeScript support
- Code snippets
- Debugging configuration

## 🚀 Deployment

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📝 Code Style

- Use TypeScript for all new files
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Use conventional commits format

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
