import React, { useState, useRef } from 'react';
import { Moment, UserProfile } from '../types';
import { SAMPLE_MOMENT_IMAGES } from '../data/mockData';
import { playChime } from '../utils/soundEffects';

interface PostMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onAddMoment: (moment: Moment) => void;
}

const LOCATION_PRESETS = [
  'Indiranagar, Bengaluru 🇮🇳',
  'Koramangala, Bengaluru 🇮🇳',
  'Victoria Harbour, Hong Kong 🇭🇰',
  'Mitte, Berlin 🇩🇪',
  'Shinjuku, Tokyo 🇯🇵',
  'Marina Bay, Singapore 🇸🇬',
  'Montmartre, Paris 🇫🇷',
];

export const PostMomentModal: React.FC<PostMomentModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAddMoment,
}) => {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([SAMPLE_MOMENT_IMAGES[0]]);
  const [location, setLocation] = useState('Indiranagar, Bengaluru 🇮🇳');
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [customLocationText, setCustomLocationText] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setSelectedImages((prev) => [...prev, reader.result as string].slice(0, 9));
          playChime('tap');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePresetImage = (url: string) => {
    playChime('tap');
    if (selectedImages.includes(url)) {
      setSelectedImages((prev) => prev.filter((img) => img !== url));
    } else {
      if (selectedImages.length < 9) {
        setSelectedImages((prev) => [...prev, url]);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    playChime('tap');
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedImages.length === 0) return;

    playChime('success');

    const finalLocation = isCustomLocation ? customLocationText.trim() : location;

    const newMoment: Moment = {
      id: `moment-${Date.now()}`,
      authorId: 'user',
      authorName: profile.name,
      authorAvatar: profile.avatarUrl,
      authorRole: profile.role || 'Member',
      content: content.trim(),
      images: selectedImages,
      location: finalLocation || undefined,
      time: 'Just now',
      timestamp: Date.now(),
      likes: [],
      comments: [],
      privacy,
    };

    onAddMoment(newMoment);
    setContent('');
    setSelectedImages([SAMPLE_MOMENT_IMAGES[0]]);
    onClose();
  };

  return (
    <div
      id="post-moment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="post-moment-modal"
        className="w-full max-w-lg bg-[var(--app-surface)] text-[var(--app-text)] rounded-3xl shadow-2xl border border-[var(--app-border)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--app-border)] flex items-center justify-between bg-[var(--app-surface-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--app-text)]">New Moment</h3>
              <p className="text-[11px] text-[var(--app-text-muted)]">Share life, photos & thoughts with friends</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* User Info Bar */}
          <div className="flex items-center gap-3">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-10 h-10 rounded-xl object-cover border border-[var(--app-border)]"
            />
            <div className="flex-1">
              <div className="font-semibold text-sm text-[var(--app-text)]">{profile.name}</div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--app-text-muted)]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">public</span>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="bg-transparent border-none text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer focus:outline-none"
                  >
                    <option value="public" className="bg-[var(--app-surface)] text-[var(--app-text)]">
                      Public · Anyone
                    </option>
                    <option value="friends" className="bg-[var(--app-surface)] text-[var(--app-text)]">
                      Friends · All Contacts
                    </option>
                    <option value="private" className="bg-[var(--app-surface)] text-[var(--app-text)]">
                      Only Me · Private
                    </option>
                  </select>
                </span>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening? Share moments, thoughts, or what you're working on... / 这一刻的想法..."
              rows={4}
              maxLength={600}
              className="w-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] rounded-2xl p-3.5 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all resize-none"
            />
            <div className="text-right text-[11px] text-[var(--app-text-muted)] mt-1">
              {content.length}/600
            </div>
          </div>

          {/* Selected Photos Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                Photos ({selectedImages.length}/9)
              </label>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>{showPresets ? 'Hide Presets' : 'Choose Samples'}</span>
              </button>
            </div>

            {/* Photo preset gallery drawer */}
            {showPresets && (
              <div className="p-3 mb-3 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)]">
                <p className="text-xs text-[var(--app-text-muted)] mb-2">
                  Tap to add sample travel, cafe, workspace & nature photos:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SAMPLE_MOMENT_IMAGES.map((url, i) => {
                    const isSelected = selectedImages.includes(url);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleTogglePresetImage(url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                          isSelected ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/40' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Sample ${i}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Selected Images */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {selectedImages.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[var(--app-border)] shadow-2xs">
                  <img src={imgUrl} alt={`Selected ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-90 hover:opacity-100 hover:bg-rose-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}

              {selectedImages.length < 9 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-[var(--app-border)] hover:border-[var(--color-primary)] bg-[var(--app-surface-subtle)] hover:bg-[var(--app-surface-hover)] flex flex-col items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--color-primary)] transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
                  <span className="text-[11px] font-semibold mt-1">Upload</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Location Tagging */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-rose-500">location_on</span>
                <span>Location Tag</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomLocation(!isCustomLocation)}
                className="text-[11px] text-[var(--color-primary)] hover:underline"
              >
                {isCustomLocation ? 'Pick Preset' : 'Custom'}
              </button>
            </div>

            {isCustomLocation ? (
              <input
                type="text"
                placeholder="e.g. Indiranagar, Bengaluru or Marina Bay, Singapore"
                value={customLocationText}
                onChange={(e) => setCustomLocationText(e.target.value)}
                className="w-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            ) : (
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                {LOCATION_PRESETS.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--app-surface)] text-[var(--app-text)]">
                    📍 {loc}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--app-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() && selectedImages.length === 0}
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Post Moment (发布)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
