import React, { useState, useRef, useEffect } from 'react';
import { ChatChannel, ChatMessage, UserProfile, SupportedLanguage, AppSettings, RedPacketData } from '../types';
import { playChime, speakVoice } from '../utils/soundEffects';
import { translateText } from '../utils/translator';
import { RedPacketModal } from './RedPacketModal';
import { RedPacketEnvelopeDialog } from './RedPacketEnvelopeDialog';
import { VideoCallModal } from './VideoCallModal';

interface ConversationViewProps {
  channel: ChatChannel;
  messages: ChatMessage[];
  onSendMessage: (message: ChatMessage) => void;
  profile: UserProfile;
  settings: AppSettings;
  currentLanguage: SupportedLanguage;
  onOpenTranslator?: () => void;
  onOpenSettings?: () => void;
  onBackToChannelList?: () => void;
  isDualPane?: boolean;
  onClaimRedPacket?: (packetId: string, amount: string) => void;
  onUpdateWalletBalance?: (amountDelta: number) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  channel,
  messages,
  onSendMessage,
  profile,
  settings,
  currentLanguage,
  onOpenTranslator,
  onOpenSettings,
  onBackToChannelList,
  isDualPane: _isDualPane = false,
  onClaimRedPacket,
  onUpdateWalletBalance,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRedPacketModalOpen, setIsRedPacketModalOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [selectedRedPacket, setSelectedRedPacket] = useState<RedPacketData | null>(null);

  // Message translation state map
  const [translations, setTranslations] = useState<Record<string, { text: string; loading: boolean }>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleSendTextMessage = () => {
    if (!inputText.trim()) return;

    playChime('tap');
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: channel.id,
      senderId: 'user',
      senderName: profile.name,
      senderAvatar: profile.avatarUrl,
      isCurrentUser: true,
      type: 'text',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    onSendMessage(newMsg);
    setInputText('');

    // Simulate instant peer response if in direct chat
    if (channel.type === 'private') {
      simulatePeerReply(channel);
    }
  };

