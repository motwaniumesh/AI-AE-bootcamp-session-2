import React from 'react';
import { Stack } from '@mui/material';
import TaskCard from './TaskCard';

export default function TaskList({ todos, onToggle, onEdit, onDelete }) {
  return (
    <Stack spacing={1.5}>
      {todos.map((todo) => (
        <TaskCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
