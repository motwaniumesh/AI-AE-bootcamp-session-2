import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export default function EmptyState({ onAdd }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 8,
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <AssignmentTurnedInIcon sx={{ fontSize: 72, color: 'primary.main', opacity: 0.4 }} />
      <Typography variant="h6" color="text.secondary">
        No tasks yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Add your first task to get started.
      </Typography>
      <Button variant="contained" onClick={onAdd} sx={{ mt: 1 }}>
        Add Task
      </Button>
    </Box>
  );
}
