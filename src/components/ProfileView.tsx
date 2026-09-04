import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, AvatarFrameType, SupportedLanguage, Moment } from '../types';
import { ASSETS, SAMPLE_MOMENT_IMAGES } from '../data/mockData';
import { t, LANGUAGE_OPTIONS } from '../i18n/translations';
import { playChime, speakVoice } from '../utils/soundEffects';
import { QrCodeModal } from './QrCodeModal';
import { PostMomentModal } from './PostMomentModal';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToChat: () => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  moments?: Moment[];
  onNavigateToMoments?: () => void;
  onAddMoment?: (moment: Moment) => void;
}

const DEFAULT_ROLES: Record<SupportedLanguage, string[]> = {
  en: ['Grandma', 'Mom', 'Big Sister', 'Auntie'],
  'zh-HK': ['外婆', '媽媽', '大姐', '姑姑'],
  'zh-CN': ['外婆', '妈妈', '大姐', '姑姑'],
  es: ['Abuela', 'Mamá', 'Hermana mayor', 'Tía'],
  ja: ['おばあちゃん', 'お母さん', 'お姉さん', '叔母さん'],
  ko: ['할머니', '어머니', '큰언니/누나', '이모/고모'],
  fr: ['Grand-mère', 'Maman', 'Grande sœur', 'Tante'],
  vi: ['Bà Ngoại', 'Mẹ', 'Chị Cả', 'Dì/Cô'],
};

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onBackToChat,
  currentLanguage,
  onLanguageChange,
  moments = [],
  onNavigateToMoments,
  onAddMoment,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [showToast, setShowToast] = useState(false);
  const [isPlayingAudioName, setIsPlayingAudioName] = useState(false);
  const [isRecordingPronunciation, setIsRecordingPronunciation] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isPostMomentModalOpen, setIsPostMomentModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showCustomRolePrompt, setShowCustomRolePrompt] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [availableRoles, setAvailableRoles] = useState<string[]>(
    DEFAULT_ROLES[currentLanguage] || DEFAULT_ROLES.en
  );

  useEffect(() => {
    setAvailableRoles(DEFAULT_ROLES[currentLanguage] || DEFAULT_ROLES.en);
  }, [currentLanguage]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // User moments & photos for WeChat-style Moments preview
  const userMoments = moments.filter((m) => m.authorId === 'user');
  const userPhotos = userMoments.flatMap((m) => m.images);
  const previewPhotos =
    userPhotos.length > 0 ? userPhotos.slice(0, 4) : SAMPLE_MOMENT_IMAGES.slice(0, 4);

  // Trigger Save Feedback
  const handleSave = () => {
    onUpdateProfile(formData);
    playChime('success');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  // Avatar Frame change
  const handleFrameSelect = (frame: AvatarFrameType) => {
    setFormData((prev) => ({ ...prev, avatarFrame: frame }));
    playChime('tap');
  };

  // Play audio pronunciation of Grandma's name
  const handlePlayAudioName = () => {
    if (isPlayingAudioName) {
      setIsPlayingAudioName(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsPlayingAudioName(true);
      speakVoice(t('grandmaName', currentLanguage), currentLanguage, () => {
        setIsPlayingAudioName(false);
      });
    }
  };

  // Redo pronunciation simulation
  const handleRedoPronunciation = () => {
    setIsRecordingPronunciation(true);
    playChime('tap');
    setTimeout(() => {
      setIsRecordingPronunciation(false);
      playChime('bell');
      setFormData((prev) => ({
        ...prev,
        audioPronunciation: {
          ...prev.audioPronunciation,
          duration: '0:03 recorded',
        },
      }));
    }, 2500);
  };

  // Prepend emoji to status
  const handlePrependEmoji = (emoji: string) => {
    setFormData((prev) => ({
      ...prev,
      status: `${emoji} ${prev.status}`,
    }));
    playChime('tap');
  };

  // Copy ID
  const handleCopyId = () => {
    navigator.clipboard?.writeText(formData.togetherId);
    setCopiedId(true);
    playChime('tap');
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Add custom role
  const handleAddCustomRole = () => {
    if (customRoleInput.trim()) {
      const newRole = customRoleInput.trim();
      setAvailableRoles((prev) => [...prev, newRole]);
      setFormData((prev) => ({ ...prev, role: newRole }));
      setCustomRoleInput('');
      setShowCustomRolePrompt(false);
      playChime('tap');
    }
  };

  // Avatar ring styling based on frame
  const getRingStyle = () => {
    switch (formData.avatarFrame) {
      case 'birthday':
        return 'p-1.5 rounded-full transition-all duration-300 bg-secondary-container/30 ring-2 ring-secondary-container/50';
      case 'heart':
        return 'p-1.5 rounded-full transition-all duration-300 bg-tertiary-container/30 ring-2 ring-tertiary-container/50';
      case 'emerald':
        return 'p-1.5 rounded-full transition-all duration-300 bg-primary-fixed ring-2 ring-primary';
      case 'clean':
      default:
        return 'p-1.5 rounded-full transition-all duration-300 bg-transparent';
    }
  };

  const getFloatingBadge = () => {
    switch (formData.avatarFrame) {
      case 'birthday':
        return '🎂';
      case 'heart':
        return '❤️';
      case 'emerald':
        return '🌿';
      case 'clean':
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-surface min-h-[calc(100vh-4rem)] relative pt-2 pb-24 px-4 sm:px-6 animate-fade-in">
      {/* Interactive Toast Notification */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ${
          showToast ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
        <span>{t('profileSavedToast', currentLanguage)}</span>
      </div>

      {/* Top Action & Status Indicator */}
      <div className="w-full pt-1 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider">
            {t('syncActive', currentLanguage)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToChat}
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            {t('chat', currentLanguage)}
          </button>
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>{t('saveProfile', currentLanguage)}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5 w-full">
        {/* Section 1: Avatar Customization & Frames */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs flex flex-col items-center text-center border border-outline-variant/15">
          {/* Avatar Display with Dynamic Ring */}
          <div className="relative mb-3">
            <div className={getRingStyle()}>
              <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md bg-surface-container">
                <img
                  alt={formData.name}
                  className="w-full h-full object-cover"
                  src={formData.avatarUrl}
                />
              </div>
            </div>

            {/* Camera overlay trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change Photo"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container active:scale-90 transition-transform"
              title="Upload New Photo"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </button>

            {/* Decorative Crown / Floating status sticker badge */}
            {getFloatingBadge() && (
              <div className="absolute -top-2.5 -right-1.5 bg-surface-container-lowest text-secondary px-2 py-0.5 rounded-full text-base shadow-xs flex items-center justify-center border border-outline-variant/20">
                {getFloatingBadge()}
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = () => {
                  setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
                  playChime('success');
                };
                reader.readAsDataURL(e.target.files[0]);
              }
            }}
          />

          {/* User Title & Quick Identity Hint */}
          <h2 className="text-xl font-bold text-on-surface">{formData.name}</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {t('grandmaRole', currentLanguage)} · {formData.titleDesc}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors active:scale-95 border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">add_a_photo</span>
              <span>{t('album', currentLanguage)}</span>
            </button>
            <button
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  avatarUrl:
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                }));
                playChime('tap');
              }}
              className="bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors active:scale-95 border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">face_6</span>
              <span>{t('aiPortrait', currentLanguage)}</span>
            </button>
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, avatarUrl: ASSETS.grandmaAvatar }));
                playChime('tap');
              }}
              className="bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors active:scale-95 border border-outline-variant/15"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">sentiment_satisfied</span>
              <span>{t('sticker', currentLanguage)}</span>
            </button>
          </div>

          {/* Avatar Frame / Ring Selector */}
          <div className="w-full mt-5 pt-3.5 bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-on-surface-variant">
                {t('avatarFrameTitle', currentLanguage)}
              </span>
              <span className="text-xs text-primary font-semibold">{t('stylesCount', currentLanguage)}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'birthday' as AvatarFrameType, icon: '🎂', label: t('frameBirthday', currentLanguage) },
                { id: 'heart' as AvatarFrameType, icon: '❤️', label: t('frameHeart', currentLanguage) },
                { id: 'emerald' as AvatarFrameType, icon: '🌿', label: t('frameEmerald', currentLanguage) },
                { id: 'clean' as AvatarFrameType, icon: '⚪', label: t('frameClean', currentLanguage) },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleFrameSelect(opt.id)}
                  className={`p-2 rounded-xl flex flex-col items-center transition-all active:scale-95 border ${
                    formData.avatarFrame === opt.id
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs border-primary/30 font-semibold'
                      : 'bg-transparent text-on-surface-variant border-transparent hover:bg-surface-container-lowest'
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <span className="text-[11px] mt-1 truncate w-full text-center">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* WeChat-Style Moments Bar (朋友圈入口栏) */}
        <section
          id="profile-moments-bar"
          onClick={() => {
            playChime('tap');
            if (onNavigateToMoments) onNavigateToMoments();
          }}
          className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer group flex flex-col gap-3"
        >
          {/* Top Bar Row: Icon, Title, Subtitle, and Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Colorful WeChat Moments Aperture Camera Icon */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">photo_camera</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-on-surface tracking-tight">Moments</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    朋友圈
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant truncate">
                  {userMoments.length > 0
                    ? `${userMoments.length} posts shared · View Album & Feed`
                    : 'Share photos, stories & daily updates with friends'}
                </p>
              </div>
            </div>

            {/* Quick Actions: + Post and Chevron */}
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  setIsPostMomentModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-2xs flex items-center gap-1"
                title="Post a New Moment"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Post</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playChime('tap');
                  if (onNavigateToMoments) onNavigateToMoments();
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface group-hover:translate-x-0.5 transition-transform"
                title="Open Moments Feed"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Photo Preview Strip (Recent shared photos) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
            {previewPhotos.map((photoUrl, idx) => (
              <div
                key={idx}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-outline-variant/20 shadow-2xs group-hover:opacity-95 transition-opacity"
              >
                <img
                  src={photoUrl}
                  alt={`Moment preview ${idx}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/50 flex flex-col items-center justify-center text-outline shrink-0 group-hover:border-primary/50 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              <span className="text-[9px] font-semibold mt-0.5">Album</span>
            </div>
          </div>
        </section>

        {/* Section 2: Core Profile Information Fields */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
            <h3 className="text-base font-bold text-on-surface">{t('familyIdentity', currentLanguage)}</h3>
          </div>

          {/* Field: Name */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface-variant" htmlFor="inputName">
                {t('name', currentLanguage)}
              </label>
              <span className="text-xs text-outline">{formData.name.length}/20</span>
            </div>
            <div className="relative flex items-center bg-surface-container-low rounded-xl px-3.5 py-2.5 focus-within:bg-surface-container-lowest shadow-inner border border-transparent focus-within:border-primary/40 transition-all">
              <input
                id="inputName"
                maxLength={20}
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
              />
              {formData.name && (
                <button
                  onClick={() => setFormData({ ...formData, name: '' })}
                  className="text-outline hover:text-on-surface active:scale-90 p-1"
                  title="Clear name"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>
          </div>

          {/* Field: Together ID */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-on-surface-variant">{t('togetherId', currentLanguage)}</span>
            <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-3.5 py-2.5 border border-outline-variant/10">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-outline text-[20px]">fingerprint</span>
                <span className="text-xs sm:text-sm text-on-surface font-medium truncate font-mono">
                  {formData.togetherId}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCopyId}
                  className="w-9 h-9 rounded-full hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors active:scale-90"
                  title="Copy ID"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copiedId ? 'done' : 'content_copy'}
                  </span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-colors active:scale-90 hover:bg-primary/20"
                  title="Family QR Code"
                >
                  <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                </button>
              </div>
            </div>
          </div>

          {/* Field: Family Role Tag */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">{t('familyRole', currentLanguage)}</span>
              <span className="text-[11px] text-primary font-medium">{t('roleHint', currentLanguage)}</span>
            </div>
            {/* Tag Chips */}
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((r) => {
                const isActive = formData.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setFormData({ ...formData, role: r });
                      playChime('tap');
                    }}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-all border ${
                      isActive
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface border-transparent hover:bg-surface-container'
                    }`}
                  >
                    <span>{r}</span>
                    {isActive && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                );
              })}
              <button
                onClick={() => setShowCustomRolePrompt(!showCustomRolePrompt)}
                className="bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-secondary-fixed-dim active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{t('customRole', currentLanguage)}</span>
              </button>
            </div>

            {/* Custom role input prompt */}
            {showCustomRolePrompt && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  placeholder={t('customRolePlaceholder', currentLanguage)}
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  className="flex-1 bg-surface-container-low rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleAddCustomRole}
                  className="bg-primary text-on-primary px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  {t('addRole', currentLanguage)}
                </button>
              </div>
            )}
          </div>

          {/* Field: Status Signature */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">{t('dailyMood', currentLanguage)}</span>
              <span className="text-[11px] text-secondary font-semibold">{t('syncedBadge', currentLanguage)}</span>
            </div>
            <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2 border border-outline-variant/10">
              <div className="flex items-start gap-2.5">
                <span className="text-2xl mt-0.5">🎂</span>
                <textarea
                  rows={2}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  placeholder={t('statusPlaceholder', currentLanguage)}
                  className="w-full bg-transparent text-xs sm:text-sm text-on-surface outline-none resize-none placeholder:text-outline"
                />
              </div>
              {/* Quick Emoji Shortcuts */}
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/15">
                <div className="flex items-center gap-3 text-lg">
                  {['🌸', '🍵', '🧶', '👵', '☀️'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handlePrependEmoji(em)}
                      className="hover:scale-125 transition-transform active:scale-95"
                      title={`Prepend ${em}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-outline">{t('tapToPrepend', currentLanguage)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Universal Multi-Language & Voice Care */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">record_voice_over</span>
            <h3 className="text-base font-bold text-on-surface">{t('elderCareVoice', currentLanguage)}</h3>
          </div>

          {/* Voice Name Audio Pronunciation */}
          <div className="bg-secondary-fixed/30 rounded-xl p-4 flex flex-col gap-2 border border-secondary/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">hearing</span>
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  {t('audioPronunciation', currentLanguage)}
                </span>
              </div>
              <span className="bg-surface-container-lowest text-secondary text-[11px] px-2 py-0.5 rounded-full font-bold shadow-xs">
                {LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage)?.name || 'English'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {t('audioPronunciationDesc', currentLanguage)}
            </p>

            {/* Audio Player Pill Component */}
            <div className="flex items-center justify-between bg-surface-container-lowest rounded-full px-3.5 py-2 mt-1 shadow-xs border border-outline-variant/15">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handlePlayAudioName}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform shadow-xs hover:bg-primary-container"
                  title="Play pronunciation"
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isPlayingAudioName ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-on-surface font-semibold">
                    {t('grandmaName', currentLanguage)}
                  </span>
                  <span className="text-[11px] text-primary font-medium">
                    {formData.audioPronunciation.duration}
                  </span>
                </div>
              </div>

              {/* Mini Waveform Graphic */}
              <div className="flex items-center gap-0.5 h-6 px-1">
                {[3, 5, 2, 6, 4, 3].map((val, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isPlayingAudioName ? 'bg-primary animate-pulse' : 'bg-primary/40'
                    }`}
                    style={{ height: `${val * 3}px` }}
                  />
                ))}
              </div>

              <button
                onClick={handleRedoPronunciation}
                className="text-on-surface-variant hover:text-primary active:scale-95 text-xs font-semibold flex items-center gap-1 pl-1"
                title="Re-record pronunciation"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isRecordingPronunciation ? 'fiber_manual_record' : 'mic'}
                </span>
                <span>{isRecordingPronunciation ? t('recordingState', currentLanguage) : t('redo', currentLanguage)}</span>
              </button>
            </div>
          </div>

          {/* Native Language Selector Option */}
          <div className="flex items-center justify-between py-1 px-1">
            <div className="flex flex-col min-w-0 pr-3">
              <span className="text-xs sm:text-sm font-semibold text-on-surface">
                {t('preferredLanguage', currentLanguage)}
              </span>
              <span className="text-xs text-on-surface-variant">
                {t('preferredLanguageDesc', currentLanguage)}
              </span>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => {
                const newLang = e.target.value as SupportedLanguage;
                onLanguageChange(newLang);
                playChime('tap');
              }}
              className="bg-surface-container-low text-xs sm:text-sm text-on-surface font-semibold px-3 py-1.5 rounded-full border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.flag} {opt.nativeLabel} ({opt.name})
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Section 4: Privacy & Family Circle Visibility */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs flex flex-col gap-4 border border-outline-variant/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">family_restroom</span>
            <h3 className="text-base font-bold text-on-surface">{t('familyPrivacy', currentLanguage)}</h3>
          </div>

          {/* Toggle 1: Family Tree */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col pr-3">
              <span className="text-xs sm:text-sm font-semibold text-on-surface">
                {t('displayInTree', currentLanguage)}
              </span>
              <span className="text-xs text-on-surface-variant">
                {t('displayInTreeDesc', currentLanguage)}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.displayInFamilyTree}
                onChange={(e) => setFormData({ ...formData, displayInFamilyTree: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner" />
            </label>
          </div>

          {/* Toggle 2: Birthday & Age Countdown */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col pr-3">
              <span className="text-xs sm:text-sm font-semibold text-on-surface">
                {t('birthdayCountdown', currentLanguage)}
              </span>
              <span className="text-xs text-on-surface-variant">
                {t('birthdayCountdownDesc', currentLanguage)}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.birthdayCountdown}
                onChange={(e) => setFormData({ ...formData, birthdayCountdown: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner" />
            </label>
          </div>
        </section>

        {/* Bottom Action Pill / Save Full Page */}
        <div className="w-full flex flex-col items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm py-3.5 rounded-full shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>{t('saveAllBtn', currentLanguage)}</span>
          </button>
          <p className="text-[11px] text-outline text-center">
            {t('encryptedFooter', currentLanguage)}
          </p>
        </div>
      </div>

      {/* QR Modal */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        togetherId={formData.togetherId}
        name={formData.name}
        currentLanguage={currentLanguage}
      />

      {/* Post Moment Modal */}
      <PostMomentModal
        isOpen={isPostMomentModalOpen}
        onClose={() => setIsPostMomentModalOpen(false)}
        profile={formData}
        onAddMoment={(newM) => {
          if (onAddMoment) {
            onAddMoment(newM);
          }
          setIsPostMomentModalOpen(false);
          if (onNavigateToMoments) {
            onNavigateToMoments();
          }
        }}
      />
    </div>
  );
};

