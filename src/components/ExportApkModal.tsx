import React, { useState } from 'react';
import { playChime } from '../utils/soundEffects';

interface ExportApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const ExportApkModal: React.FC<ExportApkModalProps> = ({
  isOpen,
  onClose,
  appUrl = 'https://ais-pre-mqzdd2nbz3kxpxr6d6j6ts-916885392359.asia-east1.run.app',
}) => {
  const [activeTab, setActiveTab] = useState<'pwabuilder' | 'webapk' | 'capacitor'>('pwabuilder');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  if (!isOpen) return null;

  const pwabuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}&margin=10`;

  const capacitorCommands = `# 1. Download project as ZIP (via AI Studio Settings > Export) or clone repository
# 2. In terminal, install Capacitor packages:
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Build web production bundle:
npm run build

# 4. Initialize & open native Android Studio project:
npx cap add android
npx cap sync
npx cap open android

# 5. In Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)
# Your compiled APK will be located at:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(appUrl);
    setCopiedUrl(true);
    playChime('tap');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCommands = () => {
    navigator.clipboard?.writeText(capacitorCommands);
    setCopiedCommand(true);
    playChime('tap');
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[var(--app-surface)] text-[var(--app-text)] border border-[var(--app-border)] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">android</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--app-text)] leading-tight">
                Export Mobile APK
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Package Together Messenger into an Android APK for mobile devices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pwabuilder')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
            <span>PWABuilder APK (Instant)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webapk')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'webapk'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">install_mobile</span>
            <span>Direct WebAPK (Phone)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('capacitor')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span>Capacitor / Studio</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-sm leading-relaxed">
          {/* Tab 1: PWABuilder (Recommended 1-Click APK) */}
          {activeTab === 'pwabuilder' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                <span className="material-symbols-outlined text-[24px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  verified
                </span>
                <div className="text-xs">
                  <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300 mb-0.5">
                    Recommended: 100% PWA-Compliant Android APK
                  </p>
                  <p>
                    Because this app is equipped with a verified Web App Manifest, offline service
                    worker, and native icon package, you can generate a signed Android APK package
                    instantly with zero build configuration.
                  </p>
                </div>
              </div>

              {/* App URL box */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                  Live Application PWA URL
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs">
                  <span className="material-symbols-outlined text-[16px] text-[var(--color-primary)] shrink-0">
                    link
                  </span>
                  <span className="font-mono truncate flex-1 select-all">{appUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1 rounded-lg bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] font-semibold text-[11px] text-[var(--app-text)] shrink-0 transition-colors"
                  >
                    {copiedUrl ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Steps Guide */}
              <div className="flex flex-col gap-2 rounded-2xl p-4 bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs">
                <h4 className="font-bold text-[var(--app-text)] text-sm mb-1">
                  How to generate your APK in 3 steps:
                </h4>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </div>
                  <p className="text-[var(--app-text-muted)]">
                    Click the <strong>Open PWABuilder</strong> button below. It will analyze your
                    live application manifest.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </div>
                  <p className="text-[var(--app-text-muted)]">
                    Select <strong>Android</strong> and click <strong>Package for Android</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </div>
                  <p className="text-[var(--app-text-muted)]">
                    Download your generated <strong>.apk</strong> (for testing/sideloading on any
                    Android phone) or <strong>.aab</strong> (for Google Play Store publication).
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={pwabuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[var(--color-primary)] hover:opacity-90 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Open PWABuilder & Generate APK</span>
              </a>
            </div>
          )}

          {/* Tab 2: Direct WebAPK on Android Mobile */}
          {activeTab === 'webapk' && (
            <div className="flex flex-col items-center text-center gap-3">
              <p className="text-xs text-[var(--app-text-muted)] max-w-md">
                Scan this QR code with your Android phone's camera to open the application in Chrome
                or Samsung Internet. Tap <strong>Install App</strong> to create a native Android
                WebAPK instantly on your home screen.
              </p>

              <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for Mobile Install"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              <div className="w-full text-left bg-[var(--app-surface-subtle)] p-3.5 rounded-2xl border border-[var(--app-border)] text-xs flex flex-col gap-1.5">
                <p className="font-bold text-[var(--app-text)]">Mobile Installation Steps:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[var(--app-text-muted)]">
                  <li>Scan the QR code or visit the link on your Android smartphone.</li>
                  <li>In Google Chrome, tap the banner or menu (⋮) &gt; <strong>Install app</strong>.</li>
                  <li>
                    Android automatically compiles a native <strong>WebAPK</strong> with its own
                    app icon, splash screen, and standalone window in the Android App Drawer.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab 3: Capacitor Native Android Studio APK */}
          {activeTab === 'capacitor' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--app-text-muted)]">
                This project includes a pre-configured <code className="text-xs bg-[var(--app-surface-subtle)] px-1 py-0.5 rounded">capacitor.config.json</code> file.
                Export the project via <strong>Settings &gt; Export ZIP</strong> or <strong>GitHub</strong>,
                and run the following commands in your terminal:
              </p>

              <div className="relative">
                <pre className="p-3.5 rounded-2xl bg-gray-950 text-gray-200 text-[11px] font-mono overflow-x-auto leading-relaxed border border-gray-800 select-all">
                  {capacitorCommands}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyCommands}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedCommand ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedCommand ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs">
                💡 <strong>Tip:</strong> Android Studio will compile a standalone
                <code className="mx-1 font-mono font-bold">app-debug.apk</code> that can be directly transferred and installed via USB or downloaded on any Android phone!
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--app-text-muted)]">
            Includes manifest.json · PWA assets · Capacitor configs
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
