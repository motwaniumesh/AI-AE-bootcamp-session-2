const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) db.close();
});

beforeEach(() => {
  db.prepare('DELETE FROM todos').run();
});

// ── helpers ───────────────────────────────────────────────────────────────────
const createTodo = async (overrides = {}) => {
  const payload = { title: 'Test Todo', priority: 'medium', ...overrides };
  const response = await request(app)
    .post('/api/todos')
    .send(payload)
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

// ── GET /api/todos ────────────────────────────────────────────────────────────
describe('GET /api/todos', () => {
  it('returns an empty array when there are no todos', async () => {
    const response = await request(app).get('/api/todos');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('returns all todos with expected fields', async () => {
    await createTodo({ title: 'First', priority: 'high' });
    await createTodo({ title: 'Second', priority: 'low' });

    const response = await request(app).get('/api/todos');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);

    const todo = response.body[0];
    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('title');
    expect(todo).toHaveProperty('description');
    expect(todo).toHaveProperty('due_date');
    expect(todo).toHaveProperty('priority');
    expect(todo).toHaveProperty('completed');
    expect(todo).toHaveProperty('created_at');
  });

  it('filters by status=active', async () => {
    await createTodo({ title: 'Active' });
    await createTodo({ title: 'Completed' });
    await request(app).patch(`/api/todos/${(await createTodo({ title: 'Done' })).id}/complete`);

    const response = await request(app).get('/api/todos?status=active');
    expect(response.status).toBe(200);
    expect(response.body.every(t => t.completed === 0)).toBe(true);
  });

  it('filters by status=completed', async () => {
    const todo = await createTodo({ title: 'Will complete' });
    await request(app).patch(`/api/todos/${todo.id}/complete`);
    await createTodo({ title: 'Stays active' });

    const response = await request(app).get('/api/todos?status=completed');
    expect(response.status).toBe(200);
    expect(response.body.every(t => t.completed === 1)).toBe(true);
    expect(response.body).toHaveLength(1);
  });

  it('filters by priority', async () => {
    await createTodo({ title: 'High task', priority: 'high' });
    await createTodo({ title: 'Low task', priority: 'low' });

    const response = await request(app).get('/api/todos?priority=high');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].priority).toBe('high');
  });
});

// ── POST /api/todos ───────────────────────────────────────────────────────────
describe('POST /api/todos', () => {
  it('creates a todo with all fields', async () => {
    const payload = {
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      due_date: '2026-04-01',
      priority: 'high',
    };
    const response = await request(app)
      .post('/api/todos')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Buy groceries');
    expect(response.body.description).toBe('Milk, eggs, bread');
    expect(response.body.due_date).toBe('2026-04-01');
    expect(response.body.priority).toBe('high');
    expect(response.body.completed).toBe(0);
  });

  it('creates a todo with default medium priority', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Default priority' });
    expect(response.status).toBe(201);
    expect(response.body.priority).toBe('medium');
  });

  it('returns 400 when title is missing', async () => {
    const response = await request(app).post('/api/todos').send({ priority: 'low' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Todo title is required');
  });

  it('returns 400 when title is empty string', async () => {
    const response = await request(app).post('/api/todos').send({ title: '   ' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Todo title is required');
  });

  it('returns 400 for invalid priority', async () => {
    const response = await request(app)
      .post('/api/todos')
      .send({ title: 'Task', priority: 'urgent' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Priority must be low, medium, or high');
  });
});

// ── PUT /api/todos/:id ────────────────────────────────────────────────────────
describe('PUT /api/todos/:id', () => {
  it('updates title, description, due_date, and priority', async () => {
    const todo = await createTodo({ title: 'Original' });

    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ title: 'Updated', priority: 'high', due_date: '2026-05-01', description: 'New desc' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated');
    expect(response.body.priority).toBe('high');
    expect(response.body.due_date).toBe('2026-05-01');
    expect(response.body.description).toBe('New desc');
  });

  it('returns 404 for non-existent todo', async () => {
    const response = await request(app).put('/api/todos/999999').send({ title: 'X' });
    expect(response.status).toBe(404);
  });

  it('returns 400 for invalid id', async () => {
    const response = await request(app).put('/api/todos/abc').send({ title: 'X' });
    expect(response.status).toBe(400);
  });

  it('returns 400 when updating with invalid priority', async () => {
    const todo = await createTodo();
    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .send({ priority: 'critical' });
    expect(response.status).toBe(400);
  });
});

// ── PATCH /api/todos/:id/complete ─────────────────────────────────────────────
describe('PATCH /api/todos/:id/complete', () => {
  it('toggles a todo from incomplete to complete', async () => {
    const todo = await createTodo();
    expect(todo.completed).toBe(0);

    const response = await request(app).patch(`/api/todos/${todo.id}/complete`);
    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(1);
  });

  it('toggles a todo from complete back to incomplete', async () => {
    const todo = await createTodo();
    await request(app).patch(`/api/todos/${todo.id}/complete`);

    const response = await request(app).patch(`/api/todos/${todo.id}/complete`);
    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(0);
  });

  it('returns 404 for non-existent todo', async () => {
    const response = await request(app).patch('/api/todos/999999/complete');
    expect(response.status).toBe(404);
  });
});

// ── DELETE /api/todos/completed ───────────────────────────────────────────────
describe('DELETE /api/todos/completed', () => {
  it('deletes all completed todos', async () => {
    const a = await createTodo({ title: 'Done A' });
    const b = await createTodo({ title: 'Done B' });
    await createTodo({ title: 'Active' });

    await request(app).patch(`/api/todos/${a.id}/complete`);
    await request(app).patch(`/api/todos/${b.id}/complete`);

    const response = await request(app).delete('/api/todos/completed');
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);

    const remaining = await request(app).get('/api/todos');
    expect(remaining.body).toHaveLength(1);
    expect(remaining.body[0].title).toBe('Active');
  });

  it('returns count 0 when no completed todos exist', async () => {
    await createTodo({ title: 'Active' });
    const response = await request(app).delete('/api/todos/completed');
    expect(response.status).toBe(200);
    expect(response.body.count).toBe(0);
  });
});

// ── DELETE /api/todos/:id ─────────────────────────────────────────────────────
describe('DELETE /api/todos/:id', () => {
  it('deletes a todo by id', async () => {
    const todo = await createTodo();

    const response = await request(app).delete(`/api/todos/${todo.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Todo deleted successfully', id: todo.id });

    const again = await request(app).delete(`/api/todos/${todo.id}`);
    expect(again.status).toBe(404);
  });

  it('returns 404 when todo does not exist', async () => {
    const response = await request(app).delete('/api/todos/999999');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Todo not found');
  });

  it('returns 400 for invalid id', async () => {
    const response = await request(app).delete('/api/todos/abc');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valid todo ID is required');
  });
});
