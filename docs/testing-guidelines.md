# Testing Guidelines

## Overview

All new features must include appropriate tests. Tests must be maintainable, follow best practices, and be isolated and independent from one another — each test sets up its own data and does not rely on other tests. Setup and teardown hooks are required to ensure tests succeed on multiple consecutive runs.

## Unit Tests

- **Framework**: Jest
- **Purpose**: Test individual functions and React components in isolation
- **File naming**: `*.test.js` or `*.test.ts`
- **Backend location**: `packages/backend/__tests__/`
- **Frontend location**: `packages/frontend/src/__tests__/`
- Name test files to match what they're testing (e.g., `app.test.js` for testing `app.js`)

## Integration Tests

- **Framework**: Jest + Supertest
- **Purpose**: Test backend API endpoints with real HTTP requests
- **File naming**: `*.test.js` or `*.test.ts`
- **Location**: `packages/backend/__tests__/integration/`
- Name integration test files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints)

## End-to-End (E2E) Tests

- **Framework**: Playwright (required — do not use any other E2E framework)
- **Purpose**: Test complete UI workflows through browser automation
- **File naming**: `*.spec.js` or `*.spec.ts`
- **Location**: `tests/e2e/`
- Name E2E test files based on the user journey they test (e.g., `todo-workflow.spec.js`)
- Run tests against **one browser only**
- Use the **Page Object Model (POM)** pattern for all E2E tests to ensure maintainability
- Limit to **5–8 tests** covering critical user journeys — focus on happy paths and key edge cases, not exhaustive coverage

## Port Configuration

Always use environment variables with sensible defaults for port configuration to allow CI/CD workflows to dynamically detect ports.

- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is `3000`, but can be overridden with the `PORT` environment variable

## General Principles

- All tests must be **isolated and independent** — no test should depend on the state left by another test
- Use **setup and teardown hooks** (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`) to manage test data and ensure repeatability
- Every new feature must include appropriate unit, integration, and/or E2E tests depending on the scope of the change
- Keep tests **focused and readable** — a failing test should make it immediately clear what broke and why
- Avoid testing implementation details; test behavior and outcomes instead