  const handleFinishVoiceRecord = () => {
    setIsRecordingVoice(false);
    playChime('tap');

    const durationStr = `0:${recordingSeconds < 10 ? '0' : ''}${Math.max(1, recordingSeconds)}`;
    const newMsg: ChatMessage = {
      id: `msg-voice-${Date.now()}`,
      channelId: channel.id,
      senderId: 'user',
      senderName: profile.name,
      senderAvatar: profile.avatarUrl,
      isCurrentUser: true,
      type: 'voice',
      audioDuration: durationStr,
      text: 'Voice message transmitted over Together network 🎙️',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    onSendMessage(newMsg);
  };

  const simulatePeerReply = (targetChannel: ChatChannel) => {
    setTimeout(() => {
      playChime('bell');
      const replies: Record<string, string[]> = {
        aarav: [
          'Awesome! Let us meet tomorrow at 11 AM at Indiranagar filter coffee place. ☕',
          'Sounds great brother! Thanks for the instant UPI payment setup. 🚀',
          'Got your message! Working on the new release branch right now. 👍',
        ],
        elena: [
          'Perfekt! Ich werde das neue Layout gleich anpassen. Danke! 🎨',
          'Thank you for checking! The colors and typography feel very refined.',
        ],
        meiling: [
          '多謝！Thank you! Wishing you and your family abundant peace and good health ✨',
        ],
      };

      const defaultReplies = [
        'Received loud and clear! Talk soon! 👍',
        'Thanks for connecting on Together! 🌟',
        'Great to hear from you! Have a productive day! 🚀',
      ];

      const pool = replies[targetChannel.id] || defaultReplies;
      const chosenText = pool[Math.floor(Math.random() * pool.length)];

      const peerMsg: ChatMessage = {
        id: `peer-${Date.now()}`,
        channelId: targetChannel.id,
        senderId: targetChannel.id,
        senderName: targetChannel.name,
        senderAvatar: targetChannel.avatarUrl,
        isCurrentUser: false,
        type: 'text',
        text: chosenText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };

      onSendMessage(peerMsg);
    }, 1800);
  };

  const handleTranslateMessage = async (msgId: string, textToTranslate: string) => {
    if (translations[msgId]?.text) {
      // Toggle off
      setTranslations((prev) => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
      return;
    }

    setTranslations((prev) => ({
      ...prev,
      [msgId]: { text: '', loading: true },
    }));

    try {
      const res = await translateText(textToTranslate, 'auto', currentLanguage);
      setTranslations((prev) => ({
        ...prev,
        [msgId]: { text: res.translatedText, loading: false },
      }));
    } catch {
      setTranslations((prev) => ({
        ...prev,
        [msgId]: { text: textToTranslate, loading: false },
      }));
    }
  };

  const handlePlayVoice = (msgId: string, textToSpeak: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(msgId);
    speakVoice(textToSpeak, currentLanguage);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 4000);
  };

  const handleSendRedPacket = (packetData: Omit<RedPacketData, 'id' | 'isOpened' | 'claimedCount' | 'claims'>) => {
    const newRedPacket: RedPacketData = {
      ...packetData,
      id: `rp-${Date.now()}`,
      isOpened: false,
      claimedCount: 0,
      claims: [],
    };

    const newMsg: ChatMessage = {
      id: `msg-rp-${Date.now()}`,
      channelId: channel.id,
      senderId: 'user',
      senderName: profile.name,
      senderAvatar: profile.avatarUrl,
      isCurrentUser: true,
      type: 'red_packet',
      redPacket: newRedPacket,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    onSendMessage(newMsg);

    // Deduct from wallet balance if wallet method was chosen
    if (packetData.paymentMethod === 'wallet' && onUpdateWalletBalance) {
      const amt = parseFloat(packetData.amount) || 0;
      onUpdateWalletBalance(-amt);
    }
  };

  const handleClaimRedPacket = (packetId: string, claimedAmount: string) => {
    if (onClaimRedPacket) {
      onClaimRedPacket(packetId, claimedAmount);
    }

    // Update selected packet locally so dialog shows open state
    setSelectedRedPacket((prev) => {
      if (!prev || prev.id !== packetId) return prev;
      return {
        ...prev,
        isOpened: true,
        claimedCount: prev.claimedCount + 1,
        claims: [
          ...prev.claims,
          {
            name: profile.name,
            avatar: profile.avatarUrl,
            amount: claimedAmount,
            time: 'Just now',
            isLuckyWinner: true,
          },
        ],
      };
    });
  };

  // Chat Wallpaper CSS class
  const wallpaperClass = `wallpaper-${settings.chatWallpaper || 'doodles'}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-sm overflow-hidden relative">
      {/* 1. CHANNEL HEADER */}
      <div className="px-4 py-3 border-b border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back button */}
          {onBackToChannelList && (
            <button
              onClick={onBackToChannelList}
              className="lg:hidden -ml-1 p-1.5 rounded-xl hover:bg-[var(--app-surface-hover)] text-[var(--app-text)] transition-colors"
              title="Back to all chats"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}

          {/* Channel Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={channel.avatarUrl}
              alt={channel.name}
              className="w-10 h-10 rounded-2xl object-cover border border-[var(--app-border)] shadow-xs"
            />
            {channel.type === 'private' ? (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--app-surface)] ${
                  channel.onlineStatus === 'Online' ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
            ) : (
              <span className="absolute -bottom-1 -right-1 px-1 rounded-md bg-[var(--app-surface)] border border-[var(--app-border)] text-[8px] font-bold text-[var(--app-text-muted)]">
                {channel.membersCount || '👥'}
              </span>
            )}
          </div>

          {/* Channel Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold truncate text-[var(--app-text)]">
                {channel.name}
              </h2>
              {channel.countryFlag && (
                <span className="text-xs flex-shrink-0">{channel.countryFlag}</span>
              )}
              {channel.verified && (
                <span
                  className="material-symbols-outlined text-[14px] text-blue-500 flex-shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              )}
            </div>

            <p className="text-[11px] text-[var(--app-text-muted)] truncate">
              {channel.type === 'private'
                ? channel.onlineStatus || 'Active'
                : `${channel.membersCount || 24} members · ${channel.onlineStatus || 'Online'}`}
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Quick Action Red Packet Button */}
          <button
            onClick={() => setIsRedPacketModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 border border-red-500"
            title="Send Red Packet Money (UPI / Wallet)"
          >
            <span>🧧</span>
            <span className="hidden sm:inline font-bold">Red Packet</span>
            <span className="text-[10px] opacity-90">({settings.defaultCurrency === 'INR' ? '₹' : settings.defaultCurrency})</span>
          </button>

          {/* Translator Studio Shortcut */}
          {onOpenTranslator && (
            <button
              onClick={onOpenTranslator}
              className="p-2 rounded-xl hover:bg-[var(--app-surface-hover)] text-[var(--app-text)] transition-colors"
              title="Open Voice & Text Translator Studio"
            >
              <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]">
                translate
              </span>
            </button>
          )}

          {/* Video / Voice Call */}
          <button
            onClick={() => setIsVideoCallOpen(true)}
            className="p-2 rounded-xl hover:bg-[var(--app-surface-hover)] text-[var(--app-text)] transition-colors"
            title="Start Call"
          >
            <span className="material-symbols-outlined text-[20px]">videocam</span>
          </button>

          {/* Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl hover:bg-[var(--app-surface-hover)] text-[var(--app-text)] transition-colors"
              title="Theme & UPI Settings"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CHAT MESSAGE STREAM */}
      <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 ${wallpaperClass} no-scrollbar`}>
        {/* Chat Intro / Encrypted Banner */}
        <div className="text-center my-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[10px] font-medium text-[var(--app-text-muted)] shadow-2xs">
            <span className="material-symbols-outlined text-[13px] text-emerald-600">lock</span>
            <span>End-to-end encrypted · Together Global Network</span>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.isCurrentUser;
          const translationState = translations[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {/* Other sender's avatar */}
              {!isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-xl object-cover border border-[var(--app-border)] flex-shrink-0 mb-1"
                />
              )}

              <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Name in group chat */}
                {channel.type === 'group' && !isMe && (
                  <span className="text-[10px] font-bold text-[var(--app-text-muted)] ml-2 mb-0.5">
                    {msg.senderName}
                  </span>
                )}

