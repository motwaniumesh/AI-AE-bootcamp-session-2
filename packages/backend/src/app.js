const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_SORT_FIELDS = ['due_date', 'priority', 'created_at'];
const PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create todos table
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('In-memory database initialized');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// ── GET /api/todos ────────────────────────────────────────────────────────────
// Query params: status (all|active|completed), priority (low|medium|high),
//               sort (due_date|priority|created_at)
app.get('/api/todos', (req, res) => {
  try {
    const { status, priority, sort } = req.query;

    let query = 'SELECT * FROM todos';
    const conditions = [];
    const params = [];

    if (status === 'active') {
      conditions.push('completed = 0');
    } else if (status === 'completed') {
      conditions.push('completed = 1');
    }

    if (priority && VALID_PRIORITIES.includes(priority)) {
      conditions.push('priority = ?');
      params.push(priority);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Default sort: due_date ascending (NULLs last), then created_at
    if (sort === 'priority') {
      query += ' ORDER BY CASE priority WHEN \'high\' THEN 1 WHEN \'medium\' THEN 2 ELSE 3 END, created_at ASC';
    } else if (sort === 'created_at') {
      query += ' ORDER BY created_at DESC';
    } else {
      query += ' ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC, created_at ASC';
    }

    const todos = db.prepare(query).all(...params);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// ── POST /api/todos ───────────────────────────────────────────────────────────
app.post('/api/todos', (req, res) => {
  try {
    const { title, description, due_date, priority = 'medium' } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Todo title is required' });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    const stmt = db.prepare(
      'INSERT INTO todos (title, description, due_date, priority) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(title.trim(), description || null, due_date || null, priority);
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(todo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// ── PUT /api/todos/:id ────────────────────────────────────────────────────────
app.put('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Valid todo ID is required' });

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Todo not found' });

    const { title, description, due_date, priority } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Todo title cannot be empty' });
    }

    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDescription = description !== undefined ? description : existing.description;
    const updatedDueDate = due_date !== undefined ? due_date : existing.due_date;
    const updatedPriority = priority !== undefined ? priority : existing.priority;

    db.prepare(
      'UPDATE todos SET title = ?, description = ?, due_date = ?, priority = ? WHERE id = ?'
    ).run(updatedTitle, updatedDescription, updatedDueDate, updatedPriority, id);

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// ── PATCH /api/todos/:id/complete ─────────────────────────────────────────────
app.patch('/api/todos/:id/complete', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Valid todo ID is required' });

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Todo not found' });

    db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(existing.completed ? 0 : 1, id);
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(todo);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

// ── DELETE /api/todos/completed ───────────────────────────────────────────────
// Must be defined before /:id to avoid route shadowing
app.delete('/api/todos/completed', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM todos WHERE completed = 1').run();
    res.json({ message: 'Completed todos deleted', count: result.changes });
  } catch (error) {
    console.error('Error deleting completed todos:', error);
    res.status(500).json({ error: 'Failed to delete completed todos' });
  }
});

// ── DELETE /api/todos/:id ─────────────────────────────────────────────────────
app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Valid todo ID is required' });

    const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Todo not found' });

    db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    res.json({ message: 'Todo deleted successfully', id });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db };