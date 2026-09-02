import { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaXmark, FaMobileScreenButton } from 'react-icons/fa6';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

// Utility to check if app is already downloaded / running standalone
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Manually recorded installation in localStorage
  if (localStorage.getItem('pwa_installed') === 'true') {
    return true;
  }

  // 2. Standard display-mode check (Desktop PWA, Android Chrome PWA)
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // 3. iOS Safari standalone mode
  if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
    return true;
  }

  // 4. Android Trusted Web Activity (TWA)
  if (typeof document !== 'undefined' && document.referrer.startsWith('android-app://')) {
    return true;
  }

  return false;
}

// Global state listener for PWA prompt so both popup and footer button stay in sync
let globalDeferredPrompt: any = null;
const promptListeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    promptListeners.forEach((cb) => cb());
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem('pwa_installed', 'true');
    globalDeferredPrompt = null;
    promptListeners.forEach((cb) => cb());
  });
}

export function usePwaInstall() {
  const [installed, setInstalled] = useState(true);
  const [promptReady, setPromptReady] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const isInst = isAppInstalled();
      setInstalled(isInst);
      setPromptReady(!!globalDeferredPrompt);
    };

    checkStatus();

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    promptListeners.add(checkStatus);
    return () => {
      promptListeners.delete(checkStatus);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!globalDeferredPrompt) {
      alert(
        'To install HabitTrack: Open your browser menu (⋮ on Chrome, or Share on Safari) and select "Install app" or "Add to Home screen".'
      );
      return;
    }

    try {
      globalDeferredPrompt.prompt();
      const choiceResult = await globalDeferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setInstalled(true);
      }
      globalDeferredPrompt = null;
    } catch (_err) {
      // Ignored
    }
  }, [isIos]);

  return {
    installed,
    promptReady,
    isIos,
    showIosGuide,
    setShowIosGuide,
    handleInstallClick,
  };
}

// Instruction Dialog for iOS Safari users
function IosInstallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 1 }}>
        Install on iPhone / iPad
      </DialogTitle>
      <DialogContent>
        <div className="space-y-4 text-sm text-slate-600 dark:text-purple-200">
          <p>Install HabitTrack on your home screen for quick offline access:</p>
          <ol className="list-decimal pl-5 space-y-2.5">
            <li>
              Tap the <strong>Share</strong> button (the box with an upward arrow) in Safari's bottom toolbar.
            </li>
            <li>
              Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).
            </li>
            <li>
              Tap <strong>"Add"</strong> in the top right corner.
            </li>
          </ol>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
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
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// 1. Prominent Button for the Footer
export function FooterInstallButton() {
  const { installed, isIos, showIosGuide, setShowIosGuide, handleInstallClick } = usePwaInstall();

  // If user already installed / downloaded, DO NOT SHOW
  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 shrink-0"
      >
        {isIos ? <FaMobileScreenButton size={13} /> : <FaDownload size={13} />}
        <span>Download App</span>
      </button>

      <IosInstallModal open={showIosGuide} onClose={() => setShowIosGuide(false)} />
    </>
  );
}

// 2. Floating Popup (Automatic prompt if not dismissed)
export default function InstallPwaPrompt() {
  const { installed, isIos, showIosGuide, setShowIosGuide, handleInstallClick } = usePwaInstall();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (installed) {
      setShowPopup(false);
      return;
    }

    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    const isRecentlyDismissed =
      dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 3 * 24 * 60 * 60 * 1000;

    if (!isRecentlyDismissed) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [installed]);

  const handleDismiss = useCallback(() => {
    setShowPopup(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  }, []);

  if (installed || !showPopup) {
    return <IosInstallModal open={showIosGuide} onClose={() => setShowIosGuide(false)} />;
  }

  return (
    <>
      <aside
        aria-label="Download app prompt"
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-white/95 dark:bg-[#1a0b2e]/95 backdrop-blur-md border border-slate-200/90 dark:border-purple-800/70 p-4 rounded-2xl shadow-2xl transition-all duration-200"
      >
        <div className="flex items-start gap-3">
          <img
            src="/logo4.webp"
            alt="HabitTrack App Icon"
            className="w-12 h-12 rounded-xl object-contain shadow-sm shrink-0 border border-slate-100 dark:border-purple-800/40"
          />
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-purple-50 truncate">
                Install HabitTrack App
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss install prompt"
                className="text-slate-400 hover:text-slate-600 dark:text-purple-400 dark:hover:text-purple-200 p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer"
              >
                <FaXmark size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-purple-300 mt-0.5 leading-snug">
              Download the app for 100% offline tracking, fast access & no address bar.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer active:scale-98"
              >
                {isIos ? <FaMobileScreenButton size={13} /> : <FaDownload size={13} />}
                <span>Download App</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-purple-300 dark:hover:text-purple-100 px-2.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </aside>

      <IosInstallModal open={showIosGuide} onClose={() => setShowIosGuide(false)} />
    </>
  );
}
