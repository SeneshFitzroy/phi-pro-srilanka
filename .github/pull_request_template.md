## Description

<!-- Provide a concise summary of the changes and their motivation. -->
<!-- If this fixes a bug, describe what was wrong and how this PR fixes it. -->

## Type of Change

- [ ] 🐛 **Bug fix** — Non-breaking change that fixes an issue
- [ ] ✨ **New feature** — Non-breaking change that adds functionality
- [ ] 💥 **Breaking change** — Fix or feature that would cause existing functionality to change
- [ ] 📝 **Documentation** — Updates to docs, README, or comments only
- [ ] ♻️ **Refactoring** — Code restructuring with no functional changes
- [ ] 🎨 **Style / UI** — Visual or formatting changes
- [ ] ⚡ **Performance** — Optimization with no functional changes
- [ ] 🔒 **Security** — Fix for a security vulnerability
- [ ] 🧪 **Tests** — Adding or updating tests only
- [ ] 🔧 **Configuration** — Changes to build, CI, or tooling

## Related Issues

<!-- Link related issues using GitHub keywords: -->
<!-- Fixes #123 | Closes #456 | Relates to #789 -->

## Module(s) Affected

- [ ] 🟢 Food Safety
- [ ] 🔵 School Health
- [ ] 🔴 Epidemiology
- [ ] 🟡 Occupational Health
- [ ] 🟣 Administration
- [ ] 🌐 Public Portal
- [ ] 📊 Management Dashboard
- [ ] 📦 Shared Package (`@phi-pro/shared`)
- [ ] 🔐 Authentication / RBAC
- [ ] 🌍 Internationalization (i18n)
- [ ] ⚙️ Infrastructure / Config / CI

## Changes Made

<!-- List the specific changes in this PR. Be specific enough for reviewers. -->

-
-
-

## Screenshots / Recordings

<!-- Required for UI changes. Use the comparison table for before/after. -->

| Before | After |
|--------|-------|
|        |       |

## Testing

### Automated Tests
- [ ] Unit tests added / updated
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)

### Manual Testing
- [ ] Tested in Chrome (latest)
- [ ] Tested in Firefox (latest)
- [ ] Tested in Safari (latest)
- [ ] Tested in Edge (latest)
- [ ] Tested responsive design — Mobile (320px)
- [ ] Tested responsive design — Tablet (768px)
- [ ] Tested responsive design — Desktop (1440px+)

### Internationalization
- [ ] Tested in English (`en`)
- [ ] Tested in Sinhala (`si`)
- [ ] Tested in Tamil (`ta`)
- [ ] Translation keys added to all 3 locale files

## Deployment Notes

<!-- Any special deployment steps, environment variables, or migration notes? -->
<!-- e.g., "Requires MAPBOX_ACCESS_TOKEN in production environment" -->

N/A

## Checklist

### Code Quality
- [ ] Code follows project conventions and [CONTRIBUTING.md](CONTRIBUTING.md) guidelines
- [ ] Self-review of code performed
- [ ] Complex logic is commented and documented
- [ ] No `console.log`, `debugger`, or temporary code left behind
- [ ] No `any` types — proper TypeScript typing used
- [ ] Imports are from `@phi-pro/shared` for shared types (not local duplicates)

### Standards
- [ ] Accessibility standards maintained (WCAG 2.1 AA)
- [ ] No sensitive data exposed (API keys, credentials, PII)
- [ ] All new components use the domain color scheme
- [ ] Forms use React Hook Form + Zod validation

### CI/CD
- [ ] All CI checks pass (lint, type-check, tests, build)
- [ ] No new ESLint warnings introduced
- [ ] Bundle size has not increased significantly
- [ ] Lighthouse scores maintained (perf ≥90, a11y ≥95)

---

> **Reviewer Note**: Please verify the [Quality Gates](README.md#quality-gates) are satisfied before approving.
