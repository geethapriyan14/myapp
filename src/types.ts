export type ScreenType = 'conversation' | 'translator' | 'moments' | 'profile' | 'settings';

export type DesktopLayoutMode = 'dual' | 'chat' | 'translator';

export type AvatarFrameType = 'birthday' | 'heart' | 'emerald' | 'clean' | 'gold' | 'neon';

export type SupportedLanguage = 'en' | 'zh-HK' | 'zh-CN' | 'es' | 'ja' | 'ko' | 'fr' | 'vi';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeLabel: string;
  flag: string;
  speechCode: string;
}

export interface MomentComment {
  id: string;
  authorId: string;
  authorName: string;
  replyToName?: string;
  text: string;
  time: string;
}

export interface MomentLike {
  userId: string;
  userName: string;
  avatarUrl?: string;
}

export interface Moment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  content: string;
  images: string[];
  location?: string;
  time: string;
  timestamp: number;
  likes: MomentLike[];
  comments: MomentComment[];
  privacy?: 'public' | 'friends' | 'private';
  translation?: string;
  showTranslation?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentColor = 'emerald' | 'indigo' | 'amber' | 'crimson' | 'violet' | 'teal' | 'slate';

export type ChatWallpaper = 'clean' | 'doodles' | 'mesh' | 'parchment';

export type FontSizeScale = 'compact' | 'standard' | 'large';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  country: string;
  isDefault?: boolean;
  presets: string[];
}

export interface RedPacketClaim {
  name: string;
  avatar: string;
  amount: string;
  time: string;
  isLuckyWinner?: boolean;
}

export interface RedPacketData {
  id: string;
  amount: string;
  currency: string; // Default 'INR'
  currencySymbol: string; // Default '₹'
  paymentMethod: 'upi' | 'wallet';
  upiProvider?: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'custom';
  upiId?: string;
  transactionRef?: string;
  wish: string;
  senderName: string;
  senderAvatar: string;
  isOpened: boolean;
  packetType: 'direct' | 'lucky_draw' | 'equal_split';
  totalCount: number;
  claimedCount: number;
  claims: RedPacketClaim[];
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'private' | 'group';
  avatarUrl: string;
  membersCount?: number;
  onlineStatus?: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  verified?: boolean;
  countryCode?: string;
  countryFlag?: string;
  pinned?: boolean;
  about?: string;
  phoneOrHandle?: string;
}

export interface ChatMessage {
  id: string;
  channelId?: string;
  sender?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  isCurrentUser?: boolean;
  type: 'text' | 'voice' | 'sticker' | 'photo' | 'red_packet' | 'flower' | 'payment_receipt';
  text?: string;
  translation?: string;
  translatedText?: string;
  showTranslation?: boolean;
  audioDuration?: string;
  imageUrl?: string;
  caption?: string;
  badge?: string;
  time: string;
  status?: 'sent' | 'read' | 'delivered';
  redPacket?: RedPacketData;
  amount?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  amount: number;
  currency: string;
  symbol: string;
  method: 'upi' | 'wallet';
  time: string;
  status: 'completed' | 'pending';
  channelOrPeer?: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  chatWallpaper: ChatWallpaper;
  fontSize: FontSizeScale;
  defaultCountry: string; // Default 'IN' (India)
  defaultCurrency: string; // Default 'INR' (₹)
  upiId: string; // e.g. 'gowtham@okaxis'
  walletBalance: number; // e.g. 2500
  notificationSounds: boolean;
  autoTranslateIncoming: boolean;
  preferredLanguage: SupportedLanguage;
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: SupportedLanguage;
  toLang: SupportedLanguage;
  timestamp: string;
  type: 'voice' | 'text';
}

export interface UserProfile {
  name: string;
  togetherId: string;
  role: string;
  titleDesc: string;
  status: string;
  avatarFrame: AvatarFrameType;
  avatarUrl: string;
  audioPronunciation: {
    recorded: boolean;
    duration: string;
    label: string;
    dialect: string;
  };
  preferredLanguage: SupportedLanguage;
  displayInFamilyTree: boolean;
  birthdayCountdown: boolean;
  upiId: string;
  walletBalance: number;
}


