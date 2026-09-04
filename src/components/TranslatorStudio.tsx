import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, ChatMessage, TranslationHistoryItem } from '../types';
import { LANGUAGE_OPTIONS, t } from '../i18n/translations';
import {
  translateText,
  FAMILY_PHRASES,
  SpeechRecognizer,
  FamilyPhrase,
} from '../utils/translator';
import { speakVoice, playChime } from '../utils/soundEffects';

interface TranslatorStudioProps {
  currentLanguage: SupportedLanguage;
  onSendMessage?: (msg: ChatMessage) => void;
  onClose?: () => void;
  isEmbedded?: boolean; // When rendered side-by-side in dual view on PC
}

export const TranslatorStudio: React.FC<TranslatorStudioProps> = ({
  currentLanguage,
  onSendMessage,
  onClose,
  isEmbedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');

  // Source and Target languages
  const [sourceLang, setSourceLang] = useState<SupportedLanguage>(
    currentLanguage === 'zh-HK' || currentLanguage === 'zh-CN' ? 'zh-HK' : 'en'
  );
  const [targetLang, setTargetLang] = useState<SupportedLanguage>(
    currentLanguage === 'zh-HK' || currentLanguage === 'zh-CN' ? 'en' : 'zh-HK'
  );

  // Text Translator State
  const [sourceText, setSourceText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationProvider, setTranslationProvider] = useState<'gemini' | 'offline-rules'>('gemini');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [sentToast, setSentToast] = useState<boolean>(false);

  // Voice Translator State
  const [activeSpeaker, setActiveSpeaker] = useState<'user' | 'grandma'>('user');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceSourceTranscript, setVoiceSourceTranscript] = useState<string>('');
  const [voiceTranslatedTranscript, setVoiceTranslatedTranscript] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceStatusNotice, setVoiceStatusNotice] = useState<string>('');

  // Selected Category for Quick Phrases
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'care' | 'birthday' | 'meals' | 'warmth'>('all');

  // Translation History
  const [history, setHistory] = useState<TranslationHistoryItem[]>([
    {
      id: 'h-1',
      sourceText: 'Happy 78th Birthday Grandma! Wishing you good health and happiness!',
      translatedText: '外婆78歲生日快樂！祝您福如東海、壽比南山，天天開心！🎂❤️',
      fromLang: 'en',
      toLang: 'zh-HK',
      timestamp: 'Today 8:32 AM',
      type: 'voice',
    },
    {
      id: 'h-2',
      sourceText: 'Remember to drink warm water and rest well today.',
      translatedText: '記得多飲溫水，早啲休息呀。🍵❤️',
      fromLang: 'en',
      toLang: 'zh-HK',
      timestamp: 'Today 8:30 AM',
      type: 'text',
    },
  ]);

  const speechRecognizerRef = useRef<SpeechRecognizer | null>(null);
  const timerRef = useRef<any>(null);

  // Initialize SpeechRecognizer
  useEffect(() => {
    speechRecognizerRef.current = new SpeechRecognizer();
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update target language when current language changes if appropriate
  useEffect(() => {
    if (currentLanguage !== sourceLang && currentLanguage !== targetLang) {
      setTargetLang(currentLanguage);
    }
  }, [currentLanguage]);

  // Handle Swap Languages
  const handleSwapLanguages = () => {
    playChime('tap');
    const oldSource = sourceLang;
    const oldTarget = targetLang;
    setSourceLang(oldTarget);
    setTargetLang(oldSource);

    // Swap text inputs if any
    const oldSourceText = sourceText;
    const oldTranslated = translatedText;
    setSourceText(oldTranslated);
    setTranslatedText(oldSourceText);
  };

  // Perform translation on text input change
  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsTranslating(true);
      try {
        const result = await translateText(sourceText, sourceLang, targetLang);
        setTranslatedText(result.translatedText);
        setTranslationProvider(result.provider);
      } catch (err) {
        console.error('Translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [sourceText, sourceLang, targetLang]);

  // Handle Voice Recording
  const startRecording = (speaker: 'user' | 'grandma') => {
    playChime('tap');
    setActiveSpeaker(speaker);
    setIsListening(true);
    setRecordingSeconds(0);
    setVoiceStatusNotice('');

    const currentSpeakerLang = speaker === 'user' ? sourceLang : targetLang;
    const langOption = LANGUAGE_OPTIONS.find((l) => l.code === currentSpeakerLang);
    const speechCode = langOption?.speechCode || 'en-US';

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    const recognizer = speechRecognizerRef.current;
    if (recognizer && recognizer.isSupported) {
      recognizer.start(
        speechCode,
        (transcript: string, isFinal: boolean) => {
          setVoiceSourceTranscript(transcript);
          if (isFinal) {
            handleFinalizeVoice(transcript, speaker);
          }
        },
        (error: string) => {
          console.warn('Speech recognition warning:', error);
          setVoiceStatusNotice('Microphone access limited. Use presets or click "Try Preset Voice"');
          setIsListening(false);
          if (timerRef.current) clearInterval(timerRef.current);
        },
        () => {
          setIsListening(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      );
    } else {
      // Fallback: Web speech is not supported in iframe/browser -> provide guided preset
      setVoiceStatusNotice('Mic not available in this preview environment. Loading quick voice demo.');
      setTimeout(() => {
        simulateSpokenInput(speaker);
      }, 700);
    }
  };

  const stopRecording = () => {
    playChime('tap');
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.stop();
    }
    if (voiceSourceTranscript) {
      handleFinalizeVoice(voiceSourceTranscript, activeSpeaker);
    }
  };

  const handleFinalizeVoice = async (transcript: string, speaker: 'user' | 'grandma') => {
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const fromL = speaker === 'user' ? sourceLang : targetLang;
    const toL = speaker === 'user' ? targetLang : sourceLang;

    setIsTranslating(true);
    const res = await translateText(transcript, fromL, toL);
    setVoiceTranslatedTranscript(res.translatedText);
    setIsTranslating(false);

    // Auto read aloud translated speech for Grandma / User
    const targetOption = LANGUAGE_OPTIONS.find((l) => l.code === toL);
    speakVoice(res.translatedText, targetOption?.speechCode || 'en-US');

    // Add to history
    const newItem: TranslationHistoryItem = {
      id: `vh-${Date.now()}`,
      sourceText: transcript,
      translatedText: res.translatedText,
      fromLang: fromL,
      toLang: toL,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      type: 'voice',
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 15)]);
  };

  // Simulated Spoken Input for testing
  const simulateSpokenInput = (speaker: 'user' | 'grandma') => {
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);

    let sampleText = '';
    if (speaker === 'user') {
      if (sourceLang === 'zh-HK' || sourceLang === 'zh-CN') {
        sampleText = '外婆，您今天早上量血壓了嗎？身體感覺好唔好？';
      } else if (sourceLang === 'es') {
        sampleText = '¡Hola abuelita! ¿Cómo te sientes hoy? Te mando un abrazo grande.';
      } else {
        sampleText = 'Grandma, did you take your morning vitamins and drink warm water?';
      }
    } else {
      if (targetLang === 'zh-HK' || targetLang === 'zh-CN') {
        sampleText = '乖孫呀，外婆食咗早餐啦，血壓好正常，你今晚過唔過嚟食飯？';
      } else {
        sampleText = 'I am doing wonderful, my sweet grandchild! Grandma cooked fresh dumplings for you.';
      }
    }

    setVoiceSourceTranscript(sampleText);
    handleFinalizeVoice(sampleText, speaker);
  };

  // Playback speech
  const handlePlayVoice = (text: string, lang: SupportedLanguage) => {
    if (!text) return;
    setIsPlayingAudio(true);
    const langOpt = LANGUAGE_OPTIONS.find((l) => l.code === lang);
    speakVoice(text, langOpt?.speechCode || 'en-US', () => {
      setIsPlayingAudio(false);
    });
  };

  // Send translated message directly into family chat
  const handleSendToChat = (text: string, original?: string, isVoice: boolean = false) => {
    if (!text || !onSendMessage) return;
    playChime('success');

    const currentTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const msg: ChatMessage = {
      id: `msg-trans-${Date.now()}`,
      channelId: 'active',
      senderId: 'user',
      senderName: 'Me',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isCurrentUser: true,
      type: isVoice ? 'voice' : 'text',
      text: text,
      translation: original,
      caption: isVoice ? `Voice Translated (${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()})` : undefined,
      audioDuration: isVoice ? '0:06' : undefined,
      time: currentTime,
      status: 'sent',
    };

    onSendMessage(msg);
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2200);
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    playChime('tap');
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  // Quick Preset phrase selected
  const handleSelectPreset = (phrase: FamilyPhrase) => {
    playChime('tap');
    const textInSource = phrase.translations[sourceLang] || phrase.translations.en;
    const textInTarget = phrase.translations[targetLang] || phrase.translations['zh-HK'];

    if (activeTab === 'text') {
      setSourceText(textInSource);
      setTranslatedText(textInTarget);
    } else {
      setVoiceSourceTranscript(textInSource);
      setVoiceTranslatedTranscript(textInTarget);
      const targetOption = LANGUAGE_OPTIONS.find((l) => l.code === targetLang);
      speakVoice(textInTarget, targetOption?.speechCode || 'en-US');
    }
  };

  const filteredPhrases =
    selectedCategory === 'all'
      ? FAMILY_PHRASES
      : FAMILY_PHRASES.filter((p) => p.category === selectedCategory);

  const sourceOption = LANGUAGE_OPTIONS.find((l) => l.code === sourceLang) || LANGUAGE_OPTIONS[0];
  const targetOption = LANGUAGE_OPTIONS.find((l) => l.code === targetLang) || LANGUAGE_OPTIONS[1];

  return (
    <div
      id="translator-studio-root"
      className={`flex flex-col w-full h-full bg-surface transition-all ${
        isEmbedded ? 'rounded-2xl border border-outline-variant/20 shadow-xs' : 'min-h-[calc(100vh-4rem)]'
      }`}
    >
      {/* Studio Header Bar */}
      <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/15 flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">translate</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface">
                {t('translator', currentLanguage)}
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant line-clamp-1">
              {activeTab === 'voice'
                ? t('voiceTranslatorDesc', currentLanguage)
                : t('textTranslatorDesc', currentLanguage)}
            </p>
          </div>
        </div>

        {/* Tab Selector: Voice vs Text */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
          <button
            id="tab-voice-translator"
            onClick={() => {
              playChime('tap');
              setActiveTab('voice');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'voice'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>{t('voiceTranslator', currentLanguage)}</span>
          </button>
          <button
            id="tab-text-translator"
            onClick={() => {
              playChime('tap');
              setActiveTab('text');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>{t('textTranslator', currentLanguage)}</span>
          </button>
        </div>

        {/* Optional close button if presented in full view modal */}
        {onClose && !isEmbedded && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
            aria-label="Close Translator"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* Language Selector Bar with Quick Swap (⇄) */}
      <div className="px-4 py-2.5 bg-surface-container-lowest/70 border-b border-outline-variant/10 flex items-center justify-between gap-2 text-xs">
        {/* Source Language Select */}
        <div className="flex-1 flex items-center gap-2 bg-surface-container-low/80 border border-outline-variant/20 rounded-xl px-2.5 py-1.5">
          <span className="text-base shrink-0">{sourceOption.flag}</span>
          <select
            id="source-lang-select"
            value={sourceLang}
            onChange={(e) => {
              playChime('tap');
              setSourceLang(e.target.value as SupportedLanguage);
            }}
            className="w-full bg-transparent font-medium text-on-surface focus:outline-none cursor-pointer text-xs"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={`src-${lang.code}`} value={lang.code} className="bg-surface text-on-surface">
                {lang.flag} {lang.name} ({lang.nativeLabel})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          id="btn-swap-languages"
          onClick={handleSwapLanguages}
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-surface-container hover:bg-primary/10 text-primary border border-outline-variant/30 active:scale-95 transition-transform"
          title={t('swapLanguages', currentLanguage)}
        >
          <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
        </button>

        {/* Target Language Select */}
        <div className="flex-1 flex items-center gap-2 bg-surface-container-low/80 border border-outline-variant/20 rounded-xl px-2.5 py-1.5">
          <span className="text-base shrink-0">{targetOption.flag}</span>
          <select
            id="target-lang-select"
            value={targetLang}
            onChange={(e) => {
              playChime('tap');
              setTargetLang(e.target.value as SupportedLanguage);
            }}
            className="w-full bg-transparent font-medium text-on-surface focus:outline-none cursor-pointer text-xs"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={`tgt-${lang.code}`} value={lang.code} className="bg-surface text-on-surface">
                {lang.flag} {lang.name} ({lang.nativeLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================================= */}
        {/* VOICE TRANSLATOR TAB                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            {/* Interactive Two-Way Speaker Console */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Speaker 1: You */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isListening && activeSpeaker === 'user'
                    ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                    : 'bg-surface-container-lowest border-outline-variant/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sourceOption.flag}</span>
                    <span className="font-semibold text-xs text-on-surface">
                      {t('youSpeaker', currentLanguage)} ({sourceOption.name})
                    </span>
                  </div>
                  {isListening && activeSpeaker === 'user' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      00:0{recordingSeconds}s
                    </span>
                  )}
                </div>

                <div className="min-h-[70px] flex items-center justify-center p-2 rounded-xl bg-surface-container-low/50 text-xs text-on-surface text-center">
                  {isListening && activeSpeaker === 'user' ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-4 bg-primary rounded-full animate-bounce" />
                        <span className="w-1.5 h-6 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="w-1.5 h-5 bg-primary rounded-full animate-bounce [animation-delay:0.45s]" />
                      </div>
                      <span className="text-primary font-medium">{t('listening', currentLanguage)}</span>
                    </div>
                  ) : voiceSourceTranscript && activeSpeaker === 'user' ? (
                    <p className="line-clamp-3 text-left w-full">{voiceSourceTranscript}</p>
                  ) : (
                    <span className="text-on-surface-variant/70 italic">
                      Tap the mic to speak in {sourceOption.name}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    id="btn-record-user"
                    onClick={() => {
                      if (isListening && activeSpeaker === 'user') {
                        stopRecording();
                      } else {
                        startRecording('user');
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all ${
                      isListening && activeSpeaker === 'user'
                        ? 'bg-red-500 text-white shadow-md animate-pulse'
                        : 'bg-primary text-on-primary hover:bg-primary/90 shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isListening && activeSpeaker === 'user' ? 'stop' : 'mic'}
                    </span>
                    <span>
                      {isListening && activeSpeaker === 'user'
                        ? t('stopRecording', currentLanguage)
                        : t('tapToSpeak', currentLanguage)}
                    </span>
                  </button>

                  <button
                    onClick={() => simulateSpokenInput('user')}
                    className="px-2.5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-primary/5 text-xs font-medium"
                    title={t('simulateVoice', currentLanguage)}
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  </button>
                </div>
              </div>

              {/* Speaker 2: Grandma */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isListening && activeSpeaker === 'grandma'
                    ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                    : 'bg-surface-container-lowest border-outline-variant/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{targetOption.flag}</span>
                    <span className="font-semibold text-xs text-on-surface">
                      {t('grandmaSpeaker', currentLanguage)} ({targetOption.name})
                    </span>
                  </div>
                  {isListening && activeSpeaker === 'grandma' && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      00:0{recordingSeconds}s
                    </span>
                  )}
                </div>

                <div className="min-h-[70px] flex items-center justify-center p-2 rounded-xl bg-surface-container-low/50 text-xs text-on-surface text-center">
                  {isListening && activeSpeaker === 'grandma' ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-4 bg-primary rounded-full animate-bounce" />
                        <span className="w-1.5 h-6 bg-primary rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.3s]" />
                        <span className="w-1.5 h-5 bg-primary rounded-full animate-bounce [animation-delay:0.45s]" />
                      </div>
                      <span className="text-primary font-medium">{t('listening', currentLanguage)}</span>
                    </div>
                  ) : voiceSourceTranscript && activeSpeaker === 'grandma' ? (
                    <p className="line-clamp-3 text-left w-full">{voiceSourceTranscript}</p>
                  ) : (
                    <span className="text-on-surface-variant/70 italic">
                      Grandma speaks in {targetOption.name}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    id="btn-record-grandma"
                    onClick={() => {
                      if (isListening && activeSpeaker === 'grandma') {
                        stopRecording();
                      } else {
                        startRecording('grandma');
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all ${
                      isListening && activeSpeaker === 'grandma'
                        ? 'bg-red-500 text-white shadow-md animate-pulse'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isListening && activeSpeaker === 'grandma' ? 'stop' : 'mic'}
                    </span>
                    <span>
                      {isListening && activeSpeaker === 'grandma'
                        ? t('stopRecording', currentLanguage)
                        : `${targetOption.name} Voice`}
                    </span>
                  </button>

                  <button
                    onClick={() => simulateSpokenInput('grandma')}
                    className="px-2.5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-primary/5 text-xs font-medium"
                    title={t('simulateVoice', currentLanguage)}
                  >
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Status Alert if any */}
            {voiceStatusNotice && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>{voiceStatusNotice}</span>
              </div>
            )}

            {/* Live Translated Audio Card */}
            {(voiceTranslatedTranscript || isTranslating) && (
              <div className="p-4 rounded-2xl bg-surface-container-lowest border border-primary/30 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="font-semibold text-xs text-primary">
                      {isTranslating ? t('translating', currentLanguage) : t('translatedSpeech', currentLanguage)}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    {activeSpeaker === 'user'
                      ? `${sourceOption.name} → ${targetOption.name}`
                      : `${targetOption.name} → ${sourceOption.name}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/15 text-sm text-on-surface leading-relaxed">
                  {isTranslating ? (
                    <div className="flex items-center gap-2 text-on-surface-variant py-2">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>{t('translating', currentLanguage)}</span>
                    </div>
                  ) : (
                    <p className="font-medium">{voiceTranslatedTranscript}</p>
                  )}
                </div>

                {/* Voice Action Controls */}
                {!isTranslating && voiceTranslatedTranscript && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handlePlayVoice(
                            voiceTranslatedTranscript,
                            activeSpeaker === 'user' ? targetLang : sourceLang
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isPlayingAudio ? 'volume_up' : 'play_arrow'}
                        </span>
                        <span>{t('playAudio', currentLanguage)}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(voiceTranslatedTranscript)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-medium border border-outline-variant/20"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span>{copiedToast ? t('copied', currentLanguage) : t('copyTranslation', currentLanguage)}</span>
                      </button>
                    </div>

                    {onSendMessage && (
                      <button
                        id="btn-voice-send-chat"
                        onClick={() =>
                          handleSendToChat(voiceTranslatedTranscript, voiceSourceTranscript, true)
                        }
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>{sentToast ? t('insertedInChat', currentLanguage) : t('sendToChat', currentLanguage)}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TEXT TRANSLATOR TAB                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'text' && (
          <div className="space-y-3.5">
            {/* Input & Translation Cards Container (Side-by-side on desktop, stacked on mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {/* Source Text Box */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{sourceOption.flag}</span>
                      <span className="font-semibold text-xs text-on-surface">{sourceOption.name}</span>
                    </div>
                    {sourceText && (
                      <button
                        onClick={() => setSourceText('')}
                        className="text-[11px] text-on-surface-variant hover:text-red-500 transition-colors"
                      >
                        {t('clearText', currentLanguage)}
                      </button>
                    )}
                  </div>

                  <textarea
                    id="input-translate-source"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder={t('sourceTextPlaceholder', currentLanguage)}
                    rows={4}
                    className="w-full bg-surface-container-low/40 border border-outline-variant/15 rounded-xl p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-outline-variant/10 text-[11px] text-on-surface-variant">
                  <span>{sourceText.length} characters</span>
                  {sourceText && (
                    <button
                      onClick={() => handlePlayVoice(sourceText, sourceLang)}
                      className="flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <span className="material-symbols-outlined text-[15px]">volume_up</span>
                      <span>{t('playAudio', currentLanguage)}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Target Translation Box */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-primary/20 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{targetOption.flag}</span>
                      <span className="font-semibold text-xs text-primary">{targetOption.name}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {isTranslating
                        ? t('translating', currentLanguage)
                        : translationProvider === 'gemini'
                        ? t('providerGemini', currentLanguage)
                        : t('providerOffline', currentLanguage)}
                    </span>
                  </div>

                  <div className="min-h-[104px] p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/15 text-sm text-on-surface leading-relaxed">
                    {isTranslating ? (
                      <div className="flex items-center gap-2 text-on-surface-variant py-4">
                        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">{t('translating', currentLanguage)}</span>
                      </div>
                    ) : translatedText ? (
                      <p className="font-medium whitespace-pre-wrap">{translatedText}</p>
                    ) : (
                      <span className="text-xs text-on-surface-variant/50 italic">
                        {t('translationResultPlaceholder', currentLanguage)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Target Action Bar */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    {translatedText && (
                      <button
                        onClick={() => handlePlayVoice(translatedText, targetLang)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium"
                      >
                        <span className="material-symbols-outlined text-[15px]">volume_up</span>
                        <span>{t('playAudio', currentLanguage)}</span>
                      </button>
                    )}
                    {translatedText && (
                      <button
                        onClick={() => handleCopy(translatedText)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium"
                      >
                        <span className="material-symbols-outlined text-[15px]">content_copy</span>
                        <span>{copiedToast ? t('copied', currentLanguage) : t('copyTranslation', currentLanguage)}</span>
                      </button>
                    )}
                  </div>

                  {translatedText && onSendMessage && (
                    <button
                      id="btn-text-send-chat"
                      onClick={() => handleSendToChat(translatedText, sourceText, false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>{sentToast ? t('insertedInChat', currentLanguage) : t('sendToChat', currentLanguage)}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* QUICK FAMILY PHRASES SECTION (Elder Care Presets)                         */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">family_restroom</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                {t('quickFamilyPhrases', currentLanguage)}
              </h3>
            </div>
            <span className="text-[11px] text-on-surface-variant">
              Tap any card to translate instantly
            </span>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('care')}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === 'care'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🌸 {t('careHealth', currentLanguage)}
            </button>
            <button
              onClick={() => setSelectedCategory('birthday')}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === 'birthday'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🎂 {t('birthdayBlessings', currentLanguage)}
            </button>
            <button
              onClick={() => setSelectedCategory('meals')}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === 'meals'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🥟 {t('mealsCooking', currentLanguage)}
            </button>
            <button
              onClick={() => setSelectedCategory('warmth')}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === 'warmth'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              🏠 {t('familyWarmth', currentLanguage)}
            </button>
          </div>

          {/* Grid of Preset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredPhrases.map((phrase) => {
              const srcTxt = phrase.translations[sourceLang] || phrase.translations.en;
              const tgtTxt = phrase.translations[targetLang] || phrase.translations['zh-HK'];

              return (
                <div
                  key={phrase.id}
                  onClick={() => handleSelectPreset(phrase)}
                  className="p-3 rounded-xl bg-surface-container-low/60 hover:bg-primary/5 hover:border-primary/40 border border-outline-variant/20 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <p className="text-xs font-medium text-on-surface line-clamp-2 mb-1.5">
                    {srcTxt}
                  </p>
                  <div className="pt-1.5 border-t border-outline-variant/15 flex items-center justify-between">
                    <p className="text-[11px] text-primary line-clamp-1">
                      {tgtTxt}
                    </p>
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant group-hover:text-primary shrink-0 ml-1">
                      arrow_forward
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECENT TRANSLATION HISTORY                                                */}
        {/* ========================================================================= */}
        {history.length > 0 && (
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Recent Translations
                </h3>
              </div>
              <span className="text-[11px] text-on-surface-variant">{history.length} items</span>
            </div>

            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/15 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-on-surface-variant font-medium">
                      <span className="uppercase px-1.5 py-0.5 rounded bg-surface-container font-bold">
                        {item.type}
                      </span>
                      <span>
                        {item.fromLang.toUpperCase()} → {item.toLang.toUpperCase()}
                      </span>
                      <span>·</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="text-on-surface line-clamp-1">{item.sourceText}</p>
                    <p className="text-primary font-medium line-clamp-1 mt-0.5">{item.translatedText}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePlayVoice(item.translatedText, item.toLang)}
                      className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary"
                      title="Play Voice"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    </button>
                    {onSendMessage && (
                      <button
                        onClick={() => handleSendToChat(item.translatedText, item.sourceText, item.type === 'voice')}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"
                        title="Send to Grandma"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
