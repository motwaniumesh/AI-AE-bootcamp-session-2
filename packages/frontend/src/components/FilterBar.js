import React from 'react';
import { Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'Any priority' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function FilterBar({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(_, val) => val && onStatusChange(val)}
        size="small"
        aria-label="filter by status"
      >
        {STATUS_OPTIONS.map(({ value, label }) => (
          <ToggleButton key={value} value={value} aria-label={label}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ToggleButtonGroup
        value={priorityFilter}
        exclusive
        onChange={(_, val) => onPriorityChange(val === null ? '' : val)}
        size="small"
        aria-label="filter by priority"
      >
        {PRIORITY_OPTIONS.map(({ value, label }) => (
          <ToggleButton key={value} value={value} aria-label={label}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
}
