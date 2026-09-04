import React from 'react';
import { SupportedLanguage } from '../types';
import { LANGUAGE_OPTIONS, t } from '../i18n/translations';
import { playChime } from '../utils/soundEffects';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  const handleChoose = (code: SupportedLanguage) => {
    onSelectLanguage(code);
    playChime('bell');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-surface-container-lowest text-on-surface p-6 shadow-2xl relative border border-outline-variant/30">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="w-13 h-13 rounded-full bg-primary-fixed text-primary flex items-center justify-center shadow-xs mb-2">
            <span className="material-symbols-outlined text-[26px]">language</span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">
            {t('selectLanguageTitle', currentLanguage)}
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {t('selectLanguageDesc', currentLanguage)}
          </p>
        </div>

        {/* Language Options List */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = opt.code === currentLanguage;
            return (
              <button
                key={opt.code}
                onClick={() => handleChoose(opt.code)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary font-semibold shadow-xs'
                    : 'bg-surface-container-low border-transparent text-on-surface hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.flag}</span>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium leading-tight">{opt.nativeLabel}</span>
                    <span className="text-xs text-on-surface-variant">{opt.name}</span>
                  </div>
                </div>
                {isSelected ? (
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    check_circle
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border border-outline-variant/40" />
                )}
              </button>
            );
          })}
        </div>

        {/* Default language note */}
        <div className="mt-4 pt-3 border-t border-outline-variant/15 text-center">
          <p className="text-[11px] text-on-surface-variant">
            Default: English · Tap any language to switch instantly
          </p>
        </div>
      </div>
    </div>
  );
};
