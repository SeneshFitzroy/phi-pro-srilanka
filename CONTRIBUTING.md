# Contributing to PHI-PRO

Thank you for your interest in contributing to PHI-PRO! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20.0.0 | Runtime |
| pnpm | 10.30.3 | Package manager |
| Git | ≥ 2.40 | Version control |

### Setup

```bash
# Clone the repository
git clone https://github.com/SeneshFitzroy/phi-pro-srilanka.git
cd phi-pro-srilanka

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env.local

# Start development server
pnpm dev
```

## Development Workflow

1. **Create a branch** from `develop`:
   ```bash
   git checkout -b feature/your-feature-name develop
   ```

2. **Make changes** following our coding standards

3. **Test locally**:
   ```bash
   pnpm lint          # Run linter
   pnpm type-check    # Check types
   pnpm test          # Run tests
   pnpm build         # Verify build
   ```

4. **Commit changes** using conventional commits

5. **Push and create a PR** against `develop`

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/food-inspection-pdf` |
| Bug Fix | `fix/description` | `fix/login-redirect-loop` |
| Hotfix | `hotfix/description` | `hotfix/auth-token-expiry` |
| Docs | `docs/description` | `docs/api-documentation` |
| Refactor | `refactor/description` | `refactor/firebase-service` |

## Coding Standards

### TypeScript

- Strict mode enabled (`"strict": true`)
- No `any` types — use proper typing from `@phi-pro/shared`
- Prefer `interface` over `type` for object shapes
- Export types from the shared package

### React / Next.js

- Use functional components with TypeScript generics
- Prefer Server Components; use `'use client'` only when needed
- Co-locate related files (component, styles, tests, types)
- Use React Hook Form + Zod for all form handling

### CSS / Styling

- Use Tailwind CSS utility classes
- Follow the domain color scheme:
  - Food Safety: `#22c55e` (green-500)
  - School Health: `#3b82f6` (blue-500)
  - Epidemiology: `#ef4444` (red-500)
  - Occupational Health: `#f59e0b` (amber-500)
  - Administration: `#8b5cf6` (violet-500)
- Use `cn()` utility from `@/lib/utils` for conditional classes

### File Organization

```
feature/
├── page.tsx           # Route page component
├── components/        # Feature-specific components
│   ├── feature-form.tsx
│   └── feature-table.tsx
├── hooks/             # Custom hooks
│   └── use-feature.ts
├── lib/               # Feature utilities
│   └── helpers.ts
└── __tests__/         # Tests
    └── feature.test.tsx
```

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

### Scopes

`web`, `shared`, `root`, `auth`, `firebase`, `i18n`, `ui`, `food`, `school`, `epi`, `occ`, `admin`, `public`, `mgmt`, `ci`

### Examples

```
feat(food): add PDF export for H800 inspection form
fix(auth): resolve token refresh on session expiry
docs(readme): update deployment instructions
ci(github): add CodeQL security analysis workflow
```

## Pull Request Process

1. Fill out the [PR template](.github/pull_request_template.md) completely
2. Ensure all CI checks pass
3. Request review from at least one maintainer
4. Address review feedback promptly
5. Squash merge into `develop`

## Reporting Issues

Use our [issue templates](.github/ISSUE_TEMPLATE/) for:
- 🐛 [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.md)

---

Thank you for contributing to PHI-PRO! 🇱🇰
