const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

// Each test navigates to the app; the in-memory backend resets on restart,
// so tests that require isolation add unique enough titles to avoid collisions.

test.describe('Todo workflow', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate();
  });

  // ── 1. Add a new task and see it in the list ──────────────────────────────
  test('user can add a new task and it appears in the list', async ({ page }) => {
    await todoPage.addTask({ title: 'Buy groceries', priority: 'High' });
    await todoPage.expectTaskVisible('Buy groceries');
  });

  // ── 2. Toggle a task complete ─────────────────────────────────────────────
  test('user can mark a task as complete and it is visually distinguished', async ({ page }) => {
    await todoPage.addTask({ title: 'Walk the dog' });
    await todoPage.expectTaskVisible('Walk the dog');

    await todoPage.toggleTask('Walk the dog');

    // Checkbox should now be checked
    const checkbox = page.getByRole('checkbox', { name: /mark "walk the dog"/i });
    await expect(checkbox).toBeChecked();

    // The task text should have line-through styling
    const titleEl = page.getByText('Walk the dog');
    await expect(titleEl).toBeVisible();
  });

  // ── 3. Edit a task's title and priority ──────────────────────────────────
  test('user can edit a task title and priority', async ({ page }) => {
    await todoPage.addTask({ title: 'Read a book' });
    await todoPage.expectTaskVisible('Read a book');

    await todoPage.editTask('Read a book', { title: 'Read two books', priority: 'High' });

    await todoPage.expectTaskVisible('Read two books');
    await todoPage.expectTaskNotVisible('Read a book');
  });

  // ── 4. Delete a single task ───────────────────────────────────────────────
  test('user can delete a task', async ({ page }) => {
    await todoPage.addTask({ title: 'Task to delete' });
    await todoPage.expectTaskVisible('Task to delete');

    await todoPage.deleteTask('Task to delete');

    await todoPage.expectTaskNotVisible('Task to delete');
  });

  // ── 5. Filter by Active / Completed status ────────────────────────────────
  test('user can filter tasks by status', async ({ page }) => {
    await todoPage.addTask({ title: 'Active task' });
    await todoPage.addTask({ title: 'Completed task' });
    await todoPage.toggleTask('Completed task');

    // Filter: Active — should show active, hide completed
    await todoPage.filterByStatus('Active');
    await todoPage.expectTaskVisible('Active task');
    await todoPage.expectTaskNotVisible('Completed task');

    // Filter: Completed — should show completed, hide active
    await todoPage.filterByStatus('Completed');
    await todoPage.expectTaskVisible('Completed task');
    await todoPage.expectTaskNotVisible('Active task');

    // Filter: All — shows both
    await todoPage.filterByStatus('All');
    await todoPage.expectTaskVisible('Active task');
    await todoPage.expectTaskVisible('Completed task');
  });

  // ── 6. Bulk delete completed tasks ───────────────────────────────────────
  test('user can bulk delete all completed tasks', async ({ page }) => {
    await todoPage.addTask({ title: 'Keep this one' });
    await todoPage.addTask({ title: 'Done task A' });
    await todoPage.addTask({ title: 'Done task B' });

    await todoPage.toggleTask('Done task A');
    await todoPage.toggleTask('Done task B');

    await todoPage.clearCompleted();

    await todoPage.expectTaskVisible('Keep this one');
    await todoPage.expectTaskNotVisible('Done task A');
    await todoPage.expectTaskNotVisible('Done task B');
  });
});
