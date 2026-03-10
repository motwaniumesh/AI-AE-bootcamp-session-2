/**
 * Page Object Model for the Todo application.
 * Encapsulates all selectors and interactions for E2E tests.
 */
class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  async addTask({ title, priority }) {
    await this.page.getByLabel('Title').fill(title);
    if (priority) {
      await this.page.getByLabel('Priority *').click();
      await this.page.getByRole('option', { name: new RegExp(priority, 'i') }).click();
    }
    await this.page.getByRole('button', { name: 'Add Task', exact: true }).first().click();
    // Wait for the network call to complete and the task to appear
    await this.page.waitForTimeout(300);
  }

  // ── Task list helpers ─────────────────────────────────────────────────────
  taskCard(title) {
    return this.page.getByText(title).first();
  }

  async getTaskTitles() {
    return this.page.getByRole('checkbox').evaluateAll((els) =>
      els.map((el) => el.getAttribute('aria-label') || '')
    );
  }

  async toggleTask(title) {
    await this.page
      .getByRole('checkbox', { name: new RegExp(`mark "${title}"`, 'i') })
      .click();
    await this.page.waitForTimeout(200);
  }

  async deleteTask(title) {
    await this.page
      .getByRole('button', { name: new RegExp(`delete "${title}"`, 'i') })
      .click();
    await this.page.waitForTimeout(200);
  }

  async editTask(title, updates) {
    await this.page
      .getByRole('button', { name: new RegExp(`edit "${title}"`, 'i') })
      .click();
    await this.page.waitForSelector('[role="dialog"]');

    if (updates.title !== undefined) {
      const titleField = this.page.getByRole('dialog').getByLabel('Title');
      await titleField.clear();
      await titleField.fill(updates.title);
    }
    if (updates.priority !== undefined) {
      await this.page.getByRole('dialog').getByLabel('Priority').click();
      await this.page.getByRole('option', { name: new RegExp(updates.priority, 'i') }).click();
    }
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForTimeout(300);
  }

  // ── Filter bar ────────────────────────────────────────────────────────────
  async filterByStatus(status) {
    await this.page.getByRole('button', { name: new RegExp(`^${status}$`, 'i') }).click();
    await this.page.waitForTimeout(200);
  }

  // ── Clear completed ───────────────────────────────────────────────────────
  async clearCompleted() {
    await this.page.getByRole('button', { name: /clear completed/i }).click();
    await this.page.waitForTimeout(300);
  }

  // ── Assertions ────────────────────────────────────────────────────────────
  async expectTaskVisible(title) {
    await this.page.waitForSelector(`text=${title}`);
  }

  async expectTaskNotVisible(title) {
    await this.page.waitForFunction(
      (t) => !document.body.innerText.includes(t),
      title,
      { timeout: 3000 }
    );
  }

  async expectEmptyState() {
    await this.page.waitForSelector('text=No tasks yet');
  }

  async expectSnackbar(text) {
    await this.page.waitForSelector(`text=${text}`, { timeout: 5000 });
  }
}

module.exports = { TodoPage };
