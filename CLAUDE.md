# CLAUDE.md

This file provides guidance for AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

**Repository:** `my-first-web-app`
**Owner:** kaz-239
**Status:** Early stage — project is being bootstrapped

This is a new web application project. At the time of writing this file, the repository contains only a `README.md`. As the project grows, this file should be updated to reflect the actual stack, structure, and conventions adopted.

## Repository Structure

```
my-first-web-app/
├── README.md        # Project overview
└── CLAUDE.md        # This file — AI assistant guidance
```

As the project evolves, update the tree above to reflect the real directory layout (e.g. `src/`, `public/`, `tests/`, config files).

## Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `master` | Stable, production-ready code |
| `claude/<session-id>` | AI-assisted feature/fix branches |

- Work is done on feature branches and merged into `master` via pull requests.
- AI assistant branches must start with `claude/` followed by the session identifier.
- Never push directly to `master` without a review step.

### Commit Conventions

Write clear, imperative commit messages:

```
Add user authentication flow
Fix broken navigation link on mobile
Update README with setup instructions
```

- **First line:** Short imperative summary (≤72 chars)
- **Body (optional):** Explain *why* the change was made, not *what*
- Avoid vague messages like "fix stuff" or "update"

### Push Instructions

```bash
git push -u origin <branch-name>
```

If a push fails due to a network error, retry with exponential backoff (2 s, 4 s, 8 s, 16 s).

## Development Conventions

Since the tech stack has not yet been decided, the following are general best practices that apply regardless of framework. Update this section once the stack is chosen.

### General

- Keep files small and focused — one concern per module
- Prefer explicit over implicit behavior
- Write code that reads like prose where possible
- Delete dead code rather than commenting it out

### HTML / Templates

- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`, etc.)
- Include `alt` attributes on all images
- Ensure keyboard accessibility (`tabindex`, `aria-*` where needed)

### CSS / Styling

- Follow a consistent naming convention (BEM, utility-first, CSS Modules, etc. — document the choice here once made)
- Avoid inline styles unless driven by dynamic values
- Design mobile-first, then layer in desktop breakpoints

### JavaScript / TypeScript

- Prefer `const` over `let`; avoid `var`
- Use `async/await` over raw Promise chains for readability
- Keep functions pure where practical (no hidden side-effects)
- If TypeScript is adopted, avoid `any`; use proper types or `unknown`

### Testing

- Write tests alongside features, not after
- Test behavior, not implementation details
- Prefer unit tests for pure logic; integration/e2e tests for user flows

## Environment Setup

_To be filled in once the project is initialized. Typical steps will include:_

```bash
# Clone the repo
git clone <repo-url>
cd my-first-web-app

# Install dependencies (adjust for chosen package manager)
npm install   # or: yarn install / pnpm install

# Start local dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Document any required environment variables in a `.env.example` file at the repo root.

## Key Files to Know

| File | Purpose |
|------|---------|
| `README.md` | Human-facing project overview and quick-start |
| `CLAUDE.md` | AI assistant guidance (this file) |

_Add entries here as important configuration files, entry points, and scripts are created._

## Decisions Log

Record significant architectural or tooling decisions here so future contributors (human or AI) understand the reasoning.

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-18 | Created CLAUDE.md | Provide AI assistant context for this new project |

## Updating This File

Keep `CLAUDE.md` in sync with the project. When you:

- Choose a tech stack → update "Environment Setup" and add stack-specific conventions
- Add meaningful directories → update "Repository Structure"
- Adopt linting/formatting tools → document the commands and configs here
- Make a notable architectural decision → add a row to "Decisions Log"

A stale `CLAUDE.md` is worse than none — accuracy matters more than completeness.
