import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import {
  FaBell,
  FaBellSlash,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaPaperPlane,
  FaCircleCheck,
  FaLock,
} from 'react-icons/fa6';
import {
  areRemindersEnabled,
  requestReminderPermission,
  disableReminders,
  sendTestNotification,
  isNotificationSupported,
  getNotificationPermission,
  type NotificationResult,
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
  const [permissionState, setPermissionState] = useState<string>('default');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<NotificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (open) {
      setSupported(isNotificationSupported());
      setPermissionState(getNotificationPermission());
      setEnabled(areRemindersEnabled());
      setTestResult(null);
      setErrorMessage('');
    }
  }, [open]);

  const handleToggle = async () => {
    setErrorMessage('');
    if (enabled) {
      disableReminders();
      setEnabled(false);
      setPermissionState(getNotificationPermission());
    } else {
      setLoading(true);
      const res = await requestReminderPermission();
      setLoading(false);
      setPermissionState(res.permission);

      if (res.granted) {
        setEnabled(true);
      } else {
        setErrorMessage(
          res.error ||
            'Please allow notifications in your browser address bar to receive daily reminders.'
        );
      }
    }
  };

  const handleTestClick = async () => {
    setErrorMessage('');
    setTestResult(null);
    setLoading(true);

    // If not granted yet, ask for permission first
    if (getNotificationPermission() !== 'granted') {
      const res = await requestReminderPermission();
      setPermissionState(res.permission);
      if (!res.granted) {
        setLoading(false);
        setErrorMessage(
          res.error ||
            'Notifications were not allowed. Click the lock icon 🔒 next to the URL to enable them.'
        );
        return;
      }
      setEnabled(true);
    }

    // Dispatch the test notification
    const result = await sendTestNotification();
    setLoading(false);
    setTestResult(result);

    if (!result.success && result.error) {
      setErrorMessage(result.error);
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
              Humorous alerts in your local country time
            </p>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(147, 51, 234, 0.15)' }}>
        {!supported ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs">
            Notifications are not supported in this browser window. For the best experience, open this app in Chrome, Edge, or install the PWA.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Permission Denied Warning */}
            {permissionState === 'denied' && (
              <Alert
                severity="warning"
                icon={<FaLock size={15} />}
                sx={{ borderRadius: 2, fontSize: '0.8rem' }}
              >
                Notifications are currently <strong>Blocked</strong> by your browser.
                To enable: Click the <strong>lock / site settings icon (🔒)</strong> next to the URL in your browser bar and select <strong>Allow Notifications</strong>.
              </Alert>
            )}

            {/* Error Message if any */}
            {errorMessage && (
              <Alert severity="error" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
                {errorMessage}
              </Alert>
            )}

            {/* Test Notification Live Preview */}
            {testResult && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-purple-950/60 border border-indigo-200 dark:border-purple-800/60 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                    <FaCircleCheck size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-purple-100">
                        Notification Sent to Device!
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-purple-900/60 text-indigo-700 dark:text-purple-300 font-medium">
                        Just Now
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-purple-200 mt-1 font-medium bg-white/60 dark:bg-black/20 p-2 rounded-lg border border-indigo-100/80 dark:border-purple-800/40">
                      "{testResult.quote}"
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-purple-300 mt-1.5 leading-tight">
                      🔔 If you didn't see an OS banner popup, make sure Windows / Mac / Android <strong>Do Not Disturb / Focus Assist</strong> is turned off.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Toggle Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#201038] border border-slate-200/60 dark:border-purple-800/40">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl transition-colors ${
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
                    {enabled ? 'Active · Reminding 3x daily' : 'Turn on to get funny daily motivation'}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled}
                onChange={handleToggle}
                disabled={loading}
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
                Daily Schedule (Your Country's Local Time)
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
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-purple-300 dark:border-purple-700 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <FaPaperPlane size={12} />
                <span>
                  {loading
                    ? 'Requesting & Sending...'
                    : 'Send a Funny Test Notification Now'}
                </span>
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
