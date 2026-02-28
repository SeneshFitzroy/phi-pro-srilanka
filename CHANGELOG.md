# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-01

### Added
- **Enterprise CI/CD Pipeline** — 7 GitHub Actions workflows with 40+ jobs
  - `ci.yml` — 12-job CI with path filtering, Lighthouse auditing, Docker verification
  - `cd.yml` — 8-job progressive delivery with PR previews, smoke tests, GHCR publishing
  - `security.yml` — CodeQL SAST, TruffleHog secret scanning, OWASP headers, dependency review
  - `pr-validation.yml` — Auto-labeling (15+ labels), PR size analysis, commit linting
  - `quality.yml` — 5-job code quality with dependency freshness tracking
  - `release.yml` — 4-job automated releases with Docker image publishing
  - `stale.yml` — Enhanced stale management with separate issue/PR policies
- **GitHub Issue Forms** — Upgraded from Markdown to YAML-based issue forms
  - Bug report form with severity, module, role, and console error fields
  - Feature request form with acceptance criteria and priority
  - Documentation issue form
  - Template chooser configuration
- **Repository Governance**
  - `CODEOWNERS` — Automatic PR review assignments by file path
  - `dependabot.yml` — Automated dependency updates (npm, GitHub Actions, Docker)
  - `FUNDING.yml` — Sponsor configuration
  - `.github/labeler.yml` — 15+ auto-labeling rules for PRs

### Changed
- **LICENSE** — Corrected from Apache 2.0 to MIT (matching all README references)
- **Firestore Rules** — Rewritten in proper Firebase security rules syntax with helper functions, field validation, and audit log collection
- **CONTRIBUTING.md** — Fixed environment file reference to `.env.example`
- **README.md** — Updated CI/CD section to reflect 7 workflows (40+ jobs), enhanced security documentation, expanded project structure tree

### Removed
- Redundant `apps/web/.env.local.example` (consolidated to `.env.example`)
- Old Markdown issue templates (replaced with YAML forms)

## [1.0.0] - 2026-02-28

### Added

#### Core Platform
- Monorepo architecture with Turborepo + pnpm workspaces
- Next.js 14 App Router with TypeScript 5.x strict mode
- Firebase Authentication with email/password and Google OAuth
- Cloud Firestore real-time database integration
- Firebase Storage for document and image uploads
- Role-based access control (Public, PHI, SPHI, MOH Admin)
- Progressive Web App (PWA) with offline-first support via IndexedDB
- Trilingual support (English, Sinhala, Tamil) with i18next

#### Food Safety Module
- H800 Food Establishment Inspection (100-point grading: A/B/C)
- H801 Food Establishment Registration
- H802 Food Sampling & Lab Results
- H803 Inspection Calendar & Scheduling

#### School Health Module
- H1214 School Health Monthly Report
- H1046 Physical Defects Screening
- H1015 Water, Sanitation & Hygiene (WASH) Assessment
- H1247 School Vaccination Program Tracking
- H1014 School Health Activity Log

#### Epidemiology Module
- H399 Weekly Epidemiological Return
- H411 Monthly Communicable Disease Report
- Health-160 Disease Notification Form
- Structured Investigation Vehicle (SIV) for outbreaks
- GIS Disease Mapping with Mapbox integration

#### Occupational Health Module
- H1203 Factory Health Assessment
- H1204 Workplace Safety Inspection
- H1205 Worker Health Survey
- OHS Compliance Checklist

#### Administration Module
- H795 Grama Niladhari Division Mapping
- H796 Area Statistics & Demographics
- PHI-1 Monthly Activity Report
- H1200 Area Health Survey
- Spot Map for spatial visualization

#### Public Portal
- Public food establishment grade search
- Online complaint submission system
- Public health alerts and notifications
- QR code verification for certificates
- Online payment gateway integration

#### Management Dashboard
- Approval workflow management
- User administration and role assignment
- Complaint tracking and resolution
- Permit management system
- Analytics dashboard with Recharts visualizations

#### UI/UX
- shadcn/ui component library with Radix primitives
- Responsive design (mobile-first, 320px → 2560px)
- Domain-specific color theming (5 modules, 5 colors)
- Dark/light mode with next-themes
- Command palette (⌘K) with cmdk
- Toast notifications with Sonner
- Drag-and-drop file upload with react-dropzone

#### Developer Experience
- GitHub Actions CI/CD pipeline (lint, type-check, test, build, deploy)
- CodeQL security analysis
- Bundle size analysis on PRs
- Automated stale issue management
- Conventional commit enforcement
- PR and issue templates
- Comprehensive documentation

### Security
- Firebase Auth with secure token management
- Zod validation on all form inputs
- Role-based Firestore security rules
- Environment variable protection
- CSP headers configured
- Regular dependency audits

## [0.1.0] - 2025-10-29

### Added
- Initial project scaffolding
- Repository setup with MIT license
- Basic monorepo configuration
