import React, { useState } from 'react';
import { SupportedLanguage } from '../types';
import { t } from '../i18n/translations';
import { playChime } from '../utils/soundEffects';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  togetherId: string;
  name: string;
  currentLanguage: SupportedLanguage;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  togetherId,
  name,
  currentLanguage,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(togetherId);
    setCopied(true);
    playChime('tap');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xs rounded-3xl bg-surface-container-lowest text-on-surface p-6 shadow-2xl relative border border-outline-variant/30 text-center">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-2">
          <span className="material-symbols-outlined text-[26px]">qr_code_2</span>
        </div>
        <h3 className="font-bold text-base text-on-surface">{name}</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {t('qrSubtitle', currentLanguage)}
        </p>

        {/* QR Code graphic mockup */}
        <div className="my-5 p-4 bg-white rounded-2xl border border-outline-variant shadow-inner mx-auto w-48 h-48 flex items-center justify-center relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
            {/* Corner anchors */}
            <rect x="10" y="10" width="22" height="22" rx="3" fill="#006948" />
            <rect x="14" y="14" width="14" height="14" rx="2" fill="white" />
            <rect x="18" y="18" width="6" height="6" fill="#006948" />

            <rect x="68" y="10" width="22" height="22" rx="3" fill="#006948" />
            <rect x="72" y="14" width="14" height="14" rx="2" fill="white" />
            <rect x="76" y="18" width="6" height="6" fill="#006948" />

            <rect x="10" y="68" width="22" height="22" rx="3" fill="#006948" />
            <rect x="14" y="72" width="14" height="14" rx="2" fill="white" />
            <rect x="18" y="76" width="6" height="6" fill="#006948" />

            {/* Simulated Data blocks */}
            <rect x="38" y="12" width="6" height="6" fill="#006948" />
            <rect x="48" y="12" width="8" height="6" fill="#006948" />
            <rect x="38" y="24" width="18" height="6" fill="#006948" />
            <rect x="12" y="38" width="8" height="8" fill="#006948" />
            <rect x="24" y="42" width="8" height="14" fill="#006948" />
            <rect x="36" y="36" width="28" height="28" rx="14" fill="#85f8c4" />
            <text x="50" y="55" fontSize="14" textAnchor="middle" fill="#006948" fontWeight="bold">TG</text>
            <rect x="68" y="40" width="20" height="6" fill="#006948" />
            <rect x="78" y="52" width="12" height="8" fill="#006948" />
            <rect x="38" y="68" width="8" height="20" fill="#006948" />
            <rect x="52" y="72" width="14" height="8" fill="#006948" />
            <rect x="72" y="72" width="16" height="16" fill="#006948" />
          </svg>
        </div>

        <div className="bg-surface-container-low rounded-xl py-2 px-3 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-on-surface">{togetherId}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? t('copiedToast', currentLanguage) : t('copyId', currentLanguage)}</span>
          </button>
        </div>

        <p className="text-[11px] text-outline mt-3">
          {t('qrNotice', currentLanguage)}
        </p>
      </div>
    </div>
  );
};

