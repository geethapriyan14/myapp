import React, { useState } from 'react';
import { AppSettings, AccentColor, ThemeMode, ChatWallpaper, FontSizeScale, SupportedLanguage, WalletTransaction } from '../types';
import { SUPPORTED_CURRENCIES } from '../data/mockData';
import { playChime } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  transactions?: WalletTransaction[];
  onAddWalletMoney?: (amount: number) => void;
  onOpenExportApk?: () => void;
}

const ACCENT_OPTIONS: Array<{ id: AccentColor; name: string; color: string; ringColor: string }> = [
  { id: 'emerald', name: 'Emerald', color: '#00875a', ringColor: 'ring-emerald-500' },
  { id: 'indigo', name: 'Indigo', color: '#4f46e5', ringColor: 'ring-indigo-500' },
  { id: 'amber', name: 'Saffron', color: '#d97706', ringColor: 'ring-amber-500' },
  { id: 'crimson', name: 'Crimson', color: '#dc2626', ringColor: 'ring-red-500' },
  { id: 'violet', name: 'Violet', color: '#7c3aed', ringColor: 'ring-purple-500' },
  { id: 'teal', name: 'Teal', color: '#0d9488', ringColor: 'ring-teal-500' },
  { id: 'slate', name: 'Slate', color: '#334155', ringColor: 'ring-slate-500' },
];

