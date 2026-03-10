# UI Guidelines

## Overview

This document defines the visual design and user experience standards for the TODO application.

## Component Library

- Use **Material UI (MUI)** for all UI components
- Do not build custom components when an equivalent MUI component exists
- Use MUI's `sx` prop or `styled()` for component-level styling; avoid plain CSS files for new components

## Color Palette

| Role             | Color Token           | Hex       |
|------------------|-----------------------|-----------|
| Primary          | `primary.main`        | `#1976D2` |
| Primary Dark     | `primary.dark`        | `#115293` |
| Secondary        | `secondary.main`      | `#9C27B0` |
| Background       | `background.default`  | `#F5F5F5` |
| Surface          | `background.paper`    | `#FFFFFF` |
| Error            | `error.main`          | `#D32F2F` |
| Success          | `success.main`        | `#388E3C` |
| Text Primary     | `text.primary`        | `#212121` |
| Text Secondary   | `text.secondary`      | `#757575` |

Use the MUI theme to define these values — do not hardcode hex values in component code.

## Typography

- Font family: **Roboto** (loaded via MUI's default theme)
- Page title: `h4` variant
- Section headings: `h6` variant
- Task titles: `body1` variant, medium weight
- Supporting text (due dates, labels): `body2` variant
- Do not use font sizes smaller than `0.75rem` (`caption`) in any UI element

## Buttons

- Use `variant="contained"` for primary actions (e.g., Add Task, Save)
- Use `variant="outlined"` for secondary actions (e.g., Cancel, Edit)
- Use `variant="text"` or an `IconButton` for destructive/low-emphasis actions (e.g., Delete)
- Buttons must always have a visible label or an `aria-label` when icon-only

## Priority Indicators

| Priority | Color chip |
|----------|------------|
| High     | `error` (red) |
| Medium   | `warning` (amber) |
| Low      | `success` (green) |

Use MUI `<Chip>` components with the corresponding `color` prop to display priority.

## Layout

- Maximum content width: `960px`, centered on the page
- Use MUI `<Container>` with `maxWidth="md"` as the root layout wrapper
- Use MUI `<Stack>` and `<Grid>` for spacing and alignment; avoid manual margin/padding overrides where possible
- Maintain consistent `16px` (theme spacing `2`) gutters between elements

## Forms & Inputs

- Use MUI `<TextField>` with `variant="outlined"` for all text inputs
- Show inline validation errors using the `error` and `helperText` props on `<TextField>`
- Due date input: use MUI `<DatePicker>` from `@mui/x-date-pickers`
- Required fields must be marked with an asterisk (`*`) via the `required` prop

## Accessibility

- All interactive elements must be keyboard-navigable
- All images and icon-only buttons must have descriptive `alt` text or `aria-label`
- Color must not be the sole means of conveying information (e.g., priority chips also display a text label)
- Minimum touch/click target size: `44x44px`
- Maintain a color contrast ratio of at least **4.5:1** for normal text and **3:1** for large text (WCAG AA)
- Use semantic HTML elements (`<main>`, `<nav>`, `<section>`, `<ul>`, `<li>`) where appropriate

## Responsive Design

- The app must be usable on screens as narrow as `375px`
- Use MUI breakpoints (`xs`, `sm`, `md`) to adapt layouts — stack columns vertically on mobile
- Hide non-critical columns (e.g., description) in the task list on small screens

## Empty & Loading States

- Show a centered `<CircularProgress>` spinner while tasks are loading
- Show a friendly empty-state illustration and call-to-action when no tasks exist
- Show a MUI `<Snackbar>` with `<Alert>` for success and error feedback after user actions (auto-dismiss after 4 seconds)
