import { useState, useCallback, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import QRCode from 'qrcode';
import {
  FaShareNodes,
  FaWhatsapp,
  FaXTwitter,
  FaTelegram,
  FaLinkedin,
  FaCopy,
  FaCheck,
  FaArrowUpFromBracket,
  FaQrcode,
  FaDownload,
  FaCamera,
} from 'react-icons/fa6';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'share' | 'qr';
}

export const SHARE_TEXT =
  '🎯 Level up your daily habits and consistency with HabitTrack! Free, 100% offline & private habit tracker.';

export default function ShareDialog({
  open,
  onClose,
  defaultTab = 'share',
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'qr'>(defaultTab);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const getShareUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://habittrack.app';
  }, []);

  const shareUrl = getShareUrl();

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      // Generate crisp QR code
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e0836',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [open, defaultTab, shareUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} Check it out: ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_err) {
      const input = document.createElement('input');
      input.value = `${SHARE_TEXT} Check it out: ${shareUrl}`;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'HabitTrack — Monthly Habit Tracker',
          text: SHARE_TEXT,
          url: shareUrl,
        });
        onClose();
      } catch (_err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${SHARE_TEXT}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(SHARE_TEXT);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(SHARE_TEXT);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'habittrack-qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

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
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
              {activeTab === 'share' ? <FaShareNodes size={18} /> : <FaQrcode size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-purple-50">
                {activeTab === 'share' ? 'Share with Friends' : 'Scan QR Code'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-purple-300">
                {activeTab === 'share'
                  ? 'Help your friends track daily habits'
                  : 'Scan with camera to open HabitTrack'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 mt-3 p-1 rounded-xl bg-slate-100 dark:bg-[#201038] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-white dark:bg-purple-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-purple-300'
            }`}
          >
            <FaShareNodes size={12} />
            <span>Share Links</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-purple-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-purple-300'
            }`}
          >
            <FaQrcode size={12} />
            <span>QR Code</span>
          </button>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(147, 51, 234, 0.15)' }}>
        {activeTab === 'share' ? (
          <div className="space-y-4">
            {/* Quick Share Icons Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={shareWhatsApp}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FaWhatsapp size={20} />
                </div>
                <span className="text-[11px] font-semibold mt-1.5 text-slate-700 dark:text-purple-200">
                  WhatsApp
                </span>
              </button>

              {/* X (Twitter) */}
              <button
                type="button"
                onClick={shareTwitter}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-black text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FaXTwitter size={18} />
                </div>
                <span className="text-[11px] font-semibold mt-1.5 text-slate-700 dark:text-purple-200">
                  X / Twitter
                </span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={shareTelegram}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FaTelegram size={19} />
                </div>
                <span className="text-[11px] font-semibold mt-1.5 text-slate-700 dark:text-purple-200">
                  Telegram
                </span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={shareLinkedIn}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 text-[#0a66c2] transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0a66c2] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FaLinkedin size={18} />
                </div>
                <span className="text-[11px] font-semibold mt-1.5 text-slate-700 dark:text-purple-200">
                  LinkedIn
                </span>
              </button>
            </div>

            {/* Native Share Sheet (Mobile / Tablet) */}
            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-purple-800/60 bg-indigo-50 hover:bg-indigo-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-indigo-700 dark:text-purple-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <FaArrowUpFromBracket size={14} />
                <span>More Apps (Share Sheet)</span>
              </button>
            )}

            {/* Copy Link Input Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-purple-300 uppercase tracking-wider">
                Or Copy Website Link
              </label>
              <div className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-slate-50 dark:bg-[#150927]">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent px-2.5 text-xs text-slate-700 dark:text-purple-200 font-mono outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer ${
                    copied
                      ? 'bg-green-600 hover:bg-green-500'
                      : 'bg-purple-600 hover:bg-purple-500 shadow-sm'
                  }`}
                >
                  {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* QR Code Tab */
          <div className="flex flex-col items-center justify-center py-3 text-center">
            {qrDataUrl ? (
              <div className="relative p-4 bg-white rounded-2xl shadow-md border border-slate-100 dark:border-purple-800/40">
                <img
                  src={qrDataUrl}
                  alt="HabitTrack Website QR Code"
                  className="w-56 h-56 object-contain rounded-lg"
                />
                {/* Center Badge Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="p-1.5 bg-white rounded-xl shadow-lg border border-slate-200">
                    <img src="/logo4.webp" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                Generating QR code...
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-purple-300 mt-4">
              <FaCamera size={13} className="text-purple-600 dark:text-purple-400" />
              <span>Scan with any mobile camera to open HabitTrack</span>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-purple-400 mt-1 font-mono break-all max-w-[280px]">
              {shareUrl}
            </p>

            <button
              type="button"
              onClick={downloadQrCode}
              className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              <FaDownload size={13} />
              <span>Download QR Code Image</span>
            </button>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Quick Share & QR Icons Row for the Footer
export function FooterShareButtons() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'share' | 'qr'>('share');

  const shareWhatsApp = () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://habittrack.app';
    const text = encodeURIComponent(`${SHARE_TEXT}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareTwitter = () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://habittrack.app';
    const text = encodeURIComponent(SHARE_TEXT);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
  };

  const openQrDialog = () => {
    setTab('qr');
    setOpen(true);
  };

  const openShareDialog = () => {
    setTab('share');
    setOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-purple-300">
        <span className="text-xs font-medium mr-1 hidden xs:inline">Share:</span>
        <button
          type="button"
          onClick={shareWhatsApp}
          title="Share on WhatsApp"
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#25D366] hover:text-white dark:bg-purple-950/60 dark:hover:bg-[#25D366] text-slate-600 dark:text-purple-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <FaWhatsapp size={14} />
        </button>
        <button
          type="button"
          onClick={shareTwitter}
          title="Share on X / Twitter"
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-black hover:text-white dark:bg-purple-950/60 dark:hover:bg-black text-slate-600 dark:text-purple-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <FaXTwitter size={13} />
        </button>
        <button
          type="button"
          onClick={openQrDialog}
          title="Show QR Code"
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-purple-950/60 dark:hover:bg-indigo-600 text-slate-600 dark:text-purple-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <FaQrcode size={13} />
        </button>
        <button
          type="button"
          onClick={openShareDialog}
          title="More Share Options"
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:hover:bg-purple-600 text-slate-600 dark:text-purple-300 flex items-center justify-center transition-all cursor-pointer"
        >
          <FaShareNodes size={13} />
        </button>
      </div>

      <ShareDialog open={open} onClose={() => setOpen(false)} defaultTab={tab} />
    </>
  );
}