                {/* A. TEXT MESSAGE */}
                {msg.type === 'text' && (
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative transition-all ${
                      isMe
                        ? 'bg-[var(--color-primary)] text-white rounded-br-xs'
                        : 'bg-[var(--app-surface)] text-[var(--app-text)] border border-[var(--app-border)] rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* In-Chat Translation Box */}
                    {translationState?.loading && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-[11px] flex items-center gap-1.5 opacity-80">
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        <span>Translating with Gemini AI...</span>
                      </div>
                    )}

                    {translationState?.text && (
                      <div className="mt-2 pt-2 border-t border-current/20 text-xs italic flex items-start gap-1">
                        <span className="material-symbols-outlined text-[14px] flex-shrink-0 mt-0.5 opacity-80">
                          translate
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold block text-[10px] uppercase opacity-75">
                            Translation:
                          </span>
                          <span>{translationState.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Message Meta Info: Timestamp, translate button, voice button */}
                    <div className="mt-1.5 flex items-center justify-end gap-2 text-[10px] opacity-75">
                      {/* Translate button */}
                      <button
                        onClick={() => handleTranslateMessage(msg.id, msg.text || '')}
                        className="hover:underline flex items-center gap-0.5"
                        title="Translate message"
                      >
                        <span className="material-symbols-outlined text-[12px]">g_translate</span>
                        <span>{translationState?.text ? 'Hide' : 'Translate'}</span>
                      </button>

                      {/* Read aloud */}
                      <button
                        onClick={() => handlePlayVoice(msg.id, translationState?.text || msg.text || '')}
                        className="hover:underline flex items-center gap-0.5"
                        title="Read aloud"
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {playingAudioId === msg.id ? 'volume_off' : 'volume_up'}
                        </span>
                      </button>

                      <span>{msg.time}</span>
                      {isMe && (
                        <span className="material-symbols-outlined text-[13px]">done_all</span>
                      )}
                    </div>
                  </div>
                )}

                {/* B. VOICE MESSAGE */}
                {msg.type === 'voice' && (
                  <div
                    className={`p-3 rounded-2xl shadow-xs border transition-all ${
                      isMe
                        ? 'bg-[var(--color-primary)] text-white border-transparent rounded-br-xs'
                        : 'bg-[var(--app-surface)] text-[var(--app-text)] border-[var(--app-border)] rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePlayVoice(msg.id, msg.text || 'Voice blessing recording')}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow transition-transform active:scale-95 ${
                          isMe ? 'bg-white text-[var(--color-primary)]' : 'bg-[var(--color-primary)] text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {playingAudioId === msg.id ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      {/* Animated Audio Waveform */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[40, 70, 90, 60, 100, 50, 80, 45, 85, 60, 40].map((h, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full transition-all ${
                              playingAudioId === msg.id ? 'animate-pulse' : ''
                            } ${isMe ? 'bg-white/80' : 'bg-[var(--color-primary)]'}`}
                          />
                        ))}
                      </div>

                      <span className="text-xs font-mono font-bold opacity-85">
                        {msg.audioDuration || '0:12'}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] opacity-80 border-t border-current/15 pt-1.5 flex items-center justify-between">
                      <span>{msg.text}</span>
                      <span className="text-[10px] ml-2">{msg.time}</span>
                    </div>
                  </div>
                )}

                {/* C. RED PACKET MESSAGE BUBBLE */}
                {msg.type === 'red_packet' && msg.redPacket && (
                  <div
                    onClick={() => setSelectedRedPacket(msg.redPacket || null)}
                    className="w-64 sm:w-72 rounded-2xl overflow-hidden shadow-lg border border-amber-400/40 bg-gradient-to-b from-[#dc2626] via-[#b91c1c] to-[#991b1b] text-white cursor-pointer hover:brightness-105 active:scale-98 transition-all group"
                  >
                    {/* Upper Envelope Card with Gold Seal */}
                    <div className="p-3.5 flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-red-950 flex flex-col items-center justify-center font-black shadow-md border border-amber-200 flex-shrink-0 group-hover:scale-105 transition-transform">
                        <span className="text-lg font-black">{msg.redPacket.currencySymbol}</span>
                        <span className="text-[8px] font-bold tracking-tight uppercase">OPEN</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-amber-200 truncate">
                            {msg.redPacket.currencySymbol}{msg.redPacket.amount} Red Packet
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-red-950 font-bold uppercase">
                            {msg.redPacket.paymentMethod === 'upi' ? 'UPI' : 'Wallet'}
                          </span>
                        </div>

                        <p className="text-xs text-amber-100/90 line-clamp-2 mt-1 italic">
                          &ldquo;{msg.redPacket.wish}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="px-3.5 py-2 bg-black/25 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-amber-200">
                        <span className="material-symbols-outlined text-[14px]">
                          {msg.redPacket.isOpened ? 'check_circle' : 'touch_app'}
                        </span>
                        <span className="font-semibold">
                          {msg.redPacket.isOpened
                            ? `Claimed (${msg.redPacket.currencySymbol}${msg.redPacket.amount})`
                            : 'Tap to Open Red Packet'}
                        </span>
                      </div>

                      <span className="text-[10px] text-white/70">{msg.time}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Current user's avatar */}
              {isMe && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-7 h-7 rounded-xl object-cover border border-[var(--app-border)] flex-shrink-0 mb-1"
                />
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT COMPOSER TOOLBAR */}
      <div className="p-3 border-t border-[var(--app-border)] bg-[var(--app-surface-subtle)]">
        {isRecordingVoice ? (
          /* Live Voice Recording UI */
          <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/40 p-2.5 rounded-2xl border border-red-300 dark:border-red-800 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-bold text-red-700 dark:text-red-300">
                Recording Voice Note... 0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="px-3 py-1 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinishVoiceRecord}
                className="px-3.5 py-1 rounded-xl bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700"
              >
                Send Voice
              </button>
            </div>
          </div>
        ) : (
          /* Normal Input Bar */
          <div className="flex flex-col gap-2">
            {/* Quick Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => setIsRedPacketModalOpen(true)}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold shadow-xs hover:brightness-105"
              >
                <span>🧧</span>
                <span>Send Shagun (UPI / Wallet)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('Chai on me! Let us catch up today ☕');
                }}
                className="flex-shrink-0 px-2 py-1 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                ☕ Chai Treat
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('Congratulations on the big milestone! 🎉🚀');
                }}
                className="flex-shrink-0 px-2 py-1 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                🎉 Congrats
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('Festival greetings and warmest blessings to you and family! 🪔✨');
                }}
                className="flex-shrink-0 px-2 py-1 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                🪔 Festive Shagun
              </button>
            </div>

            {/* Input & Send Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2.5 rounded-2xl bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)] text-[var(--app-text)] transition-colors"
                title="Hold or tap to record voice"
              >
                <span className="material-symbols-outlined text-[20px] text-red-600">mic</span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendTextMessage();
                }}
                placeholder={`Message ${channel.name}... (Press Enter to send)`}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] text-xs sm:text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />

              <button
                type="button"
                onClick={handleSendTextMessage}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-[var(--color-primary)] text-white shadow-md hover:brightness-105 active:scale-95 disabled:opacity-40 transition-all"
                title="Send message"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODALS */}
      {/* Red Packet Send Modal with India INR default and UPI/Wallet */}
      <RedPacketModal
        isOpen={isRedPacketModalOpen}
        onClose={() => setIsRedPacketModalOpen(false)}
        onSend={handleSendRedPacket}
        currentLanguage={currentLanguage}
        settings={settings}
        chatType={channel.type}
        channelName={channel.name}
        onOpenWalletTopup={() => {
          setIsRedPacketModalOpen(false);
          if (onOpenSettings) onOpenSettings();
        }}
      />

      {/* Red Packet Envelope Opening Interactive Dialog */}
      <RedPacketEnvelopeDialog
        isOpen={!!selectedRedPacket}
        onClose={() => setSelectedRedPacket(null)}
        redPacket={selectedRedPacket}
        onClaim={handleClaimRedPacket}
      />

      {/* Video Call Simulation Modal */}
      <VideoCallModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        grandmaName={channel.name}
        grandmaAvatar={channel.avatarUrl}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};
