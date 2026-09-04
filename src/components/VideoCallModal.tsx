import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { t } from '../i18n/translations';
import { ASSETS } from '../data/mockData';
import { playChime } from '../utils/soundEffects';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVideo?: boolean;
  currentLanguage: SupportedLanguage;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  isVideo = true,
  currentLanguage,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setSeconds(0);
      timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const addHeart = () => {
    playChime('tap');
    const newHeart = { id: Date.now(), left: Math.random() * 60 + 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md h-full max-h-[840px] flex flex-col justify-between overflow-hidden bg-surface-container-highest/10 md:rounded-3xl shadow-2xl border border-white/10">
        {/* Remote Video / Grandma Full Portrait */}
        <div className="absolute inset-0 z-0">
          <img
            src={ASSETS.grandmaAvatar}
            alt="Grandma Martha"
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
        </div>

        {/* Floating Heart Animations */}
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-28 pointer-events-none text-3xl animate-bounce"
            style={{ left: `${h.left}%`, transition: 'all 2s ease-out', transform: 'translateY(-180px)' }}
          >
            ❤️
          </div>
        ))}

        {/* Top Header */}
        <div className="relative z-10 pt-10 px-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {t('grandmaName', currentLanguage)}
              </h2>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              {isVideo ? t('videoCallSubtitle', currentLanguage) : t('voiceCallSubtitle', currentLanguage)} · {formatTime(seconds)}
            </p>
            <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] text-white/90 w-fit">
              <span className="material-symbols-outlined text-[14px]">family_home</span>
              <span>{t('livingRoomConnected', currentLanguage)}</span>
            </div>
          </div>

          {/* Self View PIP */}
          {isVideo && (
            <div className="w-20 h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-white/40 relative bg-zinc-800">
              <img
                src={ASSETS.userAvatar}
                alt="Me"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/50 text-[9px] font-semibold text-white">
                {t('videoCallSelf', currentLanguage)}
              </div>
            </div>
          )}
        </div>

        {/* Live Audio Transcription Subtitle */}
        <div className="relative z-10 px-6 my-auto">
          <div className="bg-black/60 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-lg">
            <div className="flex items-center gap-1.5 mb-1 text-emerald-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">translate</span>
              <span>{t('liveTranscription', currentLanguage)}</span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">
              &quot;{t('grandmaName', currentLanguage)}: {t('videoCallGrandmaQuote', currentLanguage)}&quot;
            </p>
          </div>
        </div>

        {/* Bottom Call Controls */}
        <div className="relative z-10 pb-10 px-6 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-5">
            {/* Heart Reaction */}
            <button
              onClick={addHeart}
              aria-label="Send Heart Reaction"
              className="w-13 h-13 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="text-2xl">❤️</span>
            </button>

            {/* Mute Mic */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              aria-label="Toggle Mic"
              className={`w-13 h-13 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                isMuted ? 'bg-amber-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMuted ? 'mic_off' : 'mic'}
              </span>
            </button>

            {/* Video Toggle */}
            {isVideo && (
              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                aria-label="Toggle Video"
                className={`w-13 h-13 rounded-full flex items-center justify-center active:scale-90 transition-all ${
                  isVideoOff ? 'bg-amber-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {isVideoOff ? 'videocam_off' : 'videocam'}
                </span>
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={() => {
                playChime('tap');
                onClose();
              }}
              aria-label="End Call"
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                call_end
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

