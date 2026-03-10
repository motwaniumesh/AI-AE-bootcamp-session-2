import React, { useState } from 'react';
import {
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns as AdapterDateFnsV2 } from '@mui/x-date-pickers/AdapterDateFnsV2';

const PRIORITIES = ['low', 'medium', 'high'];

const EMPTY = { title: '', description: '', due_date: null, priority: 'medium' };

export default function AddTaskForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description || undefined,
      priority: form.priority,
      due_date: form.due_date
        ? form.due_date.toISOString().split('T')[0]
        : undefined,
    };
    onAdd(payload);
    setForm(EMPTY);
    setErrors({});
  };

  return (
      <LocalizationProvider dateAdapter={AdapterDateFnsV2}>
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={form.title}
            onChange={set('title')}
            error={!!errors.title}
            helperText={errors.title}
            required
            fullWidth
            variant="outlined"
            inputProps={{ 'aria-label': 'task title' }}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={set('description')}
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            inputProps={{ 'aria-label': 'task description' }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DatePicker
              label="Due date"
              value={form.due_date}
              onChange={(val) => setForm((f) => ({ ...f, due_date: val }))}
              slotProps={{
                textField: { fullWidth: true, variant: 'outlined', size: 'medium' },
              }}
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel id="add-priority-label">Priority *</InputLabel>
              <Select
                labelId="add-priority-label"
                value={form.priority}
                label="Priority *"
                onChange={set('priority')}
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Button type="submit" variant="contained" size="large">
            Add Task
          </Button>
        </Stack>
      </form>
    </LocalizationProvider>
  );
}
