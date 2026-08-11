import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { FaPlus } from 'react-icons/fa6';

interface AddHabitDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string) => Promise<{ success: boolean; error?: string }>;
}

export default function AddHabitDialog({
  open,
  onClose,
  onAdd,
}: AddHabitDialogProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setTitle('');
    setError('');
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onAdd(title);
    setSaving(false);
    if (result.success) {
      setTitle('');
      setError('');
      onClose();
    } else {
      setError(result.error ?? 'Something went wrong.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3 } },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.1rem' }}>
        Add New Habit
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          label="Habit name"
          placeholder="e.g. Morning Run"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          slotProps={{ htmlInput: { maxLength: 40 } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !title.trim()}
          startIcon={<FaPlus size={12} />}
          sx={{
            borderRadius: 2,
            backgroundColor: '#1e293b',
            '&:hover': { backgroundColor: '#334155' },
          }}
        >
          {saving ? 'Saving...' : 'Add Habit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
