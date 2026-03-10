import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns as AdapterDateFnsV2 } from '@mui/x-date-pickers/AdapterDateFnsV2';

const PRIORITIES = ['low', 'medium', 'high'];

const parseDueDate = (due_date) => {
  if (!due_date) return null;
  const d = new Date(due_date + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
};

export default function EditTaskModal({ open, todo, onSave, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', due_date: null, priority: 'medium' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (todo) {
      setForm({
        title: todo.title || '',
        description: todo.description || '',
        due_date: parseDueDate(todo.due_date),
        priority: todo.priority || 'medium',
      });
      setErrors({});
    }
  }, [todo]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = () => {
    if (!form.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }
    onSave({
      title: form.title.trim(),
      description: form.description || null,
      priority: form.priority,
      due_date: form.due_date ? form.due_date.toISOString().split('T')[0] : null,
    });
  };

  return (
      <LocalizationProvider dateAdapter={AdapterDateFnsV2}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={set('title')}
              error={!!errors.title}
              helperText={errors.title}
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={set('description')}
              fullWidth
              variant="outlined"
              multiline
              rows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Due date"
                value={form.due_date}
                onChange={(val) => setForm((f) => ({ ...f, due_date: val }))}
                slotProps={{
                  textField: { fullWidth: true, variant: 'outlined' },
                }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel id="edit-priority-label">Priority</InputLabel>
                <Select
                  labelId="edit-priority-label"
                  value={form.priority}
                  label="Priority"
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
