import React from 'react';
import { Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SORT_OPTIONS = [
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created_at', label: 'Date created' },
];

export default function SortControls({ sort, onSortChange }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="sort-label">Sort by</InputLabel>
        <Select
          labelId="sort-label"
          value={sort}
          label="Sort by"
          onChange={(e) => onSortChange(e.target.value)}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
