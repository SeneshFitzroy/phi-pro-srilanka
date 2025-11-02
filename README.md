# PHI-PRO: Digital Health Enforcement & Integrated Intelligence System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A comprehensive digital solution for Sri Lanka's 1,793 Public Health Inspectors (PHIs) to modernize health enforcement workflows, disease surveillance, and inter-agency coordination.

## Overview

PHI-PRO (Public Health Inspector - Professional Operations) transforms traditional paper-based health inspection processes into a unified digital platform. Built as a Progressive Web App (PWA), it supports offline-first operations critical for field inspectors working in areas with limited connectivity.

### Key Highlights
- **5 Domain Modules**: Food Safety, School Health, Epidemiology, Occupational Health, Administration
- **4 User Roles**: Public, PHI Officer, SPHI (Supervisory), MOH Administrator
- **30+ Digital Forms**: Based on official Sri Lankan MOH forms (H800, H795, H796, etc.)
- **Trilingual Support**: English, Sinhala, Tamil
- **Offline-First**: Service worker with IndexedDB for field operations
- **Real-time Dashboards**: Firebase-powered analytics and reporting

## Architecture

```
phi-pro-srilanka/
├── apps/
│   └── web/              # Next.js 14 App Router
├── packages/
│   └── shared/           # Shared types, validation, utilities
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Auth** | Firebase Auth |
| **Database** | Cloud Firestore |
| **Storage** | Firebase Storage |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **i18n** | i18next |
| **Build** | Turborepo + pnpm |

## Modules

### Food Safety - H800 inspection (100-point A/B/C), H801 registration, H802 sampling, H803 calendar
### School Health - H1214 monthly, H1046 defects, H1015 WASH, H1247 vaccination, H1014 activity
### Epidemiology - H399 weekly, H411 monthly, Health-160 notification, SIV investigation, GIS map
### Occupational Health - H1203 factory, H1204 safety, H1205 worker survey, OHS checklist
### Administration - H795 GN mapping, H796 statistics, PHI-1 monthly, H1200 survey, spot map
### Public Portal - Food grades, complaints, alerts, verification, payments
### Management - Approvals, users, complaints, permits, analytics

## Getting Started

```bash
git clone https://github.com/SeneshFitzroy/phi-pro-srilanka.git
cd phi-pro-srilanka
pnpm install
cp apps/web/.env.local.example apps/web/.env.local
pnpm dev