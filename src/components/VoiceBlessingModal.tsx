import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { t } from '../i18n/translations';
import { playChime } from '../utils/soundEffects';

interface VoiceBlessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (duration: string, transcript: string) => void;
  currentLanguage: SupportedLanguage;
}

const LOCALIZED_VOICE_TRANSCRIPTS: Record<SupportedLanguage, string> = {
  en: "Happy Birthday Grandma! Wishing you happiness, good health, and longevity! See you tonight! ❤️",
  'zh-HK': "外婆生日快樂！祝您福如東海、壽比南山，身體健康！今晚見！❤️",
  'zh-CN': "外婆生日快乐！祝您福如东海、寿比南山，身体倍儿棒！晚上见！❤️",
  es: "¡Feliz cumpleaños abuelita! ¡Te deseamos mucha salud, paz y bendiciones! ¡Nos vemos esta noche! ❤️",
  ja: "おばあちゃんお誕生日おめでとう！いつも元気で長生きしてね。今夜会えるのを楽しみにしています！❤️",
  ko: "할머니 생신 축하드려요! 늘 건강하시고 만수무강하세요. 오늘 저녁에 봬요! ❤️",
  fr: "Joyeux anniversaire Grand-mère ! Que du bonheur et une excellente santé ! À ce soir ! ❤️",
  vi: "Mừng sinh nhật Bà Ngoại! Kính chúc bà luôn mạnh khỏe, trường thọ và an vui! Tối nay con qua nhé! ❤️",
};

export const VoiceBlessingModal: React.FC<VoiceBlessingModalProps> = ({
  isOpen,
  onClose,
  onSend,
  currentLanguage,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimer(0);
      setRecorded(false);
      playChime('tap');
    } else {
      setIsRecording(false);
      setRecorded(true);
      playChime('bell');
    }
  };

  const handleSend = () => {
    const formatDuration = `0:${timer < 10 ? '0' + timer : timer}`;
    const transcript = LOCALIZED_VOICE_TRANSCRIPTS[currentLanguage] || LOCALIZED_VOICE_TRANSCRIPTS.en;
    onSend(
      timer > 0 ? formatDuration : '0:06',
      transcript
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-surface-container-lowest text-on-surface p-6 shadow-2xl relative border border-outline-variant/30">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-14 h-14 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center shadow-sm mb-2">
            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              mic
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">
            {t('voiceBlessingTitle', currentLanguage)}
          </h3>
          <p className="text-xs text-on-surface-variant">
            {t('voiceBlessingSubtitle', currentLanguage)}
          </p>
        </div>

        {/* Waveform Visualization */}
        <div className="my-6 bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
          <div className="flex items-end justify-center gap-1.5 h-12">
            {[4, 12, 8, 20, 15, 24, 18, 9, 22, 14, 26, 11, 7, 19, 13].map((height, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all duration-200 ${
                  isRecording
                    ? 'bg-secondary animate-pulse'
                    : recorded
                    ? 'bg-primary'
                    : 'bg-outline-variant'
                }`}
                style={{
                  height: isRecording
                    ? `${Math.max(6, (height * (1 + Math.sin((timer + i) * 1.5))) / 1.5)}px`
                    : `${height}px`,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-on-surface tracking-wider font-mono">
            0:{timer < 10 ? '0' + timer : timer} {isRecording && `· ${t('recordingInProgress', currentLanguage)}`}
          </span>
        </div>

        {/* Record Control */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleRecording}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isRecording
                ? 'bg-tertiary text-on-tertiary ring-4 ring-tertiary/20 animate-pulse'
                : 'bg-secondary-container text-on-secondary-container hover:bg-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[32px]">
              {isRecording ? 'stop' : 'mic'}
            </span>
          </button>
        </div>
        <p className="text-center text-xs text-on-surface-variant mt-3">
          {isRecording
            ? t('tapToFinish', currentLanguage)
            : recorded
            ? t('listenAgain', currentLanguage) || 'Recording ready to send'
            : t('tapToRecord', currentLanguage)}
        </p>

        {recorded && (
          <button
            onClick={handleSend}
            className="mt-5 w-full py-3 rounded-2xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:bg-primary-container active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>{t('sendVoiceBlessingBtn', currentLanguage)}</span>
          </button>
        )}
      </div>
    </div>
  );
};

