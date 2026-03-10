import { useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

export default function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); // { message, severity }
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sort, setSort] = useState('due_date');

  const notify = (message, severity = 'success') => setNotification({ message, severity });
  const clearNotification = () => setNotification(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const data = await api.fetchTodos(params);
      setTodos(data);
    } catch (err) {
      notify('Failed to load todos', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const addTodo = async (payload) => {
    try {
      const created = await api.createTodo(payload);
      setTodos((prev) => [...prev, created]);
      notify('Task added');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const editTodo = async (id, payload) => {
    try {
      const updated = await api.updateTodo(id, payload);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      notify('Task updated');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const toggleTodo = async (id) => {
    try {
      const updated = await api.toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const removeTodo = async (id) => {
    try {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      notify('Task deleted');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const removeCompleted = async () => {
    try {
      await api.deleteCompleted();
      setTodos((prev) => prev.filter((t) => !t.completed));
      notify('Completed tasks cleared');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return {
    todos,
    loading,
    notification,
    clearNotification,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sort,
    setSort,
    addTodo,
    editTodo,
    toggleTodo,
    removeTodo,
    removeCompleted,
  };
}
