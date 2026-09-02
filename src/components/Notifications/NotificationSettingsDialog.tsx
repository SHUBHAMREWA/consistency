import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import {
  FaBell,
  FaBellSlash,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaPaperPlane,
} from 'react-icons/fa6';
import {
  areRemindersEnabled,
  requestReminderPermission,
  disableReminders,
  sendTestNotification,
  isNotificationSupported,
} from '../../utils/notifications';

interface NotificationSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationSettingsDialog({
  open,
  onClose,
}: NotificationSettingsDialogProps) {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (open) {
      setSupported(isNotificationSupported());
      setEnabled(areRemindersEnabled());
      setTestSent(false);
    }
  }, [open]);

  const handleToggle = async () => {
    if (enabled) {
      disableReminders();
      setEnabled(false);
    } else {
      const granted = await requestReminderPermission();
      if (granted) {
        setEnabled(true);
      } else {
        alert(
          'Please allow notifications in your browser or device settings to receive habit reminders.'
        );
      }
    }
  };

  const handleTestClick = async () => {
    if (!enabled) {
      const granted = await requestReminderPermission();
      if (!granted) return;
      setEnabled(true);
    }

    const ok = await sendTestNotification();
    if (ok) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1a0b2e' : '#ffffff'),
            color: (theme) => (theme.palette.mode === 'dark' ? '#f3e8ff' : '#1e293b'),
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(147, 51, 234, 0.3)'
                : '1px solid #e2e8f0',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
            <FaBell size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-purple-50">
              Funny Habit Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-purple-300">
              Motivational & funny alerts in your local country time
            </p>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(147, 51, 234, 0.15)' }}>
        {!supported ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs">
            Notifications are not supported by this browser. For the best experience, install the PWA or use Chrome, Edge, or Safari on iOS 16.4+.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toggle Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#201038] border border-slate-200/60 dark:border-purple-800/40">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    enabled
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 dark:bg-purple-900/40 text-slate-500 dark:text-purple-400'
                  }`}
                >
                  {enabled ? <FaBell size={16} /> : <FaBellSlash size={16} />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-purple-100">
                    Daily Habit Alerts
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-purple-300">
                    {enabled ? 'Active · Reminders scheduled' : 'Turn on for daily motivation'}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled}
                onChange={handleToggle}
                color="secondary"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#9333ea',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#9333ea',
                  },
                }}
              />
            </div>

            {/* Schedule Times */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-slate-700 dark:text-purple-200 uppercase tracking-wider">
                Daily Schedule (Your Local Country Time)
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Morning */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#150927] border border-slate-100 dark:border-purple-900/40">
                  <div className="flex items-center gap-2 text-amber-500 mb-1 font-semibold">
                    <FaSun size={14} />
                    <span>Morning · 9 AM</span>
                  </div>
                  <p className="text-slate-500 dark:text-purple-300 leading-snug">
                    "Rise and shine! Your habits won't complete themselves."
                  </p>
                </div>

                {/* Afternoon */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#150927] border border-slate-100 dark:border-purple-900/40">
                  <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 mb-1 font-semibold">
                    <FaCloudSun size={14} />
                    <span>Afternoon · 2 PM</span>
                  </div>
                  <p className="text-slate-500 dark:text-purple-300 leading-snug">
                    "Your consistency graph is waiting for an increment!"
                  </p>
                </div>

                {/* Evening */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#150927] border border-slate-100 dark:border-purple-900/40">
                  <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-1 font-semibold">
                    <FaMoon size={14} />
                    <span>Evening · 8 PM</span>
                  </div>
                  <p className="text-slate-500 dark:text-purple-300 leading-snug">
                    "Sleep hits different when your habit row is all green."
                  </p>
                </div>
              </div>
            </div>

            {/* Test button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <FaPaperPlane size={12} />
                <span>{testSent ? '✓ Sent! Check your screen' : 'Send a Funny Test Notification Now'}</span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            color: '#ffffff !important',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#9333ea' : '#4f46e5'),
            '&:hover': {
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#7e22ce' : '#4338ca'),
            },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
