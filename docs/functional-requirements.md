# Functional Requirements

## Overview

This document outlines the core functional requirements for the TODO application.

## Task Management

### Creating Tasks
- The user can create a new task by entering a title
- The user can add an optional description to a task
- The user can assign a due date to a task when creating it
- The user can set a priority level for a task (Low, Medium, High)

### Viewing Tasks
- The user can view a list of all tasks
- Tasks are sorted by due date (earliest first) by default
- The user can filter tasks by status (All, Active, Completed)
- The user can filter tasks by priority level
- Each task displays its title, due date, priority, and completion status

### Editing Tasks
- The user can edit the title of an existing task
- The user can edit the description of an existing task
- The user can change the due date of an existing task
- The user can change the priority level of an existing task

### Completing Tasks
- The user can mark a task as complete
- The user can mark a completed task as incomplete (toggle)
- Completed tasks are visually distinguished from active tasks

### Deleting Tasks
- The user can delete a task
- The user can delete all completed tasks at once

## Sorting & Ordering

- Tasks are sorted by due date (ascending) by default
- The user can sort tasks by priority (High to Low)
- The user can sort tasks by creation date (newest first)
- The user can manually reorder tasks via drag and drop

## Persistence

- Tasks are persisted on the backend so they survive page refreshes
- The application loads existing tasks on startup
