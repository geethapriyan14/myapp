import React, { useState, useEffect } from 'react';
import {
  ScreenType,
  ChatMessage,
  UserProfile,
  SupportedLanguage,
  DesktopLayoutMode,
  ChatChannel,
  AppSettings,
  WalletTransaction,
  Moment,
} from './types';
import {
  INITIAL_PROFILE,
  INITIAL_CHANNELS,
  INITIAL_CHANNEL_MESSAGES,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_MOMENTS,
} from './data/mockData';
import { Header } from './components/Header';
import { ChatListSidebar } from './components/ChatListSidebar';
import { ConversationView } from './components/ConversationView';
import { ProfileView } from './components/ProfileView';
import { TranslatorStudio } from './components/TranslatorStudio';
import { MomentsView } from './components/MomentsView';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportApkModal } from './components/ExportApkModal';
import { playChime } from './utils/soundEffects';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('conversation');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [desktopLayout, setDesktopLayout] = useState<DesktopLayoutMode>('dual');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportApkOpen, setIsExportApkOpen] = useState(false);

  // Channels and active channel
  const [channels, setChannels] = useState<ChatChannel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('aarav');

  // Channel Messages dictionary
  const [channelMessages, setChannelMessages] = useState<Record<string, ChatMessage[]>>(
    INITIAL_CHANNEL_MESSAGES
  );

  // Profile, Settings, and Wallet Transactions
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);

  // WeChat-Style Moments Timeline State
  const [moments, setMoments] = useState<Moment[]>(INITIAL_MOMENTS);

  // Mobile navigation state: 'sidebar' | 'conversation'
  const [mobilePane, setMobilePane] = useState<'sidebar' | 'conversation'>('sidebar');

  // Apply Theme & Accent Color to document root dynamically
  useEffect(() => {
    const isDark =
      settings.themeMode === 'dark' ||
      (settings.themeMode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    document.documentElement.setAttribute('data-accent', settings.accentColor);
  }, [settings.themeMode, settings.accentColor]);

  const activeChannel =
    channels.find((ch) => ch.id === activeChannelId) || channels[0];
  const activeMessages = channelMessages[activeChannelId] || [];

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setMobilePane('conversation');

    // Mark unread as 0
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = (newMsg: ChatMessage) => {
    setChannelMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg],
    }));

    // Update snippet in channels list
    let snippet = newMsg.text || 'Voice message';
    if (newMsg.type === 'red_packet' && newMsg.redPacket) {
      snippet = `🧧 Red Packet sent: ${newMsg.redPacket.currencySymbol}${newMsg.redPacket.amount} (${newMsg.redPacket.paymentMethod.toUpperCase()})`;
    }

    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? {
              ...c,
              lastMessageText: snippet,
              lastMessageTime: newMsg.time,
            }
          : c
      )
    );
  };

  const handleClaimRedPacket = (packetId: string, claimedAmount: string) => {
    const amountNum = parseFloat(claimedAmount) || 0;

    // 1. Credit Together Wallet
    setSettings((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + amountNum,
    }));

    // 2. Add Transaction Record
    const newTx: WalletTransaction = {
      id: `tx-claim-${Date.now()}`,
      type: 'credit',
      title: `Claimed Red Packet (${activeChannel.name})`,
      amount: amountNum,
      currency: settings.defaultCurrency,
      symbol: settings.defaultCurrency === 'INR' ? '₹' : '$',
      method: 'wallet',
      time: 'Just now',
      status: 'completed',
      channelOrPeer: activeChannel.name,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Update red packet status in chat messages
    setChannelMessages((prev) => {
      const currentList = prev[activeChannelId] || [];
      const updatedList = currentList.map((m) => {
        if (m.type === 'red_packet' && m.redPacket && m.redPacket.id === packetId) {
          return {
            ...m,
            redPacket: {
              ...m.redPacket,
              isOpened: true,
              claimedCount: m.redPacket.claimedCount + 1,
              claims: [
                ...(m.redPacket.claims || []),
                {
                  name: profile.name,
                  avatar: profile.avatarUrl,
                  amount: claimedAmount,
                  time: 'Just now',
                  isLuckyWinner: true,
                },
              ],
            },
          };
        }
        return m;
      });

      return {
        ...prev,
        [activeChannelId]: updatedList,
      };
    });
  };

  const handleUpdateWalletBalance = (amountDelta: number) => {
    setSettings((prev) => ({
      ...prev,
      walletBalance: Math.max(0, prev.walletBalance + amountDelta),
    }));

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: amountDelta < 0 ? 'debit' : 'credit',
      title:
        amountDelta < 0
          ? `Sent Red Packet to ${activeChannel.name}`
          : 'Wallet Top-up via UPI',
      amount: Math.abs(amountDelta),
      currency: settings.defaultCurrency,
      symbol: settings.defaultCurrency === 'INR' ? '₹' : '$',
      method: 'wallet',
      time: 'Just now',
      status: 'completed',
      channelOrPeer: activeChannel.name,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleAddWalletMoney = (amount: number) => {
    handleUpdateWalletBalance(amount);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.preferredLanguage !== currentLanguage) {
      setCurrentLanguage(newSettings.preferredLanguage);
    }
  };

  // Moments Handlers
  const handleAddMoment = (newMoment: Moment) => {
    setMoments((prev) => [newMoment, ...prev]);
  };

  const handleLikeMoment = (momentId: string, isLiked: boolean) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === momentId) {
          const filteredLikes = m.likes.filter((l) => l.userId !== 'user');
          if (isLiked) {
            return {
              ...m,
              likes: [...filteredLikes, { userId: 'user', userName: profile.name, avatarUrl: profile.avatarUrl }],
            };
          }
          return {
            ...m,
            likes: filteredLikes,
          };
        }
        return m;
      })
    );
  };

  const handleAddComment = (momentId: string, text: string) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === momentId) {
          const newComment = {
            id: `c-${Date.now()}`,
            authorId: 'user',
            authorName: profile.name,
            text,
            time: 'Just now',
          };
          return {
            ...m,
            comments: [...m.comments, newComment],
          };
        }
        return m;
      })
    );
  };

  const handleDeleteMoment = (momentId: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== momentId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--app-bg)] text-[var(--app-text)] antialiased transition-colors">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          playChime('tap');
        }}
        currentLanguage={currentLanguage}
        onOpenLanguageSelector={() => setIsLanguageModalOpen(true)}
        desktopLayout={desktopLayout}
        onDesktopLayoutChange={(mode) => setDesktopLayout(mode)}
        settings={settings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenExportApk={() => setIsExportApkOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-16 flex flex-col w-full">
        {currentScreen === 'conversation' && (
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 flex-1 flex flex-col">
            {/* Desktop / PC View */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 flex-1 items-start h-[calc(100vh-5.5rem)]">
              {/* Col 1: Chat List Sidebar (Channels & Groups) */}
              <div className="lg:col-span-4 xl:col-span-3 h-full rounded-2xl overflow-hidden border border-[var(--app-border)] shadow-xs">
                <ChatListSidebar
                  channels={channels}
                  activeChannelId={activeChannelId}
                  onSelectChannel={handleSelectChannel}
                  settings={settings}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  onOpenTranslator={() => setCurrentScreen('translator')}
                  onOpenMoments={() => setCurrentScreen('moments')}
                />
              </div>

              {/* Col 2: Active Conversation View */}
              <div
                className={`${
                  desktopLayout === 'dual' ? 'lg:col-span-5 xl:col-span-5' : 'lg:col-span-8 xl:col-span-9'
                } h-full flex flex-col`}
              >
                <ConversationView
                  channel={activeChannel}
                  messages={activeMessages}
                  onSendMessage={handleSendMessage}
                  profile={profile}
                  settings={settings}
                  currentLanguage={currentLanguage}
                  onOpenTranslator={() => setCurrentScreen('translator')}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  isDualPane={desktopLayout === 'dual'}
                  onClaimRedPacket={handleClaimRedPacket}
                  onUpdateWalletBalance={handleUpdateWalletBalance}
                />
              </div>

              {/* Col 3: Live Translator Studio (Visible in Dual View on PC) */}
              {desktopLayout === 'dual' && (
                <div className="lg:col-span-3 xl:col-span-4 h-full rounded-2xl overflow-hidden border border-[var(--app-border)] shadow-xs">
                  <TranslatorStudio
                    currentLanguage={currentLanguage}
                    onSendMessage={handleSendMessage}
                    isEmbedded={true}
                  />
                </div>
              )}
            </div>

            {/* Mobile / Tablet View (Responsive single-pane with seamless navigation) */}
            <div className="lg:hidden flex-1 flex flex-col h-[calc(100vh-5.2rem)]">
              {mobilePane === 'sidebar' ? (
                <div className="flex-1 rounded-2xl overflow-hidden border border-[var(--app-border)]">
                  <ChatListSidebar
                    channels={channels}
                    activeChannelId={activeChannelId}
                    onSelectChannel={handleSelectChannel}
                    settings={settings}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                    onOpenTranslator={() => setCurrentScreen('translator')}
                    onOpenMoments={() => setCurrentScreen('moments')}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <ConversationView
                    channel={activeChannel}
                    messages={activeMessages}
                    onSendMessage={handleSendMessage}
                    profile={profile}
                    settings={settings}
                    currentLanguage={currentLanguage}
                    onOpenTranslator={() => setCurrentScreen('translator')}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                    onBackToChannelList={() => setMobilePane('sidebar')}
                    isDualPane={false}
                    onClaimRedPacket={handleClaimRedPacket}
                    onUpdateWalletBalance={handleUpdateWalletBalance}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* WeChat-Style Moments Screen (Feed, Timelines & Albums) */}
        {currentScreen === 'moments' && (
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 lg:px-6 py-3 flex-1 flex flex-col">
            <MomentsView
              moments={moments}
              profile={profile}
              currentLanguage={currentLanguage}
              onAddMoment={handleAddMoment}
              onLikeMoment={handleLikeMoment}
              onAddComment={handleAddComment}
              onDeleteMoment={handleDeleteMoment}
              onBackToChat={() => setCurrentScreen('conversation')}
              onOpenProfile={() => setCurrentScreen('profile')}
            />
          </div>
        )}

        {/* Dedicated Translator Studio Screen (For Mobile or Fullscreen Mode) */}
        {currentScreen === 'translator' && (
          <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-3 flex-1 flex flex-col">
            <TranslatorStudio
              currentLanguage={currentLanguage}
              onSendMessage={handleSendMessage}
              onClose={() => setCurrentScreen('conversation')}
              isEmbedded={false}
            />
          </div>
        )}

        {/* Profile & User Info Screen (With WeChat-style Moments Bar) */}
        {currentScreen === 'profile' && (
          <div className="w-full max-w-2xl mx-auto px-2 sm:px-4 py-2 flex-1 flex flex-col">
            <ProfileView
              profile={profile}
              onUpdateProfile={(u) => setProfile(u)}
              onBackToChat={() => setCurrentScreen('conversation')}
              currentLanguage={currentLanguage}
              onLanguageChange={(l) => setCurrentLanguage(l)}
              moments={moments}
              onNavigateToMoments={() => setCurrentScreen('moments')}
              onAddMoment={handleAddMoment}
            />
          </div>
        )}
      </main>

      {/* Settings Modal (Theme, Accent Colors, Wallpaper, UPI & Together Wallet) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        transactions={transactions}
        onAddWalletMoney={handleAddWalletMoney}
        onOpenExportApk={() => setIsExportApkOpen(true)}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(l) => {
          setCurrentLanguage(l);
          setSettings((prev) => ({ ...prev, preferredLanguage: l }));
        }}
      />

      {/* Export Mobile APK Modal */}
      <ExportApkModal
        isOpen={isExportApkOpen}
        onClose={() => setIsExportApkOpen(false)}
      />
    </div>
  );
}
