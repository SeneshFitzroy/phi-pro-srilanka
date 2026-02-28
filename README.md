<div align="center">

# 🏥 PHI-PRO

### Digital Health Enforcement & Integrated Intelligence System

[![CI Pipeline](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/ci.yml/badge.svg)](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/cd.yml/badge.svg)](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.x-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.30-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](LICENSE)
[![Security](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/security.yml/badge.svg)](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/security.yml)
[![Code Quality](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/quality.yml/badge.svg)](https://github.com/SeneshFitzroy/phi-pro-srilanka/actions/workflows/quality.yml)

**A comprehensive, production-grade Progressive Web Application (PWA) designed to digitize and modernize the operational workflows of Sri Lanka's 1,793 Public Health Inspectors across 354 MOH areas.**

[Live Demo](https://phi-pro-srilanka.vercel.app) · [Documentation](#-documentation) · [Report Bug](.github/ISSUE_TEMPLATE/bug_report.md) · [Request Feature](.github/ISSUE_TEMPLATE/feature_request.md)

---

</div>

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Feature Modules](#-feature-modules)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Authentication & RBAC](#-authentication--rbac)
- [Internationalization](#-internationalization)
- [Database Schema](#-database-schema)
- [API & Services](#-api--services)
- [Testing Strategy](#-testing-strategy)
- [Deployment](#-deployment)
- [Security](#-security)
- [Performance](#-performance)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 Overview

**PHI-PRO** (Public Health Inspector — Professional Operations) is an enterprise-grade digital health enforcement platform that transforms Sri Lanka's paper-based public health inspection system into a unified, intelligent, cloud-native solution.

The platform digitizes **30+ official MOH forms** (H-series: H795, H796, H800, H801, H802, H803, H1200, H1203, H1204, H1205, H1214, H1046, H1015, H1247, H1014, H399, H411, Health-160, PHI-1), provides real-time epidemiological surveillance through interactive GIS mapping, enables automated compliance workflows, and delivers actionable analytics dashboards for data-driven public health decision-making.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Domain Modules** | 5 specialized + 2 cross-cutting |
| **Digital Forms** | 30+ (based on official MOH H-series) |
| **User Roles** | 4 (Public, PHI, SPHI, MOH Admin) |
| **Languages** | 3 (English, Sinhala, Tamil) |
| **Pages/Routes** | 49 statically optimized |
| **Shared Type Definitions** | 11 comprehensive type files |
| **First Load JS** | ~105 kB (optimized) |

---

## 🔬 Problem Statement

Sri Lanka's public health enforcement system faces critical operational challenges:

1. **Paper-Based Workflows** — PHIs manually complete 15+ different paper forms per inspection visit, leading to data loss, duplication, and delays in reporting
2. **Fragmented Data Silos** — Health data is scattered across 354 MOH areas with no centralized digital repository, preventing cross-district analysis
3. **Delayed Disease Surveillance** — Weekly epidemiological returns (H399) take 7-14 days to reach national level through manual postal systems
4. **No Real-Time Visibility** — Supervisory officers (SPHIs) and MOH administrators lack real-time visibility into field operations and compliance status
5. **Language Barriers** — Forms available only in English despite most PHIs operating in Sinhala/Tamil-speaking communities

**PHI-PRO addresses all five challenges** through a cloud-native, offline-capable, trilingual Progressive Web Application with real-time data synchronization.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Next.js 14 App Router (PWA)                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │    │
│  │  │  Food     │ │  School  │ │  Epi     │ │  Occ     │       │    │
│  │  │  Safety   │ │  Health  │ │  demiol. │ │  Health  │       │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐                │    │
│  │  │  Admin   │ │  Public  │ │  Management  │                │    │
│  │  │  Module  │ │  Portal  │ │  Dashboard   │                │    │
│  │  └──────────┘ └──────────┘ └──────────────┘                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│  ┌───────────────┐  ┌───────┴────────┐  ┌────────────────┐         │
│  │  IndexedDB    │  │  React Context  │  │  Service Worker│         │
│  │  (Offline)    │  │  (State Mgmt)  │  │  (PWA Cache)   │         │
│  └───────────────┘  └───────┬────────┘  └────────────────┘         │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────┼──────────────────────────────────────┐
│                        BACKEND LAYER (Firebase)                      │
│  ┌───────────────┐  ┌───────┴────────┐  ┌────────────────┐         │
│  │  Firebase     │  │  Cloud         │  │  Firebase      │         │
│  │  Auth         │  │  Firestore     │  │  Storage       │         │
│  │  (Identity)   │  │  (Database)    │  │  (Files)       │         │
│  └───────────────┘  └────────────────┘  └────────────────┘         │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │  Cloud        │  │  Firebase      │  │  Google        │         │
│  │  Functions    │  │  Hosting       │  │  Analytics     │         │
│  │  (Serverless) │  │  (CDN)        │  │  (Telemetry)   │         │
│  └───────────────┘  └────────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                               │
│  ┌───────────────┐  ┌───────┴────────┐  ┌────────────────┐         │
│  │  GitHub       │  │  Vercel        │  │  Docker        │         │
│  │  Actions CI   │  │  Edge Network  │  │  Container     │         │
│  └───────────────┘  └────────────────┘  └────────────────┘         │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │  Turborepo    │  │  CodeQL        │  │  Mapbox        │         │
│  │  Build Cache  │  │  Security      │  │  GIS API       │         │
│  └───────────────┘  └────────────────┘  └────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router** | Server Components for optimal SSR/SSG, built-in code splitting, image optimization |
| **Firebase Backend** | Zero server management, real-time sync, offline persistence, generous free tier |
| **Turborepo Monorepo** | Shared types across packages, parallel builds, remote caching |
| **PWA Architecture** | Offline-first for field inspectors in low-connectivity areas |
| **Tailwind + shadcn/ui** | Consistent design system, accessibility-first (WCAG 2.1 AA), tree-shakeable |

---

## 🛠 Technology Stack

### Core Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org/) | 14.2.29 | React meta-framework with App Router, SSR/SSG |
| [React](https://react.dev/) | 18.3.1 | UI library with Server Components |
| [TypeScript](https://typescriptlang.org/) | 5.8.3 | Static type safety with strict mode |

### UI & Styling

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Accessible component primitives (Radix UI) |
| [Radix UI](https://www.radix-ui.com/) | Various | Headless accessible UI primitives |
| [Lucide React](https://lucide.dev/) | 0.513.0 | Modern icon library (1000+ icons) |
| [class-variance-authority](https://cva.style/) | 0.7.1 | Component variant management |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.3.0 | Intelligent Tailwind class merging |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Dark/light mode theming |
| [cmdk](https://cmdk.paco.me/) | 1.0.4 | Command palette (⌘K) |
| [Sonner](https://sonner.emilkowal.ski/) | 2.0.3 | Toast notification system |

### Backend & Data

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Firebase Auth](https://firebase.google.com/products/auth) | 11.7.1 | Authentication & identity management |
| [Cloud Firestore](https://firebase.google.com/products/firestore) | 11.7.1 | NoSQL document database with real-time sync |
| [Firebase Storage](https://firebase.google.com/products/storage) | 11.7.1 | File/image storage with security rules |
| [IndexedDB (idb)](https://github.com/nicedoc/idb) | 8.0.3 | Client-side offline data persistence |

### Forms & Validation

| Technology | Version | Purpose |
|-----------|---------|---------|
| [React Hook Form](https://react-hook-form.com/) | 7.56.4 | Performant form management |
| [Zod](https://zod.dev/) | 3.25.20 | Schema-first TypeScript validation |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | 5.0.1 | Zod ↔ React Hook Form bridge |

### Visualization & Reporting

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Recharts](https://recharts.org/) | 2.15.3 | Composable chart library |
| [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs) | 3.12.0 | Interactive GIS disease mapping |
| [React Map GL](https://visgl.github.io/react-map-gl/) | 7.1.9 | React wrapper for Mapbox |
| [@react-pdf/renderer](https://react-pdf.org/) | 4.3.0 | PDF report generation |
| [QRCode.react](https://github.com/zpao/qrcode.react) | 4.2.0 | QR code generation for permits |
| [xlsx](https://sheetjs.com/) | 0.18.5 | Excel export for data reports |
| [html2canvas](https://html2canvas.hertzen.com/) | 1.4.1 | Screenshot/image export |

### Internationalization

| Technology | Version | Purpose |
|-----------|---------|---------|
| [i18next](https://www.i18next.com/) | 25.2.1 | Internationalization framework |
| [react-i18next](https://react.i18next.com/) | 15.5.2 | React bindings for i18next |
| [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) | 8.0.5 | Auto-detect user language |

### Build & DevOps

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Turborepo](https://turbo.build/) | 2.3.0 | High-performance monorepo build system |
| [pnpm](https://pnpm.io/) | 10.30.3 | Fast, disk-efficient package manager |
| [ESLint](https://eslint.org/) | 9.27.0 | Static code analysis |
| [Prettier](https://prettier.io/) | 3.4.0 | Opinionated code formatter |
| [Husky](https://typicode.github.io/husky/) | 9.x | Git hooks for quality gates |
| [lint-staged](https://github.com/lint-staged/lint-staged) | Latest | Run linters on staged files |
| [commitlint](https://commitlint.js.org/) | Latest | Enforce conventional commits |
| [Docker](https://www.docker.com/) | Latest | Containerized deployment |
| [GitHub Actions](https://github.com/features/actions) | Latest | CI/CD automation |

---

## 📦 Feature Modules

### 🟢 Food Safety Module

Digitizes the food establishment inspection lifecycle based on official MOH H-series forms.

| Form | ID | Description |
|------|----|-------------|
| Food Inspection | H800 | 100-point inspection scoring → A/B/C grading |
| Registration | H801 | Food establishment registration & licensing |
| Sampling | H802 | Food sampling collection & laboratory results |
| Calendar | H803 | Inspection scheduling & visit calendar |

**Key Features:** Real-time grading calculator, photo evidence capture, PDF report generation, public grade display

### 🔵 School Health Module

Comprehensive school health program tracking aligned with the national school health policy.

| Form | ID | Description |
|------|----|-------------|
| Monthly Report | H1214 | Monthly school health activity report |
| Physical Defects | H1046 | Student physical defect screening & referral |
| WASH Assessment | H1015 | Water, Sanitation & Hygiene evaluation |
| Vaccination | H1247 | School vaccination coverage tracking |
| Activity Log | H1014 | School health program activity record |

**Key Features:** Student health tracking, defect referral workflow, vaccination coverage analytics, WASH scoring

### 🔴 Epidemiology Module

Real-time disease surveillance and outbreak investigation tools.

| Form | ID | Description |
|------|----|-------------|
| Weekly Return | H399 | Weekly epidemiological surveillance data |
| Monthly Report | H411 | Monthly communicable disease summary |
| Notification | Health-160 | Immediate notifiable disease report |
| Investigation | SIV | Structured outbreak investigation |
| GIS Map | Custom | Interactive disease density mapping |

**Key Features:** Real-time outbreak alerts, GIS heatmaps, disease trend analysis, contact tracing support

### 🟡 Occupational Health Module

Workplace health and safety assessment tools.

| Form | ID | Description |
|------|----|-------------|
| Factory Health | H1203 | Factory/workplace health assessment |
| Safety Inspection | H1204 | Workplace safety compliance check |
| Worker Survey | H1205 | Worker health & wellbeing survey |
| OHS Checklist | Custom | Occupational health standards checklist |

**Key Features:** Compliance scoring, worker health analytics, hazard tracking, remediation follow-up

### 🟣 Administration Module

Area management, demographics, and administrative reporting.

| Form | ID | Description |
|------|----|-------------|
| GN Mapping | H795 | Grama Niladhari division mapping |
| Area Statistics | H796 | Demographic & health statistics by area |
| Monthly Report | PHI-1 | PHI monthly activity & performance report |
| Area Survey | H1200 | Comprehensive area health survey |
| Spot Map | Custom | Spatial visualization of health events |

**Key Features:** Division mapping, population demographics, performance metrics, spatial analysis

### 🌐 Public Portal

Citizen-facing portal for transparency and public engagement.

- **Food Grades** — Search and view food establishment hygiene grades
- **Complaints** — Submit public health complaints online
- **Health Alerts** — View active public health alerts in your area
- **Verify** — QR code verification for permits and certificates
- **Payments** — Online payment for permits and licenses

### 📊 Management Dashboard

Supervisory tools for SPHIs and MOH administrators.

- **Approvals** — Review and approve field submissions
- **User Management** — Manage PHI accounts, roles, and assignments
- **Complaint Tracking** — Monitor and resolve public complaints
- **Permit Management** — Issue, renew, and revoke permits
- **Analytics** — Cross-module analytics with Recharts visualizations

---

## 📁 Project Structure

```
phi-pro-srilanka/
│
├── .github/                          # GitHub Configuration
│   ├── workflows/                    # CI/CD Pipeline Definitions (7 workflows)
│   │   ├── ci.yml                    # Continuous Integration (12 jobs)
│   │   ├── cd.yml                    # Continuous Deployment (8 jobs)
│   │   ├── security.yml              # Security analysis (CodeQL, secrets, OWASP)
│   │   ├── pr-validation.yml         # PR automation (labels, size, linting)
│   │   ├── quality.yml               # Code quality metrics (5 jobs)
│   │   ├── release.yml               # Automated release creation (4 jobs)
│   │   └── stale.yml                 # Stale issue/PR management
│   ├── ISSUE_TEMPLATE/               # GitHub Issue Form Templates
│   │   ├── bug_report.yml            # Bug report form (YAML)
│   │   ├── feature_request.yml       # Feature request form (YAML)
│   │   ├── documentation.yml         # Documentation issue form
│   │   └── config.yml                # Template chooser configuration
│   ├── labeler.yml                   # Auto-labeling rules (15+ labels)
│   ├── dependabot.yml                # Automated dependency updates
│   ├── CODEOWNERS                    # Code ownership for PR reviews
│   ├── FUNDING.yml                   # Sponsor configuration
│   └── pull_request_template.md      # PR template with checklist
│
├── .husky/                           # Git Hooks
│   ├── pre-commit                    # Lint-staged on commit
│   └── commit-msg                    # Commitlint validation
│
├── .vscode/                          # VS Code Workspace Config
│   ├── extensions.json               # Recommended extensions
│   └── settings.json                 # Editor settings
│
├── apps/                             # Application Packages
│   └── web/                          # Next.js Web Application
│       ├── public/                   # Static assets
│       │   └── manifest.json         # PWA manifest
│       ├── src/
│       │   ├── app/                  # Next.js App Router (49 routes)
│       │   │   ├── globals.css       # Global styles + Tailwind
│       │   │   ├── layout.tsx        # Root layout (providers, fonts)
│       │   │   ├── page.tsx          # Landing page (/)
│       │   │   ├── login/            # Authentication
│       │   │   │   └── page.tsx
│       │   │   ├── forgot-password/
│       │   │   │   └── page.tsx
│       │   │   ├── dashboard/        # Protected dashboard
│       │   │   │   ├── layout.tsx    # Dashboard shell (sidebar, nav)
│       │   │   │   ├── page.tsx      # Dashboard home
│       │   │   │   ├── food/         # 🟢 Food Safety (5 pages)
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── inspection/
│       │   │   │   │   ├── registration/
│       │   │   │   │   ├── sampling/
│       │   │   │   │   └── calendar/
│       │   │   │   ├── school/       # 🔵 School Health (6 pages)
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── monthly/
│       │   │   │   │   ├── defects/
│       │   │   │   │   ├── wash/
│       │   │   │   │   ├── vaccine/
│       │   │   │   │   └── activity/
│       │   │   │   ├── epidemiology/ # 🔴 Epidemiology (6 pages)
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── weekly/
│       │   │   │   │   ├── monthly/
│       │   │   │   │   ├── notification/
│       │   │   │   │   ├── investigation/
│       │   │   │   │   └── map/
│       │   │   │   ├── occupational/ # 🟡 Occupational (5 pages)
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── factory-health/
│       │   │   │   │   ├── safety/
│       │   │   │   │   ├── worker-survey/
│       │   │   │   │   └── checklist/
│       │   │   │   ├── administration/ # 🟣 Administration (6 pages)
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── gn-mapping/
│       │   │   │   │   ├── statistics/
│       │   │   │   │   ├── monthly-report/
│       │   │   │   │   ├── area-survey/
│       │   │   │   │   └── spot-map/
│       │   │   │   ├── management/   # 📊 Management (6 pages)
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── approvals/
│       │   │   │   │   ├── users/
│       │   │   │   │   ├── complaints/
│       │   │   │   │   ├── permits/
│       │   │   │   │   └── analytics/
│       │   │   │   ├── profile/      # User profile
│       │   │   │   └── settings/     # App settings
│       │   │   └── public/           # 🌐 Public Portal (6 pages)
│       │   │       ├── page.tsx
│       │   │       ├── food-grades/
│       │   │       ├── complaints/
│       │   │       ├── alerts/
│       │   │       ├── verify/
│       │   │       └── payments/
│       │   ├── components/           # React Components
│       │   │   ├── auth-guard.tsx    # Route protection HOC
│       │   │   ├── providers.tsx     # Context provider tree
│       │   │   └── ui/              # shadcn/ui components
│       │   │       ├── button.tsx
│       │   │       ├── card.tsx
│       │   │       ├── input.tsx
│       │   │       └── label.tsx
│       │   ├── contexts/             # React Contexts
│       │   │   ├── auth-context.tsx  # Firebase Auth state
│       │   │   └── i18n-context.tsx  # Language/translation
│       │   ├── i18n/                 # Translation Files
│       │   │   ├── en.json          # English
│       │   │   ├── si.json          # Sinhala (සිංහල)
│       │   │   └── ta.json          # Tamil (தமிழ்)
│       │   └── lib/                  # Utilities & Services
│       │       ├── firebase.ts      # Firebase initialization
│       │       ├── firestore.ts     # Generic Firestore CRUD
│       │       └── utils.ts         # cn(), helpers
│       ├── .env.example             # Environment template
│       ├── .eslintrc.cjs            # ESLint configuration
│       ├── next.config.js           # Next.js configuration
│       ├── postcss.config.js        # PostCSS + Tailwind
│       ├── tailwind.config.js       # Tailwind theme config
│       ├── tsconfig.json            # TypeScript config
│       └── package.json             # Dependencies
│
├── packages/                         # Shared Packages
│   └── shared/                       # @phi-pro/shared
│       ├── src/
│       │   ├── index.ts             # Package entry point
│       │   ├── constants/
│       │   │   └── index.ts         # App-wide constants
│       │   ├── types/               # TypeScript type definitions
│       │   │   ├── administration.ts
│       │   │   ├── common.ts
│       │   │   ├── complaints.ts
│       │   │   ├── enums.ts
│       │   │   ├── epidemiology.ts
│       │   │   ├── food.ts
│       │   │   ├── forms.ts
│       │   │   ├── occupational.ts
│       │   │   ├── permits.ts
│       │   │   ├── school.ts
│       │   │   └── users.ts
│       │   ├── utils/
│       │   │   └── index.ts         # Shared utility functions
│       │   └── validation/
│       │       └── index.ts         # Zod schemas
│       ├── package.json
│       └── tsconfig.json
│
├── .dockerignore                     # Docker build exclusions
├── .editorconfig                     # Cross-editor formatting
├── .firebaserc                       # Firebase project aliases
├── .gitignore                        # Git exclusions
├── .lintstagedrc.cjs                 # Lint-staged config
├── .prettierignore                   # Prettier exclusions
├── .prettierrc                       # Prettier formatting rules
├── CHANGELOG.md                      # Version changelog (Keep a Changelog)
├── CODE_OF_CONDUCT.md                # Contributor Covenant v2.1
├── CONTRIBUTING.md                   # Contribution guide
├── commitlint.config.cjs            # Conventional commit rules
├── docker-compose.yml                # Docker orchestration
├── Dockerfile                        # Multi-stage production build
├── firebase.json                     # Firebase config
├── firestore.indexes.json            # Composite query indexes
├── firestore.rules                   # Firestore security rules
├── LICENSE                           # MIT License
├── package.json                      # Root workspace scripts
├── pnpm-lock.yaml                    # Dependency lock file
├── pnpm-workspace.yaml               # pnpm workspace config
├── README.md                         # This file
├── SECURITY.md                       # Security policy
├── storage.rules                     # Firebase Storage rules
└── turbo.json                        # Turborepo pipeline config
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version | Installation |
|------|----------------|--------------|
| **Node.js** | ≥ 20.0.0 | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 10.30.3 | `corepack enable && corepack prepare pnpm@10.30.3 --activate` |
| **Git** | ≥ 2.40 | [git-scm.com](https://git-scm.com/) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SeneshFitzroy/phi-pro-srilanka.git
cd phi-pro-srilanka

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your Firebase credentials

# 4. Start development server
pnpm dev

# 5. Open in browser
# → http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Production build (all packages) |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm type-check` | TypeScript strict type checking |
| `pnpm test` | Run test suite |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Remove all build artifacts and caches |

### Docker

```bash
# Build and run with Docker Compose
docker compose up --build

# Development mode with Firebase emulators
docker compose --profile dev up
```

---

## 🔄 CI/CD Pipeline

PHI-PRO implements a comprehensive, enterprise-grade CI/CD pipeline using GitHub Actions with **7 workflow definitions** and **40+ automated jobs**, including security scanning, PR automation, and progressive delivery.

### Pipeline Architecture

```
┌─────────────────────────────── CI PIPELINE (12 jobs) ─────────────────────────────────┐
│                                                                                        │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐    │
│  │ Change   │───→│ Install  │───→│   Lint   │───→│  Build   │───→│   Bundle     │    │
│  │ Detect   │    │  Deps    │    │ + Format │    │ Verify   │    │  Analysis    │    │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────────┘    │
│                       │          ┌──────────┐    ┌──────────┐    ┌──────────────┐    │
│                       ├─────────→│  Type    │    │ Security │    │  Lighthouse  │    │
│                       │          │  Check   │    │  Audit   │    │  (Perf/A11y) │    │
│                       │          └──────────┘    └──────────┘    └──────────────┘    │
│                       │          ┌──────────┐    ┌──────────┐    ┌──────────────┐    │
│                       └─────────→│  Tests   │───→│ Coverage │    │   Docker     │    │
│                                  │ (3 shards)│    │  Merge   │    │   Verify     │    │
│                                  └──────────┘    └──────────┘    └──────────────┘    │
└───────────────────────────────────────────────────────────────────────────────────────┘
                              │ all gates pass
┌─────────────────────────────┼──── CD PIPELINE (8 jobs) ─────────────────────────────┐
│                              ▼                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  Build   │───→│ PR Prev. │───→│  Smoke   │───→│  Deploy  │───→│ Firebase │      │
│  │  Prod    │    │ /Staging │    │  Tests   │    │   Prod   │    │  Deploy  │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                                                        │         ┌──────────┐      │
│                                                        └────────→│  Docker  │      │
│                                                                   │  GHCR   │      │
│                                                                   └──────────┘      │
└──────────────────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼── SECURITY & QUALITY ─────────────────────────────────┐
│                              ▼                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  CodeQL  │    │ Trufflehog│    │  OWASP   │    │Dependabot│    │PR Valid. │      │
│  │  SAST    │    │ Secrets  │    │ Headers  │    │ Updates  │    │ + Labels │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Workflow Definitions

| Workflow | Trigger | Jobs | Purpose |
|----------|---------|------|---------|
| [`ci.yml`](.github/workflows/ci.yml) | Push, PR, merge_group | 12 | Path filtering, lint, type-check, test (3 shards), build, security, bundle analysis, Lighthouse, Docker verify, coverage merge |
| [`cd.yml`](.github/workflows/cd.yml) | Push to main, PR | 8 | PR preview, staging deploy, smoke tests (8 endpoints), production (approval gate), Firebase deploy, Docker publish (GHCR), notifications |
| [`security.yml`](.github/workflows/security.yml) | PR, Weekly, Manual | 5 | CodeQL (security-extended), TruffleHog secret scanning, dependency review, OWASP headers, security gate |
| [`pr-validation.yml`](.github/workflows/pr-validation.yml) | Pull Request | 4 | Auto-labeling (15+ labels), PR size analysis (S/M/L/XL), commit message linting, PR description quality |
| [`quality.yml`](.github/workflows/quality.yml) | Weekly (Mon) | 5 | Dependency audit, license compliance, code metrics, dependency freshness, quality gate |
| [`release.yml`](.github/workflows/release.yml) | Version tags, Manual | 4 | Semver validation, categorized changelog, Docker image publish (GHCR), GitHub Release with artifacts |
| [`stale.yml`](.github/workflows/stale.yml) | Daily | 1 | Auto-close stale issues (30d) and PRs (14d) with separate policies |

### Quality Gates

Every pull request must pass all gates before merge:

- ✅ **ESLint** — Zero errors, zero warnings
- ✅ **Prettier** — Consistent code formatting
- ✅ **TypeScript** — Strict type checking (`noEmit`)
- ✅ **Tests** — All suites passing (3 parallel shards with coverage)
- ✅ **Build** — Successful production build (49/49 routes)
- ✅ **Security** — CodeQL + TruffleHog + dependency review clean
- ✅ **Bundle** — No size regression vs. base branch
- ✅ **Lighthouse** — Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90
- ✅ **Docker** — Container build verification passes
- ✅ **PR Validation** — Conventional commits, description quality, auto-labels

### Deployment Environments

| Environment | URL | Trigger | Approval |
|-------------|-----|---------|----------|
| **Preview** | `*.vercel.app` | Pull Request | Automatic |
| **Staging** | `staging.phi-pro.app` | Push to main | Automatic |
| **Production** | `phi-pro.app` | After smoke tests | Manual gate |

---

## 🔐 Authentication & RBAC

### Role Hierarchy

```
MOH Admin (Level 4) ─── Full system access
    └── SPHI (Level 3) ─── Supervisory access + approvals
        └── PHI Officer (Level 2) ─── All domain modules
            └── Public User (Level 1) ─── Public portal only
```

### Permission Matrix

| Feature | Public | PHI | SPHI | MOH Admin |
|---------|:------:|:---:|:----:|:---------:|
| View public grades | ✅ | ✅ | ✅ | ✅ |
| Submit complaints | ✅ | ✅ | ✅ | ✅ |
| Create inspections | ❌ | ✅ | ✅ | ✅ |
| Submit forms | ❌ | ✅ | ✅ | ✅ |
| Generate reports | ❌ | ✅ | ✅ | ✅ |
| View all area data | ❌ | ❌ | ✅ | ✅ |
| Approve submissions | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| System configuration | ❌ | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ❌ | ✅ |

### Authentication Flow

```
User → Login Page → Firebase Auth → JWT Token → Firestore Profile (role, mohArea)
                                                         │
                                                         ▼
                                               AuthGuard HOC → Route Access/Redirect
```

---

## 🌍 Internationalization

PHI-PRO supports all three official languages of Sri Lanka:

| Language | Code | Script | Coverage |
|----------|------|--------|----------|
| English | `en` | Latin | ✅ 100% |
| Sinhala | `si` | සිංහල | ✅ 100% |
| Tamil | `ta` | தமிழ் | ✅ 100% |

**Architecture**: i18next → auto-detect browser language → localStorage persistence → English fallback

---

## 🗄️ Database Schema

### Firestore Collections

```
firestore/
├── users/                    # User profiles & roles
├── food_inspections/         # H800, H801, H802, H803 forms
├── school_health/            # H1214, H1046, H1015, H1247, H1014
├── epidemiology/             # H399, H411, Health-160, SIV
├── occupational_health/      # H1203, H1204, H1205, OHS
├── complaints/               # Public complaint submissions
├── permits/                  # Health permits & certificates
└── public_alerts/            # Public health notifications
```

**11 composite indexes** configured in [`firestore.indexes.json`](firestore.indexes.json) for optimized cross-field queries.

---

## 🧪 Testing Strategy

| Level | Tool | Scope |
|-------|------|-------|
| **Unit** | Vitest | Utility functions, Zod schemas, formatters |
| **Component** | React Testing Library | UI components, form behavior |
| **Integration** | Vitest + MSW | Service layer, Firestore interactions |
| **E2E** | Playwright | Critical user flows (login, form submit) |
| **Visual** | Chromatic | UI snapshot regression |

```bash
pnpm test                    # Full suite
pnpm test -- --shard=1/3     # Parallel shard
pnpm test -- --coverage      # With coverage report
```

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| **Authentication** | Firebase Auth (JWT tokens, session management) |
| **Authorization** | RBAC via Firestore security rules (4-tier hierarchy) |
| **Storage** | File type + size validation in storage rules |
| **Input Validation** | Zod schemas (client + shared package) |
| **Secrets** | Environment variables (never committed) |
| **SAST** | GitHub CodeQL with `security-extended` + `security-and-quality` queries |
| **Secret Scanning** | TruffleHog verified secret detection in CI |
| **Dependency Review** | Automated vulnerability blocking on PRs (high severity) |
| **License Compliance** | GPL/copyleft license detection in quality pipeline |
| **OWASP** | Security headers validation |
| **Dependencies** | Dependabot automated weekly updates + `pnpm audit` in CI |
| **HTTPS** | Enforced via Vercel Edge Network |

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

---

## ⚡ Performance

| Metric | Target | Actual |
|--------|--------|--------|
| First Load JS (shared) | < 150 kB | **~105 kB** |
| Largest Contentful Paint | < 2.5s | < 1.8s |
| First Input Delay | < 100ms | < 50ms |
| Cumulative Layout Shift | < 0.1 | < 0.05 |
| Static Pages Generated | 49 | **49/49** |
| Build Time | < 60s | ~45s |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Project overview & architecture |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guide & conventions |
| [CHANGELOG.md](CHANGELOG.md) | Release history (Keep a Changelog) |
| [SECURITY.md](SECURITY.md) | Security policy & reporting |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Contributor Covenant v2.1 |
| [LICENSE](LICENSE) | MIT License |
| [.env.example](apps/web/.env.example) | Environment variable reference |
| [CODEOWNERS](.github/CODEOWNERS) | Code ownership for PR reviews |
| [dependabot.yml](.github/dependabot.yml) | Automated dependency configuration |

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, branch naming, commit conventions, and PR guidelines.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/SeneshFitzroy">
        <img src="https://github.com/SeneshFitzroy.png" width="100px;" alt="Senesh Fitzroy"/>
        <br />
        <sub><b>Dinura Senesh Mendis</b></sub>
      </a>
      <br />
      <sub>Student ID: 10952757</sub>
      <br />
      <sub>University of Plymouth</sub>
      <br />
      <sub>BSc (Hons) Software Engineering</sub>
      <br />
      <sub>PUSL3190 Computing Project</sub>
    </td>
  </tr>
</table>

📧 **10952757@students.plymouth.ac.uk**

---

## 🙏 Acknowledgments

- **University of Plymouth** — Academic supervision
- **Ministry of Health, Sri Lanka** — Domain expertise & H-series form specifications
- **[Next.js](https://nextjs.org/)** — React framework
- **[Firebase](https://firebase.google.com/)** — Backend platform
- **[shadcn/ui](https://ui.shadcn.com/)** — Component library
- **[Vercel](https://vercel.com/)** — Deployment platform
- **[Mapbox](https://www.mapbox.com/)** — GIS services

---

<div align="center">

**Built with ❤️ for Sri Lanka's Public Health Inspectors**

[![GitHub Stars](https://img.shields.io/github/stars/SeneshFitzroy/phi-pro-srilanka?style=social)](https://github.com/SeneshFitzroy/phi-pro-srilanka)

</div>
