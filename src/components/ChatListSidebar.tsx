import React, { useState } from 'react';
import { ChatChannel, AppSettings } from '../types';
import { playChime } from '../utils/soundEffects';

interface ChatListSidebarProps {
  channels: ChatChannel[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenTranslator?: () => void;
  onOpenMoments?: () => void;
}

export const ChatListSidebar: React.FC<ChatListSidebarProps> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  settings,
  onOpenSettings,
  onOpenTranslator,
  onOpenMoments,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'private' | 'group' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChannels = channels.filter((ch) => {
    if (filterTab === 'private' && ch.type !== 'private') return false;
    if (filterTab === 'group' && ch.type !== 'group') return false;
    if (filterTab === 'unread' && ch.unreadCount === 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ch.name.toLowerCase().includes(q) || ch.lastMessageText.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[var(--app-surface)] border-r border-[var(--app-border)] overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-[var(--app-text)]">
              Messages
            </h1>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              {channels.length}
            </span>
          </div>

          {/* Quick Wallet Pill */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-bold shadow-xs"
            title="Open Together Wallet & UPI Settings"
          >
            <span className="material-symbols-outlined text-[15px]">account_balance_wallet</span>
            <span>₹{settings.walletBalance.toLocaleString('en-IN')}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[var(--app-text-muted)]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats, groups, or messages..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'private', label: 'Private (1-on-1)' },
            { id: 'group', label: 'Groups' },
            { id: 'unread', label: 'Unread' },
          ].map((tab) => {
            const isSelected = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playChime('tap');
                  setFilterTab(tab.id as any);
                }}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs'
                    : 'bg-[var(--app-surface)] text-[var(--app-text-muted)] border-[var(--app-border)] hover:text-[var(--app-text)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--app-border)] no-scrollbar">
        {filteredChannels.length === 0 ? (
          <div className="p-8 text-center text-[var(--app-text-muted)]">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-60">chat_bubble_outline</span>
            <p className="text-xs font-medium">No conversations found</p>
          </div>
        ) : (
          filteredChannels.map((ch) => {
            const isActive = activeChannelId === ch.id;
            const isRedPacket = ch.lastMessageText.includes('🧧') || ch.lastMessageText.toLowerCase().includes('red packet');

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  playChime('tap');
                  onSelectChannel(ch.id);
                }}
                className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary-light)] border-l-4 border-l-[var(--color-primary)]'
                    : 'hover:bg-[var(--app-surface-subtle)]'
                }`}
              >
                {/* Avatar with status indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src={ch.avatarUrl}
                    alt={ch.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-[var(--app-border)] shadow-xs"
                  />
                  {ch.type === 'private' ? (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--app-surface)] ${
                        ch.onlineStatus === 'Online' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                  ) : (
                    <span className="absolute -bottom-1 -right-1 px-1 rounded-md bg-[var(--app-surface)] border border-[var(--app-border)] text-[9px] font-bold text-[var(--app-text-muted)] shadow-2xs">
                      {ch.membersCount || '👥'}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs font-bold truncate ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--app-text)]'}`}>
                        {ch.name}
                      </span>
                      {ch.countryFlag && (
                        <span className="text-[11px] flex-shrink-0">{ch.countryFlag}</span>
                      )}
                      {ch.verified && (
                        <span className="material-symbols-outlined text-[14px] text-blue-500 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--app-text-muted)] flex-shrink-0 font-medium">
                      {ch.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${
                      isRedPacket
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-[var(--app-text-muted)]'
                    }`}>
                      {ch.lastMessageText}
                    </p>

                    {ch.unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-4.5 h-4.5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {ch.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Bar with Moments, Translator & Settings shortcut */}
      <div className="p-2 border-t border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex items-center justify-between gap-1">
        {onOpenMoments && (
          <button
            type="button"
            onClick={onOpenMoments}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-xs font-semibold text-[var(--app-text)] transition-colors"
            title="Moments & Stories (朋友圈)"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-500">photo_camera</span>
            <span className="truncate">Moments</span>
          </button>
        )}

        {onOpenTranslator && (
          <button
            type="button"
            onClick={onOpenTranslator}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-xs font-semibold text-[var(--app-text)] transition-colors"
            title="Live Voice & Text Translator"
          >
            <span className="material-symbols-outlined text-[16px] text-[var(--color-primary)]">
              translate
            </span>
            <span className="truncate">Translator</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-hover)] text-xs font-semibold text-[var(--app-text)] transition-colors shrink-0"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
        </button>
      </div>
    </div>
  );
};
