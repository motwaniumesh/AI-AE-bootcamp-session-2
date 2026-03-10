# Coding Guidelines

## Overview

This document describes the coding style and quality principles for the TODO application. All contributors — human and AI — should follow these guidelines to keep the codebase consistent, readable, and maintainable.

## General Formatting

- Use **2 spaces** for indentation; never use tabs
- Maximum line length is **100 characters**
- Use **single quotes** for strings in JavaScript, except when the string itself contains a single quote
- Always add a **trailing newline** at the end of every file
- Remove all trailing whitespace before committing
- Use **UTF-8** encoding for all source files

## Naming Conventions

- **Variables and functions**: `camelCase` (e.g., `fetchTodos`, `isDone`)
- **React components**: `PascalCase` (e.g., `TaskList`, `AddTaskForm`)
- **Constants**: `UPPER_SNAKE_CASE` for module-level constants (e.g., `MAX_TITLE_LENGTH`)
- **Files**: `camelCase` for utility modules, `PascalCase` for React component files (e.g., `TaskCard.js`)
- Choose descriptive names — avoid abbreviations unless they are universally understood (e.g., `id`, `url`)

## Import Organization

Organize imports in the following order, separated by a blank line between each group:

1. **Node.js built-in modules** (e.g., `path`, `fs`)
2. **Third-party packages** (e.g., `react`, `express`, `axios`)
3. **Internal modules** — absolute or aliased paths
4. **Relative imports** — components, utilities, styles within the same package

Within each group, sort imports alphabetically. Do not mix default and named imports on the same line unnecessarily.

```js
// 1. Built-ins
import path from 'path';

// 2. Third-party
import express from 'express';
import React, { useState, useEffect } from 'react';

// 3. Internal / aliased
import { apiClient } from '@/utils/api';

// 4. Relative
import TaskCard from './TaskCard';
import './TaskList.css';
```

## Linting

- **ESLint** is the required linter for both frontend and backend code
- The project ESLint configuration must be respected; do not disable rules inline with `eslint-disable` comments unless absolutely necessary and accompanied by an explanatory comment
- Run `npm run lint` before committing and resolve all errors; warnings should also be addressed where practical
- Prettier is used for formatting; let it handle style decisions rather than debating them manually

## DRY Principle

- **Don't Repeat Yourself**: if the same logic appears in more than one place, extract it into a shared function, hook, or utility module
- Place shared backend utilities in `packages/backend/src/utils/`
- Place shared frontend utilities in `packages/frontend/src/utils/`
- Shared React logic that involves state or side effects should be extracted into a **custom hook** (`use` prefix, e.g., `useTodos`)
- However, do not over-abstract — only extract shared logic when there is a clear, concrete reuse case; avoid premature generalization

## Functions and Components

- Functions should do **one thing** and do it well; keep them short and focused
- Prefer **pure functions** (no side effects) wherever possible
- React components should be **functional components** using hooks; do not use class components
- Avoid deeply nested logic — extract inner blocks into named helper functions to improve readability
- Default exports are preferred for React components; named exports are preferred for utilities and hooks

## Error Handling

- Always handle errors at system boundaries: API calls, database operations, and user input
- In Express route handlers, use `try/catch` and pass errors to the next middleware via `next(err)`
- In React, display user-friendly error messages via MUI `<Alert>` components; do not expose raw error stack traces in the UI
- Never silently swallow errors with an empty `catch` block

## Comments

- Write code that is self-explanatory; comments should explain **why**, not **what**
- Remove commented-out code before merging; use version control history if you need to recover old code
- Use JSDoc-style comments for exported functions in shared utility modules to aid editor tooling

## Code Quality

- Keep pull requests small and focused on a single concern
- Avoid committing `console.log` statements; use proper logging in the backend
- Do not commit secrets, credentials, or environment-specific values — use `.env` files and ensure they are in `.gitignore`
- Resolve all lint errors and failing tests before opening a pull request
