const BASE = '/api/todos';

const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
};

export const fetchTodos = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetch(query ? `${BASE}?${query}` : BASE).then(handleResponse);
};

export const createTodo = (payload) =>
  fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updateTodo = (id, payload) =>
  fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const toggleTodo = (id) =>
  fetch(`${BASE}/${id}/complete`, { method: 'PATCH' }).then(handleResponse);

export const deleteTodo = (id) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);

export const deleteCompleted = () =>
  fetch(`${BASE}/completed`, { method: 'DELETE' }).then(handleResponse);
