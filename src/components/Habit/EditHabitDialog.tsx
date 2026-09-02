import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type { Habit } from '../../types/habit';

interface EditHabitDialogProps {
  habit: Habit | null;
  onClose: () => void;
  onRename: (id: number, title: string) => Promise<void>;
}

export default function EditHabitDialog({ habit, onClose, onRename }: EditHabitDialogProps) {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (habit) setTitle(habit.title);
  }, [habit]);

  const handleSave = async () => {
    if (!habit || !title.trim()) return;
    setSaving(true);
    await onRename(habit.id!, title.trim());
    setSaving(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <Dialog
      open={Boolean(habit)}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3 } },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.1rem' }}>
        Rename Habit
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Habit name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          slotProps={{ htmlInput: { maxLength: 40 } }}
          sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 500,
            color: (theme) =>
              theme.palette.mode === 'dark' ? '#c084fc' : '#64748b',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(192, 132, 252, 0.08)'
                  : 'rgba(100, 116, 139, 0.08)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !title.trim()}
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 2.5,
            py: 1,
            color: '#ffffff !important',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#9333ea' : '#4f46e5',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 2px 8px rgba(147, 51, 234, 0.35)'
                : '0 2px 8px rgba(79, 70, 229, 0.25)',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#7e22ce' : '#4338ca',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 4px 12px rgba(147, 51, 234, 0.5)'
                  : '0 4px 12px rgba(79, 70, 229, 0.35)',
            },
            '&.Mui-disabled': {
              color: 'rgba(255, 255, 255, 0.4) !important',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(147, 51, 234, 0.2)'
                  : 'rgba(79, 70, 229, 0.25)',
              boxShadow: 'none',
            },
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