const WALLPAPER_OPTIONS: Array<{ id: ChatWallpaper; label: string; desc: string }> = [
  { id: 'clean', label: 'Clean Solid', desc: 'Minimal distraction-free' },
  { id: 'doodles', label: 'Chat Pattern', desc: 'Subtle geometric dot matrix' },
  { id: 'mesh', label: 'Soft Mesh', desc: 'Warm radial gradient' },
  { id: 'parchment', label: 'Parchment', desc: 'Warm reading tone' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  transactions = [],
  onAddWalletMoney,
  onOpenExportApk,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'payments' | 'mobile' | 'general'>('appearance');
  const [upiInput, setUpiInput] = useState(settings.upiId || 'gowtham@okaxis');
  const [topupAmount, setTopupAmount] = useState('');
  const [topupSuccess, setTopupSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAccentChange = (accent: AccentColor) => {
    playChime('tap');
    onUpdateSettings({ ...settings, accentColor: accent });
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    playChime('tap');
    onUpdateSettings({ ...settings, themeMode: mode });
  };

  const handleWallpaperChange = (wallpaper: ChatWallpaper) => {
    playChime('tap');
    onUpdateSettings({ ...settings, chatWallpaper: wallpaper });
  };

  const handleFontSizeChange = (size: FontSizeScale) => {
    playChime('tap');
    onUpdateSettings({ ...settings, fontSize: size });
  };

  const handleDefaultCurrencyChange = (currCode: string) => {
    playChime('tap');
    const curr = SUPPORTED_CURRENCIES.find((c) => c.code === currCode);
    onUpdateSettings({
      ...settings,
      defaultCurrency: currCode,
      defaultCountry: curr?.country === 'India' ? 'IN' : 'GLOBAL',
    });
  };

  const handleSaveUpi = () => {
    playChime('tap');
    onUpdateSettings({ ...settings, upiId: upiInput });
  };

  const handleQuickTopup = (amt: number) => {
    if (onAddWalletMoney) {
      onAddWalletMoney(amt);
      playChime('coin');
      setTopupSuccess(true);
      setTimeout(() => setTopupSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[var(--app-surface)] text-[var(--app-text)] shadow-2xl border border-[var(--app-border)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--app-border)] flex items-center justify-between bg-[var(--app-surface-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </div>
            <div>
              <h2 className="text-base font-bold">Together Settings</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Colors, themes, UPI & red packet wallet configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--app-surface-hover)] flex items-center justify-center text-[var(--app-text-muted)] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--app-border)] px-4 bg-[var(--app-surface)] overflow-x-auto">
          {[
            { id: 'appearance', label: 'Theme & Colors', icon: 'palette' },
            { id: 'payments', label: 'UPI & Red Packet Wallet', icon: 'account_balance_wallet' },
            { id: 'mobile', label: 'Mobile APK & Install', icon: 'android' },
            { id: 'general', label: 'Language & Sound', icon: 'language' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playChime('tap');
                }}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 no-scrollbar">
          {/* TAB 1: APPEARANCE & THEME */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Theme Mode: Light / Dark / System */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2.5">
                  Appearance Mode
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'light', label: 'Light', icon: 'light_mode', desc: 'Crisp & Clean' },
                    { id: 'dark', label: 'Dark', icon: 'dark_mode', desc: 'OLED Midnight' },
                    { id: 'system', label: 'System', icon: 'desktop_windows', desc: 'Match OS' },
                  ].map((mode) => {
                    const isSelected = settings.themeMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleThemeModeChange(mode.id as ThemeMode)}
                        className={`p-3 rounded-2xl border text-left flex flex-col items-center text-center transition-all ${
                          isSelected
                            ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] ring-2 ring-[var(--color-primary-ring)] shadow-sm'
                            : 'border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[22px] mb-1 ${
                          isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--app-text-muted)]'
                        }`}>
                          {mode.icon}
                        </span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-[var(--color-primary)]' : ''}`}>
                          {mode.label}
                        </span>
                        <span className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                          {mode.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette Selection */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                    Accent Color Theme
                  </label>
                  <span className="text-xs font-semibold capitalize text-[var(--color-primary)]">
                    Active: {settings.accentColor}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {ACCENT_OPTIONS.map((opt) => {
                    const isSelected = settings.accentColor === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAccentChange(opt.id)}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-ring)] bg-[var(--app-surface-subtle)] shadow-sm'
                            : 'border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)]'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center text-white"
                          style={{ backgroundColor: opt.color }}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Wallpaper Texture */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2.5">
                  Chat Wallpaper
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {WALLPAPER_OPTIONS.map((w) => {
                    const isSelected = settings.chatWallpaper === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleWallpaperChange(w.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)] shadow-sm'
                            : 'border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)]'
                        }`}
                      >
                        <span className={`text-xs font-bold block ${isSelected ? 'text-[var(--color-primary)]' : ''}`}>
                          {w.label}
                        </span>
                        <span className="text-[11px] text-[var(--app-text-muted)] mt-0.5 block">
                          {w.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Scaling */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2.5">
                  Font & Text Scaling (All Ages)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compact', desc: 'High density' },
                    { id: 'standard', label: 'Standard', desc: 'Default balance' },
                    { id: 'large', label: 'Large', desc: 'Elder / Easy Read' },
                  ].map((f) => {
                    const isSelected = settings.fontSize === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleFontSizeChange(f.id as FontSizeScale)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] font-bold text-[var(--color-primary)]'
                            : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
                        }`}
                      >
                        <span className="text-xs block font-bold">{f.label}</span>
                        <span className="text-[10px] text-[var(--app-text-muted)] block mt-0.5">{f.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENTS, UPI & RED PACKETS */}
          {activeTab === 'payments' && (
            <div className="space-y-5">
              {/* Default Country & Currency Preference */}
              <div className="bg-[var(--app-surface-subtle)] p-4 rounded-2xl border border-[var(--app-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                    Default Red Packet Currency
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Default: India 🇮🇳 (INR ₹)
                  </span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)] mb-3">
                  Sets the default country and currency used for sending and receiving action red packet money.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {SUPPORTED_CURRENCIES.map((curr) => {
                    const isSelected = settings.defaultCurrency === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => handleDefaultCurrencyChange(curr.code)}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--app-surface)] shadow-sm font-bold text-[var(--color-primary)]'
                            : 'border-[var(--app-border)] hover:bg-[var(--app-surface)]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{curr.flag}</span>
                          <span className="text-xs font-bold">{curr.code}</span>
                        </div>
                        <span className="text-xs font-extrabold">{curr.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPI Payments Configuration */}
              <div className="bg-[var(--app-surface-subtle)] p-4 rounded-2xl border border-[var(--app-border)]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                      account_balance
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      UPI Settings (India Instant Settlement)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active & Linked ✓
                  </span>
                </div>

                <p className="text-xs text-[var(--app-text-muted)] mb-3">
                  Your Virtual Payment Address (VPA) for instant UPI red packet transfers via Google Pay, PhonePe, Paytm, or BHIM.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={upiInput}
                    onChange={(e) => setUpiInput(e.target.value)}
                    placeholder="Enter your UPI ID (e.g. yourname@okaxis)"
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUpi}
                    className="px-3.5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow"
                  >
                    Save UPI
                  </button>
                </div>
              </div>

              {/* Together Wallet Management */}
              <div className="bg-[var(--app-surface-subtle)] p-4 rounded-2xl border border-[var(--app-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                      Together Digital Wallet
                    </span>
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      ₹{settings.walletBalance.toLocaleString('en-IN')}.00
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[500, 1000, 2000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickTopup(amt)}
                        className="px-2.5 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:border-emerald-500 text-xs font-bold text-[var(--app-text)] transition-all shadow-xs"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {topupSuccess && (
                  <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950 p-2 rounded-xl flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Wallet topped up successfully via UPI!
                  </div>
                )}

                {/* Custom topup field */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--app-text-muted)]">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      placeholder="Add custom amount to wallet..."
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseFloat(topupAmount);
                      if (num > 0) {
                        handleQuickTopup(num);
                        setTopupAmount('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow"
                  >
                    Top Up
                  </button>
                </div>

                {/* Recent Wallet & Red Packet Transactions */}
                {transactions && transactions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--app-border)]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2">
                      Recent Activity
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                      {transactions.slice(0, 4).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)]"
                        >
                          <div>
                            <span className="font-semibold block text-[11px]">{tx.title}</span>
                            <span className="text-[10px] text-[var(--app-text-muted)]">{tx.time}</span>
                          </div>
                          <span className={`font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{tx.symbol}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Mobile APK & Native App Packaging */}
          {activeTab === 'mobile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
                <span className="material-symbols-outlined text-[24px] text-emerald-600 dark:text-emerald-400 shrink-0">
                  android
                </span>
                <div className="text-xs">
                  <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    Android APK & Mobile Installation
                  </h4>
                  <p className="mt-0.5">
                    Together Messenger is configured as a standalone Progressive Web App with
                    service worker caching, native icons, and Capacitor build configurations.
                  </p>
                </div>
              </div>

              {/* Action Banner: Open Full APK Modal */}
              {onOpenExportApk && (
                <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-[var(--app-text)]">
                      Export Mobile APK Wizard
                    </h5>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Download signed APKs, scan QR codes, or copy Android Studio build scripts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenExportApk();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow hover:opacity-90 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    <span>Open APK Exporter</span>
                  </button>
                </div>
              )}

              {/* Method Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">
                        rocket_launch
                      </span>
                      <span className="font-bold text-xs">PWABuilder (1-Click)</span>
                    </div>
                    <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                      Packages the live application into a signed Android APK package without
                      compilation or local SDK tools.
                    </p>
                  </div>
                  <a
                    href="https://www.pwabuilder.com?url=https%3A%2F%2Fais-pre-mqzdd2nbz3kxpxr6d6j6ts-916885392359.asia-east1.run.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-center py-1.5 px-3 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold text-xs hover:opacity-80 transition"
                  >
                    Open PWABuilder &rarr;
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-indigo-500 text-[20px]">
                        install_mobile
                      </span>
                      <span className="font-bold text-xs">Android WebAPK</span>
                    </div>
                    <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                      Open in Google Chrome on your phone and tap <strong>Install App</strong> to
                      generate an Android app directly on your home screen.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                    ✓ Full screen & offline support active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERAL, LANGUAGE & SOUND */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-[var(--app-surface-subtle)] p-4 rounded-2xl border border-[var(--app-border)]">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2">
                  Display Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'en', name: 'English (Default)', flag: '🇺🇸' },
                    { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
                    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
                    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
                    { code: 'zh-HK', name: '繁體中文 (Chinese)', flag: '🇭🇰' },
                    { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
                    { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
                    { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
                  ].map((lang) => {
                    const isSelected = settings.preferredLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          playChime('tap');
                          onUpdateSettings({ ...settings, preferredLanguage: lang.code as SupportedLanguage });
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--app-surface)] shadow-sm font-bold text-[var(--color-primary)]'
                            : 'border-[var(--app-border)] hover:bg-[var(--app-surface)]'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span className="text-xs">{lang.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="bg-[var(--app-surface-subtle)] p-4 rounded-2xl border border-[var(--app-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Coin & Notification Chimes</span>
                    <span className="text-[11px] text-[var(--app-text-muted)]">
                      Sound effects on receiving red packets and sending messages
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, notificationSounds: !settings.notificationSounds })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      settings.notificationSounds ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                        settings.notificationSounds ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--app-border)]">
                  <div>
                    <span className="text-xs font-bold block">Auto-Translate Incoming Chats</span>
                    <span className="text-[11px] text-[var(--app-text-muted)]">
                      Automatically translate messages from different languages
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, autoTranslateIncoming: !settings.autoTranslateIncoming })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      settings.autoTranslateIncoming ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                        settings.autoTranslateIncoming ? 'left-5.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs hover:brightness-105 shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
