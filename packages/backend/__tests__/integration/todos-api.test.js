const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) db.close();
});

beforeEach(() => {
  db.prepare('DELETE FROM todos').run();
});

// ── helpers ───────────────────────────────────────────────────────────────────
const post = (payload) =>
  request(app).post('/api/todos').send(payload).set('Accept', 'application/json');

const createTodo = async (overrides = {}) => {
  const res = await post({ title: 'Test Todo', priority: 'medium', ...overrides });
  expect(res.status).toBe(201);
  return res.body;
};

// ── Full CRUD workflow ────────────────────────────────────────────────────────
describe('Todos API — full workflow', () => {
  it('create → list → edit → toggle → delete', async () => {
    // Create
    const created = await createTodo({
      title: 'Buy groceries',
      description: 'Milk and eggs',
      due_date: '2026-04-01',
      priority: 'high',
    });
    expect(created.id).toBeDefined();
    expect(created.completed).toBe(0);

    // List — should appear
    const listRes = await request(app).get('/api/todos');
    expect(listRes.status).toBe(200);
    expect(listRes.body.find(t => t.id === created.id)).toBeDefined();

    // Edit
    const editRes = await request(app)
      .put(`/api/todos/${created.id}`)
      .send({ title: 'Buy groceries & fruit', priority: 'medium' });
    expect(editRes.status).toBe(200);
    expect(editRes.body.title).toBe('Buy groceries & fruit');
    expect(editRes.body.priority).toBe('medium');

    // Toggle complete
    const toggleRes = await request(app).patch(`/api/todos/${created.id}/complete`);
    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.completed).toBe(1);

    // Toggle back
    const toggleBackRes = await request(app).patch(`/api/todos/${created.id}/complete`);
    expect(toggleBackRes.status).toBe(200);
    expect(toggleBackRes.body.completed).toBe(0);

    // Delete
    const deleteRes = await request(app).delete(`/api/todos/${created.id}`);
    expect(deleteRes.status).toBe(200);

    // Confirm gone
    const finalList = await request(app).get('/api/todos');
    expect(finalList.body.find(t => t.id === created.id)).toBeUndefined();
  });
});

// ── Bulk delete completed ─────────────────────────────────────────────────────
describe('Bulk delete completed todos', () => {
  it('removes all completed todos and leaves active ones intact', async () => {
    const a = await createTodo({ title: 'Done A' });
    const b = await createTodo({ title: 'Done B' });
    await createTodo({ title: 'Still active' });

    await request(app).patch(`/api/todos/${a.id}/complete`);
    await request(app).patch(`/api/todos/${b.id}/complete`);

    const res = await request(app).delete('/api/todos/completed');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);

    const remaining = await request(app).get('/api/todos');
    expect(remaining.body).toHaveLength(1);
    expect(remaining.body[0].title).toBe('Still active');
  });
});

// ── Filter by status ──────────────────────────────────────────────────────────
describe('Filter by status', () => {
  it('returns only active todos when status=active', async () => {
    const a = await createTodo({ title: 'Active task' });
    const b = await createTodo({ title: 'Done task' });
    await request(app).patch(`/api/todos/${b.id}/complete`);

    const res = await request(app).get('/api/todos?status=active');
    expect(res.status).toBe(200);
    expect(res.body.every(t => t.completed === 0)).toBe(true);
    expect(res.body.find(t => t.id === a.id)).toBeDefined();
    expect(res.body.find(t => t.id === b.id)).toBeUndefined();
  });

  it('returns only completed todos when status=completed', async () => {
    const a = await createTodo({ title: 'Active task' });
    const b = await createTodo({ title: 'Done task' });
    await request(app).patch(`/api/todos/${b.id}/complete`);

    const res = await request(app).get('/api/todos?status=completed');
    expect(res.status).toBe(200);
    expect(res.body.every(t => t.completed === 1)).toBe(true);
    expect(res.body.find(t => t.id === b.id)).toBeDefined();
  });
});

// ── Filter by priority ────────────────────────────────────────────────────────
describe('Filter by priority', () => {
  it('returns only todos matching the requested priority', async () => {
    await createTodo({ title: 'High task', priority: 'high' });
    await createTodo({ title: 'Medium task', priority: 'medium' });
    await createTodo({ title: 'Low task', priority: 'low' });

    const res = await request(app).get('/api/todos?priority=high');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].priority).toBe('high');
  });
});

// ── Sort verification ─────────────────────────────────────────────────────────
describe('Sort order', () => {
  it('sorts by due_date ascending by default (NULLs last)', async () => {
    await createTodo({ title: 'No due date' });
    await createTodo({ title: 'Far future', due_date: '2026-12-31' });
    await createTodo({ title: 'Near future', due_date: '2026-04-01' });

    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    const titles = res.body.map(t => t.title);
    expect(titles.indexOf('Near future')).toBeLessThan(titles.indexOf('Far future'));
    expect(titles[titles.length - 1]).toBe('No due date');
  });

  it('sorts by priority when sort=priority', async () => {
    await createTodo({ title: 'Low', priority: 'low' });
    await createTodo({ title: 'High', priority: 'high' });
    await createTodo({ title: 'Medium', priority: 'medium' });

    const res = await request(app).get('/api/todos?sort=priority');
    expect(res.status).toBe(200);
    const priorities = res.body.map(t => t.priority);
    expect(priorities[0]).toBe('high');
    expect(priorities[1]).toBe('medium');
    expect(priorities[2]).toBe('low');
  });
});
