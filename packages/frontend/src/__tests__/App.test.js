import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const TODO_1 = {
  id: 1,
  title: 'Buy milk',
  description: '',
  due_date: null,
  priority: 'medium',
  completed: 0,
  created_at: '2026-03-01T00:00:00.000Z',
};

const TODO_2 = {
  id: 2,
  title: 'Walk the dog',
  description: 'Morning walk',
  due_date: '2026-04-01',
  priority: 'high',
  completed: 0,
  created_at: '2026-03-02T00:00:00.000Z',
};

let serverTodos = [];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => res(ctx.status(200), ctx.json(serverTodos))),

  rest.post('/api/todos', async (req, res, ctx) => {
    const body = await req.json();
    if (!body.title || !body.title.trim()) {
      return res(ctx.status(400), ctx.json({ error: 'Todo title is required' }));
    }
    const created = { id: Date.now(), completed: 0, created_at: new Date().toISOString(), ...body };
    serverTodos.push(created);
    return res(ctx.status(201), ctx.json(created));
  }),

  rest.patch('/api/todos/:id/complete', (req, res, ctx) => {
    const id = parseInt(req.params.id, 10);
    const todo = serverTodos.find((t) => t.id === id);
    if (!todo) return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    todo.completed = todo.completed ? 0 : 1;
    return res(ctx.status(200), ctx.json({ ...todo }));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id, 10);
    serverTodos = serverTodos.filter((t) => t.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Deleted', id }));
  }),

  rest.delete('/api/todos/completed', (req, res, ctx) => {
    const before = serverTodos.length;
    serverTodos = serverTodos.filter((t) => !t.completed);
    return res(ctx.status(200), ctx.json({ count: before - serverTodos.length }));
  }),

  rest.put('/api/todos/:id', async (req, res, ctx) => {
    const id = parseInt(req.params.id, 10);
    const idx = serverTodos.findIndex((t) => t.id === id);
    if (idx === -1) return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    const body = await req.json();
    serverTodos[idx] = { ...serverTodos[idx], ...body };
    return res(ctx.status(200), ctx.json(serverTodos[idx]));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  serverTodos = [];
});
afterAll(() => server.close());

describe('App — todo list', () => {
  it('shows a loading spinner then renders todos', async () => {
    serverTodos = [TODO_1, TODO_2];
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();
  });

  it('shows empty state when there are no todos', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument());
  });

  it('can add a new task', async () => {
    render(<App />);
    await waitFor(() => screen.getByLabelText(/task title/i));

    await userEvent.type(screen.getByLabelText(/task title/i), 'New task');
    // Use getAllByRole to handle two "Add Task" buttons (form + empty state) and click the submit one
    const addButtons = screen.getAllByRole('button', { name: /add task/i });
    const submitButton = addButtons.find((btn) => btn.type === 'submit') || addButtons[0];
    await userEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText('New task')).toBeInTheDocument());
  });

  it('can toggle a task complete', async () => {
    serverTodos = [{ ...TODO_1 }];
    render(<App />);
    await waitFor(() => screen.getByText('Buy milk'));

    const checkbox = screen.getByRole('checkbox', { name: /mark "buy milk"/i });
    await userEvent.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
  });

  it('can delete a task', async () => {
    serverTodos = [{ ...TODO_1 }];
    render(<App />);
    await waitFor(() => screen.getByText('Buy milk'));

    await userEvent.click(screen.getByRole('button', { name: /delete "buy milk"/i }));
    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());
  });
});
