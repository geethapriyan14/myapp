import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenExportApk?: () => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenExportApk,
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, we can still allow viewing the APK export options if clicked
  if (isInstalled && !onOpenExportApk) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center gap-1.5 ${className}`}>
        {/* Direct PWA Install prompt if supported by browser */}
        {isInstallable && (
          <button
            type="button"
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs active:scale-95"
            title="Install Together on your device"
          >
            <span className="material-symbols-outlined text-[16px]">install_mobile</span>
            <span>{variant === 'compact' ? 'Install' : 'Install App'}</span>
          </button>
        )}

        {/* iOS Safari Guided Install */}
        {isIOS && !isInstalled && (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--app-surface-subtle)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">add_to_home_screen</span>
            <span>Install on iOS</span>
          </button>
        )}

        {/* Export APK / Package button */}
        {onOpenExportApk && (
          <button
            type="button"
            onClick={onOpenExportApk}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all active:scale-95 shadow-2xs"
            title="Export Mobile APK for Android"
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400">
              android
            </span>
            <span>{variant === 'compact' ? 'APK' : 'Export APK'}</span>
          </button>
        )}
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-2xl bg-[var(--app-surface)] text-[var(--app-text)] p-5 shadow-2xl border border-[var(--app-border)]">
            <h3 className="text-base font-bold text-[var(--app-text)]">Install on iPhone / iPad</h3>
            <p className="mt-2 text-xs text-[var(--app-text-muted)] leading-relaxed">
              1. Tap the <strong>Share</strong> button (box with upward arrow) in Safari’s bottom toolbar.
              <br />
              2. Scroll down and select <strong>Add to Home Screen</strong>.
              <br />
              3. Tap <strong>Add</strong> in the top-right corner.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-[var(--color-primary)] py-2 text-xs font-bold text-white transition hover:opacity-90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
