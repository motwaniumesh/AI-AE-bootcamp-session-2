import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import theme from './theme';
import useTodos from './hooks/useTodos';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';
import FilterBar from './components/FilterBar';
import SortControls from './components/SortControls';
import EditTaskModal from './components/EditTaskModal';
import EmptyState from './components/EmptyState';

function App() {
  const {
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
  } = useTodos();

  const [editTarget, setEditTarget] = useState(null);
  const [addFormOpen, setAddFormOpen] = useState(false);

  const handleSaveEdit = async (payload) => {
    await editTodo(editTarget.id, payload);
    setEditTarget(null);
  };

  const hasCompleted = todos.some((t) => t.completed);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            {/* Header */}
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} color="primary">
                My Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep track of what needs to get done.
              </Typography>
            </Box>

            {/* Add Task Form */}
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 3, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom>
                Add a Task
              </Typography>
              <AddTaskForm onAdd={addTodo} />
            </Box>

            {/* Controls */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              flexWrap="wrap"
            >
              <FilterBar
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
              />
              <SortControls sort={sort} onSortChange={setSort} />
            </Stack>

            {hasCompleted && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={removeCompleted}
                >
                  Clear completed
                </Button>
              </Box>
            )}

            <Divider />

            {/* Task list */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress aria-label="Loading tasks" />
              </Box>
            ) : todos.length === 0 ? (
              <EmptyState onAdd={() => document.querySelector('input[aria-label="task title"]')?.focus()} />
            ) : (
              <TaskList
                todos={todos}
                onToggle={toggleTodo}
                onEdit={setEditTarget}
                onDelete={removeTodo}
              />
            )}
          </Stack>
        </Container>

        {/* Edit modal */}
        <EditTaskModal
          open={Boolean(editTarget)}
          todo={editTarget}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />

        {/* Notifications */}
        <Snackbar
          open={Boolean(notification)}
          autoHideDuration={4000}
          onClose={clearNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={clearNotification}
            severity={notification?.severity || 'success'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification?.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
