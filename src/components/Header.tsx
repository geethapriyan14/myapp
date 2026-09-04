import React from 'react';
import { ScreenType, SupportedLanguage, DesktopLayoutMode, AppSettings } from '../types';
import { ASSETS } from '../data/mockData';
import { LANGUAGE_OPTIONS, t } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  title?: string;
  currentLanguage: SupportedLanguage;
  onOpenLanguageSelector: () => void;
  desktopLayout?: DesktopLayoutMode;
  onDesktopLayoutChange?: (mode: DesktopLayoutMode) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenExportApk?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  title,
  currentLanguage,
  onOpenLanguageSelector,
  desktopLayout = 'dual',
  onDesktopLayoutChange,
  settings,
  onOpenSettings,
  onOpenExportApk,
}) => {
  const currentLangOption = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  const screenTitle =
    currentScreen === 'profile'
      ? t('profileTitle', currentLanguage)
      : currentScreen === 'translator'
      ? t('translator', currentLanguage)
      : currentScreen === 'moments'
      ? 'Moments · 朋友圈'
      : title || t('conversationTitle', currentLanguage);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[var(--app-surface)]/95 backdrop-blur-xl shadow-xs border-b border-[var(--app-border)] transition-colors">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Left branding & title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            aria-label="Go Back"
            onClick={() => onNavigate(currentScreen === 'conversation' ? 'profile' : 'conversation')}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
          </button>

          <div
            onClick={() => onNavigate('conversation')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            <img
              alt="Together Logo"
              src={ASSETS.logo}
              className="h-8 w-auto object-contain shrink-0"
            />
          </div>

          <h1 className="font-bold text-xs sm:text-base text-[var(--app-text)] tracking-tight truncate leading-tight ml-1">
            {screenTitle}
          </h1>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Wallet & UPI Pill (Click to open Settings/Wallet) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all active:scale-95 shadow-2xs"
            title="Together Digital Wallet (Default India ₹ INR)"
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            <span className="tracking-tight">
              {settings.defaultCurrency === 'INR' ? '₹' : '$'}
              {settings.walletBalance.toLocaleString('en-IN')}
            </span>
          </button>

          {/* PC Desktop Layout Mode Switcher (Visible on large screens) */}
          {onDesktopLayoutChange && (
            <div className="hidden lg:flex items-center bg-[var(--app-surface-subtle)] rounded-xl p-0.5 border border-[var(--app-border)] text-xs">
              <button
                id="btn-layout-dual"
                onClick={() => {
                  onNavigate('conversation');
                  onDesktopLayoutChange('dual');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  desktopLayout === 'dual' && currentScreen === 'conversation'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                }`}
                title="Split screen: Chat and Live Translator side-by-side"
              >
                <span className="material-symbols-outlined text-[15px]">splitscreen</span>
                <span className="hidden xl:inline">{t('dualView', currentLanguage)}</span>
                <span className="xl:hidden">Dual</span>
              </button>

              <button
                id="btn-layout-chat"
                onClick={() => {
                  onNavigate('conversation');
                  onDesktopLayoutChange('chat');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  desktopLayout === 'chat' && currentScreen === 'conversation'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                }`}
                title="Chat focus layout"
              >
                <span className="material-symbols-outlined text-[15px]">chat</span>
                <span className="hidden xl:inline">{t('chatOnly', currentLanguage)}</span>
                <span className="xl:hidden">Chat</span>
              </button>

              <button
                id="btn-layout-translator"
                onClick={() => {
                  onNavigate('translator');
                  onDesktopLayoutChange('translator');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentScreen === 'translator'
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                }`}
                title="Translator studio focus"
              >
                <span className="material-symbols-outlined text-[15px]">translate</span>
                <span className="hidden xl:inline">{t('translatorOnly', currentLanguage)}</span>
                <span className="xl:hidden">Studio</span>
              </button>
            </div>
          )}

          {/* Primary Screen Navigation Switcher */}
          <div className="flex items-center bg-[var(--app-surface-subtle)] rounded-full p-0.5 border border-[var(--app-border)] text-xs">
            <button
              id="nav-chat"
              onClick={() => onNavigate('conversation')}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-medium transition-all ${
                currentScreen === 'conversation'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              {t('chat', currentLanguage)}
            </button>

            <button
              id="nav-translator"
              onClick={() => onNavigate('translator')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full font-medium transition-all ${
                currentScreen === 'translator'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] hidden sm:inline">g_translate</span>
              <span>{t('translator', currentLanguage)}</span>
            </button>

            <button
              id="nav-moments"
              onClick={() => onNavigate('moments')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full font-medium transition-all ${
                currentScreen === 'moments'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
              title="Moments · 朋友圈"
            >
              <span className="material-symbols-outlined text-[15px] hidden sm:inline">photo_camera</span>
              <span>Moments</span>
            </button>

            <button
              id="nav-profile"
              onClick={() => onNavigate('profile')}
              className={`px-2.5 sm:px-3 py-1 rounded-full font-medium transition-all ${
                currentScreen === 'profile'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              {t('profile', currentLanguage)}
            </button>
          </div>

          {/* Language Selector Button */}
          <button
            id="btn-language-selector"
            onClick={onOpenLanguageSelector}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] hover:bg-[var(--app-surface-hover)] text-xs font-medium text-[var(--app-text)] transition-all active:scale-95"
            title="Change Language"
          >
            <span className="text-sm">{currentLangOption.flag}</span>
            <span className="hidden md:inline">{currentLangOption.name}</span>
            <span className="material-symbols-outlined text-[15px] text-[var(--app-text-muted)]">expand_more</span>
          </button>

          {/* PWA Install & Export Mobile APK Button */}
          <PWAInstallButton onOpenExportApk={onOpenExportApk} variant="compact" />

          {/* Settings Button */}
          <button
            id="btn-settings-open"
            onClick={onOpenSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-all active:scale-95 shrink-0"
            title="Open Colors, Theme & UPI Settings"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
