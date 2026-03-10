import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Checkbox,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const PRIORITY_COLOR = { high: 'error', medium: 'warning', low: 'success' };

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function TaskCard({ todo, onToggle, onEdit, onDelete }) {
  const isOverdue =
    !todo.completed &&
    todo.due_date &&
    new Date(todo.due_date + 'T00:00:00') < new Date(new Date().toDateString());

  return (
    <Card
      variant="outlined"
      sx={{
        opacity: todo.completed ? 0.6 : 1,
        borderLeft: `4px solid`,
        borderLeftColor: `${PRIORITY_COLOR[todo.priority] || 'primary'}.main`,
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Checkbox
            checked={Boolean(todo.completed)}
            onChange={() => onToggle(todo.id)}
            inputProps={{ 'aria-label': `mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}` }}
            sx={{ mt: -0.5 }}
          />

          <Stack flex={1} spacing={0.5}>
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            >
              {todo.title}
            </Typography>

            {todo.description && (
              <Typography variant="body2" color="text.secondary">
                {todo.description}
              </Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Chip
                label={todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                color={PRIORITY_COLOR[todo.priority] || 'default'}
                size="small"
              />
              {todo.due_date && (
                <Typography
                  variant="body2"
                  color={isOverdue ? 'error.main' : 'text.secondary'}
                  fontWeight={isOverdue ? 600 : 400}
                >
                  Due: {formatDate(todo.due_date)}
                  {isOverdue && ' (overdue)'}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit task">
              <IconButton
                size="small"
                onClick={() => onEdit(todo)}
                aria-label={`edit "${todo.title}"`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete task">
              <IconButton
                size="small"
                onClick={() => onDelete(todo.id)}
                aria-label={`delete "${todo.title}"`}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
