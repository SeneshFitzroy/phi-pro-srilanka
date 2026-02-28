# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅ Active |
| < 1.0   | ❌ EOL |

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by emailing:

📧 **10952757@students.plymouth.ac.uk**

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested remediation (if any)

### Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 5 business days |
| Resolution | Within 30 days (critical), 90 days (moderate) |

### Scope

The following are in scope:
- Authentication and authorization flaws
- Data exposure vulnerabilities
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Injection vulnerabilities
- Insecure direct object references
- Firebase security rules bypass
- API key exposure

### Out of Scope

- Denial of service attacks
- Social engineering
- Physical security
- Issues in third-party services (Firebase, Vercel)

## Security Best Practices

This project follows these security measures:

1. **Authentication**: Firebase Auth with secure session management
2. **Authorization**: Role-based access control (RBAC) with 4 tiers
3. **Data Validation**: Zod schemas on all form inputs (client + server)
4. **Environment Variables**: All secrets stored in `.env.local` (gitignored)
5. **Dependencies**: Regular security audits via `pnpm audit`
6. **CI/CD**: GitHub CodeQL analysis on every push
7. **HTTPS**: Enforced via Vercel deployment
8. **CSP**: Content Security Policy headers configured
9. **Input Sanitization**: All user inputs sanitized before storage
10. **Firestore Rules**: Principle of least privilege

## Disclosure Policy

We follow coordinated vulnerability disclosure. We ask that you:

1. Allow us reasonable time to fix the issue before public disclosure
2. Make a good faith effort to avoid privacy violations
3. Not exploit the vulnerability beyond what is necessary for testing
