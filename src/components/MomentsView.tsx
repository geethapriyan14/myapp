import React, { useState } from 'react';
import { Moment, UserProfile, SupportedLanguage } from '../types';
import { MOMENTS_COVER_PHOTO, SAMPLE_MOMENT_IMAGES } from '../data/mockData';
import { PostMomentModal } from './PostMomentModal';
import { playChime } from '../utils/soundEffects';

interface MomentsViewProps {
  moments: Moment[];
  profile: UserProfile;
  currentLanguage: SupportedLanguage;
  onAddMoment: (moment: Moment) => void;
  onLikeMoment: (momentId: string, isLiked: boolean) => void;
  onAddComment: (momentId: string, text: string) => void;
  onDeleteMoment: (momentId: string) => void;
  onBackToChat: () => void;
  onOpenProfile: () => void;
}

export const MomentsView: React.FC<MomentsViewProps> = ({
  moments,
  profile,
  currentLanguage,
  onAddMoment,
  onLikeMoment,
  onAddComment,
  onDeleteMoment,
  onBackToChat,
  onOpenProfile,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'my'>('all');
  const [coverPhoto, setCoverPhoto] = useState<string>(MOMENTS_COVER_PHOTO);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [activeCommentBoxId, setActiveCommentBoxId] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [translatedMap, setTranslatedMap] = useState<Record<string, boolean>>({});

  // Cover photo presets
  const COVER_PRESETS = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80', // Mountain landscape
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80', // Starry night
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80', // Sunset sea
    'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=1200&auto=format&fit=crop&q=80', // Forest misty
  ];

  const handleCycleCover = () => {
    playChime('tap');
    const currentIndex = COVER_PRESETS.indexOf(coverPhoto);
    const nextIndex = (currentIndex + 1) % COVER_PRESETS.length;
    setCoverPhoto(COVER_PRESETS[nextIndex]);
  };

  const handleToggleLike = (moment: Moment) => {
    playChime('coin');
    const isCurrentlyLiked = moment.likes.some((l) => l.userId === 'user');
    onLikeMoment(moment.id, !isCurrentlyLiked);
    setActiveActionMenuId(null);
  };

  const handleOpenComment = (momentId: string) => {
    playChime('tap');
    setActiveCommentBoxId(momentId);
    setActiveActionMenuId(null);
  };

  const handleSendComment = (momentId: string) => {
    if (!commentInputText.trim()) return;
    playChime('success');
    onAddComment(momentId, commentInputText.trim());
    setCommentInputText('');
    setActiveCommentBoxId(null);
  };

  const handleToggleTranslation = (momentId: string) => {
    playChime('tap');
    setTranslatedMap((prev) => ({
      ...prev,
      [momentId]: !prev[momentId],
    }));
  };

  const filteredMoments =
    filterTab === 'my'
      ? moments.filter((m) => m.authorId === 'user')
      : moments;

  return (
    <div className="w-full max-w-3xl mx-auto bg-[var(--app-surface)] text-[var(--app-text)] min-h-[calc(100vh-5rem)] rounded-3xl border border-[var(--app-border)] shadow-xs overflow-hidden flex flex-col mb-12">
      {/* 1. WeChat Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[var(--app-surface)]/90 backdrop-blur-md px-4 py-3 border-b border-[var(--app-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToChat}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors active:scale-95"
            title="Back to Chat"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-base sm:text-lg text-[var(--app-text)]">
              Moments
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              朋友圈
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-[var(--app-surface-subtle)] p-0.5 rounded-full border border-[var(--app-border)] text-xs">
            <button
              type="button"
              onClick={() => {
                setFilterTab('all');
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                filterTab === 'all'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Friends
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterTab('my');
                playChime('tap');
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                filterTab === 'my'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              My Album
            </button>
          </div>

          {/* Camera Button to Post Moment (Classic WeChat Top Right Camera) */}
          <button
            type="button"
            onClick={() => {
              setIsPostModalOpen(true);
              playChime('tap');
            }}
            className="w-9 h-9 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all active:scale-95 shadow-2xs"
            title="Post a Moment (发布朋友圈)"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          </button>
        </div>
      </div>

      {/* 2. Iconic WeChat Cover Photo Banner with Overlapping Avatar */}
      <div className="relative w-full">
        {/* Cinematic Cover Photo */}
        <div className="relative w-full h-56 sm:h-72 bg-slate-900 overflow-hidden group">
          <img
            src={coverPhoto}
            alt="Moments Cover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Tap to change cover prompt */}
          <button
            type="button"
            onClick={handleCycleCover}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity border border-white/20"
            title="Change Cover Banner"
          >
            <span className="material-symbols-outlined text-[14px]">wallpaper</span>
            <span className="hidden sm:inline">Change Cover</span>
          </button>

          {/* User Name & Status on cover */}
          <div className="absolute bottom-4 right-28 sm:right-36 text-right z-10">
            <h3 className="text-lg sm:text-2xl font-bold text-white drop-shadow-md tracking-tight">
              {profile.name}
            </h3>
            <p className="text-xs text-white/80 drop-shadow-sm font-medium">
              {profile.role || 'Member'} · {profile.status || 'Active now'}
            </p>
          </div>
        </div>

        {/* WeChat Avatar overlapping bottom-right corner */}
        <div
          onClick={onOpenProfile}
          className="absolute -bottom-8 right-6 sm:right-10 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-[var(--app-surface)] shadow-xl cursor-pointer hover:scale-105 transition-transform z-20"
          title="View Profile"
        >
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-full h-full object-cover rounded-xl border border-[var(--app-border)]"
          />
        </div>
      </div>

      {/* Spacer below overlapping avatar */}
      <div className="h-10 sm:h-12 w-full" />

      {/* 3. Moments Feed List */}
      <div className="p-4 sm:p-6 space-y-8 flex-1">
        {filteredMoments.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[32px]">photo_library</span>
            </div>
            <h4 className="font-bold text-base text-[var(--app-text)]">No moments shared yet</h4>
            <p className="text-xs text-[var(--app-text-muted)] max-w-xs mx-auto mt-1 mb-4">
              {filterTab === 'my'
                ? "You haven't posted any moments yet. Capture photos or thoughts to start your album."
                : 'Be the first to share a moment with friends!'}
            </p>
            <button
              type="button"
              onClick={() => setIsPostModalOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[var(--color-primary)] shadow-xs hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
              <span>Post a Moment (发布)</span>
            </button>
          </div>
        ) : (
          filteredMoments.map((moment) => {
            const isLiked = moment.likes.some((l) => l.userId === 'user');
            const isMenuOpen = activeActionMenuId === moment.id;
            const isCommentBoxOpen = activeCommentBoxId === moment.id;
            const isTranslated = !!translatedMap[moment.id];

            return (
              <article
                key={moment.id}
                className="flex items-start gap-3 sm:gap-4 pb-6 border-b border-[var(--app-border)]/60 last:border-b-0 animate-fade-in"
              >
                {/* Author Avatar (Classic WeChat square with slight roundness) */}
                <div className="shrink-0">
                  <img
                    src={moment.authorAvatar}
                    alt={moment.authorName}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-[var(--app-border)] shadow-2xs"
                  />
                </div>

                {/* Main Moment Body */}
                <div className="flex-1 min-w-0">
                  {/* Author Name in iconic WeChat Indigo */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-indigo-600 dark:text-indigo-400 tracking-tight hover:underline cursor-pointer">
                        {moment.authorName}
                      </span>
                      {moment.authorRole && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                          {moment.authorRole}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Caption / Content */}
                  <p className="text-sm text-[var(--app-text)] whitespace-pre-line leading-relaxed mb-2.5">
                    {moment.content}
                  </p>

                  {/* Translation Feature */}
                  {moment.translation && (
                    <div className="mb-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleTranslation(moment.id)}
                        className="text-xs text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">g_translate</span>
                        <span>{isTranslated ? 'Hide translation' : 'See translation'}</span>
                      </button>
                      {isTranslated && (
                        <div className="mt-1.5 p-2.5 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs text-[var(--app-text)] italic">
                          {moment.translation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Media Grid */}
                  {moment.images && moment.images.length > 0 && (
                    <div className="mb-3">
                      {moment.images.length === 1 ? (
                        <div
                          onClick={() => setLightboxImage(moment.images[0])}
                          className="max-w-md max-h-72 rounded-2xl overflow-hidden cursor-pointer border border-[var(--app-border)] hover:opacity-95 transition-opacity"
                        >
                          <img
                            src={moment.images[0]}
                            alt="Moment media"
                            className="w-full h-full object-cover max-h-72"
                          />
                        </div>
                      ) : (
                        <div
                          className={`grid gap-1.5 max-w-md ${
                            moment.images.length === 2 || moment.images.length === 4
                              ? 'grid-cols-2'
                              : 'grid-cols-3'
                          }`}
                        >
                          {moment.images.map((img, i) => (
                            <div
                              key={i}
                              onClick={() => setLightboxImage(img)}
                              className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-[var(--app-border)] hover:opacity-95 transition-opacity"
                            >
                              <img
                                src={img}
                                alt={`Moment ${i}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location Tag */}
                  {moment.location && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-500/90 dark:text-indigo-400 mb-2">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      <span>{moment.location}</span>
                    </div>
                  )}

                  {/* Bottom Meta Row: Timestamp, Delete, and Iconic WeChat •• Action Pill */}
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)]">
                      <span>{moment.time}</span>
                      {moment.authorId === 'user' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this moment?')) {
                              onDeleteMoment(moment.id);
                              playChime('tap');
                            }
                          }}
                          className="text-xs text-rose-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* WeChat •• Capsule Button & Sliding Action Menu */}
                    <div className="relative">
                      {/* Sliding Action Pill Menu */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-9 top-1/2 -translate-y-1/2 z-20 flex items-center bg-zinc-800 text-white rounded-lg py-1 px-1.5 shadow-xl border border-zinc-700 animate-scale-up"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleLike(moment)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-zinc-700 text-xs font-semibold active:scale-95 transition-all text-white"
                          >
                            <span className={`material-symbols-outlined text-[16px] ${isLiked ? 'text-rose-500' : 'text-white'}`}>
                              favorite
                            </span>
                            <span>{isLiked ? 'Liked' : 'Like (赞)'}</span>
                          </button>
                          <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
                          <button
                            type="button"
                            onClick={() => handleOpenComment(moment.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-zinc-700 text-xs font-semibold active:scale-95 transition-all text-white"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            <span>Comment (评论)</span>
                          </button>
                        </div>
                      )}

                      {/* The •• Button */}
                      <button
                        type="button"
                        onClick={() => {
                          playChime('tap');
                          setActiveActionMenuId(isMenuOpen ? null : moment.id);
                        }}
                        className={`w-8 h-6 rounded-md flex items-center justify-center transition-all ${
                          isMenuOpen
                            ? 'bg-zinc-800 text-white'
                            : 'bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                        }`}
                        title="Like or Comment"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Comment Input (Appears when Comment is clicked) */}
                  {isCommentBoxOpen && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] animate-fade-in">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Write a comment... / 评论..."
                        value={commentInputText}
                        onChange={(e) => setCommentInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendComment(moment.id);
                        }}
                        className="flex-1 bg-transparent border-none text-xs text-[var(--app-text)] focus:outline-none placeholder:text-[var(--app-text-muted)] px-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendComment(moment.id)}
                        disabled={!commentInputText.trim()}
                        className="px-3 py-1 rounded-full text-xs font-bold text-white bg-[var(--color-primary)] disabled:opacity-40 active:scale-95 transition-all shadow-2xs"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCommentBoxId(null)}
                        className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  )}

                  {/* WeChat Likes & Comments Bubble Container */}
                  {(moment.likes.length > 0 || moment.comments.length > 0) && (
                    <div className="relative mt-3 rounded-xl bg-[var(--app-surface-subtle)] p-3 text-xs space-y-2 border border-[var(--app-border)]/50">
                      {/* Triangle Pointer Tip (Authentic WeChat detail) */}
                      <div className="absolute -top-1.5 left-4 w-3 h-3 rotate-45 bg-[var(--app-surface-subtle)] border-t border-l border-[var(--app-border)]/50" />

                      {/* Likes row */}
                      {moment.likes.length > 0 && (
                        <div className="flex items-start gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold leading-relaxed">
                          <span className="material-symbols-outlined text-[15px] text-rose-500 shrink-0 mt-0.5">
                            favorite
                          </span>
                          <span className="flex-1">
                            {moment.likes.map((l) => l.userName).join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Separator if both likes & comments exist */}
                      {moment.likes.length > 0 && moment.comments.length > 0 && (
                        <div className="border-t border-[var(--app-border)]/40" />
                      )}

                      {/* Comments list */}
                      {moment.comments.length > 0 && (
                        <div className="space-y-1.5">
                          {moment.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="leading-relaxed text-[var(--app-text)] group"
                            >
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                                {comment.authorName}
                              </span>
                              {comment.replyToName && (
                                <span className="text-[var(--app-text-muted)] mx-1">
                                  reply to{' '}
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {comment.replyToName}
                                  </span>
                                </span>
                              )}
                              <span className="font-normal text-[var(--app-text)]">
                                : {comment.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 4. Lightbox Photo Viewer Modal */}
      {lightboxImage && (
        <div
          id="moments-lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* 5. Post a Moment Modal */}
      <PostMomentModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        profile={profile}
        onAddMoment={onAddMoment}
      />
    </div>
  );
};
