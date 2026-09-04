import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CurrencyConfig, RedPacketData, SupportedLanguage, AppSettings } from '../types';
import { SUPPORTED_CURRENCIES } from '../data/mockData';
import { playChime } from '../utils/soundEffects';

interface RedPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (packetData: Omit<RedPacketData, 'id' | 'isOpened' | 'claimedCount' | 'claims'>) => void;
  currentLanguage: SupportedLanguage;
  settings: AppSettings;
  chatType: 'private' | 'group';
  channelName: string;
  onOpenWalletTopup?: () => void;
}

const CELEBRATION_WISHES = [
  'Best wishes & prosperity! 🌟✨',
  'Shagun & blessings for you! 🪔❤️',
  'Filter coffee & treats on me! ☕🍰',
  'Congratulations on the milestone! 🚀🎉',
  'Team lunch & sprint celebration! 🍕💻',
  'Happy Birthday! Have a wonderful year ahead! 🎂🎈',
];

export const RedPacketModal: React.FC<RedPacketModalProps> = ({
  isOpen,
  onClose,
  onSend,
  currentLanguage: _currentLanguage,
  settings,
  chatType,
  channelName,
  onOpenWalletTopup,
}) => {
  // Default currency is INR (India)
  const defaultCurr = SUPPORTED_CURRENCIES.find((c) => c.code === settings.defaultCurrency) || SUPPORTED_CURRENCIES[0];
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(defaultCurr);

  const [selectedAmount, setSelectedAmount] = useState(defaultCurr.presets[2] || '251');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedWish, setSelectedWish] = useState(CELEBRATION_WISHES[0]);
  const [customWish, setCustomWish] = useState('');

  // Payment method: 'upi' (Default in India) or 'wallet'
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'wallet'>('upi');
  const [upiProvider, setUpiProvider] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'custom'>('gpay');
  const [upiIdInput, setUpiIdInput] = useState(settings.upiId || 'gowtham@okaxis');

  // Group split options
  const [packetType, setPacketType] = useState<'lucky_draw' | 'equal_split' | 'direct'>(
    chatType === 'group' ? 'lucky_draw' : 'direct'
  );
  const [totalPackets, setTotalPackets] = useState(chatType === 'group' ? '5' : '1');

  // Step state: 'compose' | 'upi_pin'
  const [step, setStep] = useState<'compose' | 'upi_pin'>('compose');
  const [upiPin, setUpiPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const finalAmount = customAmount.trim() ? customAmount : selectedAmount;
  const finalWish = customWish.trim() ? customWish : selectedWish;
  const numAmount = parseFloat(finalAmount) || 0;

  const handleCurrencyChange = (curr: CurrencyConfig) => {
    setSelectedCurrency(curr);
    setSelectedAmount(curr.presets[1] || '100');
    setCustomAmount('');
  };

  const handleInitiateSend = () => {
    if (numAmount <= 0) return;

    if (paymentMethod === 'wallet' && numAmount > settings.walletBalance) {
      // Insufficient balance
      if (onOpenWalletTopup) {
        onOpenWalletTopup();
      }
      return;
    }

    if (paymentMethod === 'upi') {
      // Show secure UPI PIN keypad
      setStep('upi_pin');
      setUpiPin('');
      setPinError('');
      playChime('tap');
    } else {
      executeSend();
    }
  };

  const executeSend = () => {
    playChime('coin');
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#f59e0b', '#fbbf24', '#00875a'],
    });

    const txRef = paymentMethod === 'upi'
      ? `UPI/2026/${Math.floor(1000000000 + Math.random() * 9000000000)}`
      : `WAL/2026/${Math.floor(100000 + Math.random() * 900000)}`;

    onSend({
      amount: finalAmount,
      currency: selectedCurrency.code,
      currencySymbol: selectedCurrency.symbol,
      paymentMethod,
      upiProvider: paymentMethod === 'upi' ? upiProvider : undefined,
      upiId: paymentMethod === 'upi' ? upiIdInput : undefined,
      transactionRef: txRef,
      wish: finalWish,
      senderName: 'Gowtham Kumar',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      packetType: chatType === 'group' ? packetType : 'direct',
      totalCount: chatType === 'group' ? parseInt(totalPackets, 10) || 1 : 1,
    });

    onClose();
  };

  const handlePinSubmit = () => {
    if (upiPin.length < 4) {
      setPinError('Please enter your 4 or 6 digit UPI PIN');
      return;
    }
    executeSend();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#dc2626] via-[#b91c1c] to-[#991b1b] text-white p-5 sm:p-6 shadow-2xl relative overflow-hidden border border-amber-400/30 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Decorative auspicious glow & motifs */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {step === 'compose' ? (
          <div>
            {/* Header */}
            <div className="flex flex-col items-center text-center mt-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-red-900 flex items-center justify-center shadow-lg mb-2.5 border-2 border-amber-200">
                <span className="text-2xl font-black tracking-tight">{selectedCurrency.symbol}</span>
              </div>
              <h3 className="text-lg font-bold tracking-wide text-amber-200">
                Send Red Packet & Shagun
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                To <span className="font-medium text-amber-100">{channelName}</span>
                {chatType === 'group' ? ' (Group)' : ' (Private Chat)'}
              </p>
            </div>

            {/* Country & Currency Selector (India INR Default) */}
            <div className="mt-4 bg-black/20 rounded-2xl p-2.5 border border-white/10">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-semibold text-amber-200/90 tracking-wider uppercase">
                  Country & Currency (India Default)
                </span>
                <span className="text-[11px] text-amber-300 font-medium">
                  {selectedCurrency.flag} {selectedCurrency.code} ({selectedCurrency.symbol})
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {SUPPORTED_CURRENCIES.map((curr) => {
                  const isSelected = selectedCurrency.code === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleCurrencyChange(curr)}
                      className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-amber-400 text-red-950 border-amber-300 shadow-md font-bold'
                          : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/15'
                      }`}
                    >
                      <span>{curr.flag}</span>
                      <span>{curr.code}</span>
                      {curr.isDefault && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-red-900 text-amber-300 font-mono">
                          Default
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group Packet Distribution (if Group Chat) */}
            {chatType === 'group' && (
              <div className="mt-3.5 bg-black/20 rounded-2xl p-2.5 border border-white/10">
                <label className="text-[11px] font-semibold text-amber-200/90 mb-1.5 block uppercase tracking-wider">
                  Group Distribution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPacketType('lucky_draw')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                      packetType === 'lucky_draw'
                        ? 'bg-amber-400 text-red-950 font-bold border-amber-300'
                        : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <span>🎲 Lucky Draw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPacketType('equal_split')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                      packetType === 'equal_split'
                        ? 'bg-amber-400 text-red-950 font-bold border-amber-300'
                        : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <span>⚖️ Equal Split</span>
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs px-1">
                  <span className="text-white/80">Number of packets:</span>
                  <div className="flex items-center gap-1.5">
                    {['3', '5', '10'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTotalPackets(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold border ${
                          totalPackets === num
                            ? 'bg-amber-400 text-red-950 border-amber-300'
                            : 'bg-white/10 text-white border-white/15'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={totalPackets}
                      onChange={(e) => setTotalPackets(e.target.value)}
                      className="w-12 h-7 rounded-lg text-center bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Amount Selection */}
            <div className="mt-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-amber-200/90 uppercase tracking-wider">
                  Amount ({selectedCurrency.symbol} {selectedCurrency.code})
                </label>
                {selectedCurrency.code === 'INR' && (
                  <span className="text-[10px] text-amber-300 bg-black/20 px-2 py-0.5 rounded-full font-medium">
                    Traditional Shagun Presets
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {selectedCurrency.presets.map((amt) => {
                  const isSelected = selectedAmount === amt && !customAmount;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                        playChime('tap');
                      }}
                      className={`py-2 px-1 rounded-xl text-sm font-bold transition-all border ${
                        isSelected
                          ? 'bg-amber-400 text-red-950 border-amber-300 shadow-md scale-102'
                          : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                      }`}
                    >
                      {selectedCurrency.symbol}{amt}
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount Field */}
              <div className="mt-2 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-300">
                  {selectedCurrency.symbol}
                </span>
                <input
                  type="number"
                  placeholder="Or enter custom amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full py-2.5 pl-8 pr-3 rounded-xl text-sm font-bold bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            {/* Payment Method Selector (UPI vs Wallet) */}
            <div className="mt-4 bg-black/25 rounded-2xl p-3 border border-white/15">
              <label className="text-[11px] font-semibold text-amber-200/90 mb-2 block uppercase tracking-wider">
                Payment Method
              </label>

              <div className="grid grid-cols-2 gap-2">
                {/* UPI Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-400 text-red-950 border-amber-300 shadow-md font-bold'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">account_balance</span>
                      UPI Instant
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-900 text-amber-300 font-mono">
                      India
                    </span>
                  </div>
                  <span className="text-[10px] opacity-85 mt-1">GPay · PhonePe · Paytm · BHIM</span>
                </button>

                {/* Together Wallet Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-amber-400 text-red-950 border-amber-300 shadow-md font-bold'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                      Together Wallet
                    </span>
                  </div>
                  <span className="text-[11px] font-bold mt-1">
                    Balance: ₹{settings.walletBalance.toLocaleString('en-IN')}
                  </span>
                </button>
              </div>

              {/* UPI Sub-Options */}
              {paymentMethod === 'upi' && (
                <div className="mt-2.5 pt-2.5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1.5 text-[11px]">
                    <span className="text-amber-200">Select UPI App:</span>
                    <span className="text-white/70">ID: {upiIdInput}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'gpay', name: 'GPay', icon: '🟢' },
                      { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                      { id: 'paytm', name: 'Paytm', icon: '🔵' },
                      { id: 'bhim', name: 'BHIM UPI', icon: '🟠' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiProvider(app.id as any)}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border ${
                          upiProvider === app.id
                            ? 'bg-white text-red-950 border-white shadow'
                            : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/15'
                        }`}
                      >
                        <span>{app.icon}</span>
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      placeholder="Enter custom UPI ID (e.g. name@okhdfcbank)"
                      className="flex-1 text-xs py-1.5 px-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-amber-300"
                    />
                  </div>
                </div>
              )}

              {/* Wallet Top-up prompt if insufficient */}
              {paymentMethod === 'wallet' && numAmount > settings.walletBalance && (
                <div className="mt-2 text-xs bg-amber-500/20 text-amber-200 p-2 rounded-xl border border-amber-400/30 flex items-center justify-between">
                  <span>Insufficient balance (Need ₹{(numAmount - settings.walletBalance).toFixed(2)} more)</span>
                  <button
                    type="button"
                    onClick={onOpenWalletTopup}
                    className="px-2 py-1 rounded-lg bg-amber-400 text-red-950 font-bold text-[11px] hover:bg-amber-300"
                  >
                    + Add Money
                  </button>
                </div>
              )}
            </div>

            {/* Blessing / Message */}
            <div className="mt-3.5">
              <label className="text-[11px] font-semibold text-amber-200/90 mb-1.5 block uppercase tracking-wider">
                Festive Wish / Note
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CELEBRATION_WISHES.slice(0, 4).map((wish) => (
                  <button
                    key={wish}
                    type="button"
                    onClick={() => {
                      setSelectedWish(wish);
                      setCustomWish('');
                    }}
                    className={`text-left text-[11px] p-2 rounded-xl transition-all border line-clamp-2 ${
                      selectedWish === wish && !customWish
                        ? 'bg-white/20 border-amber-300 text-amber-200 font-medium'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {wish}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customWish}
                onChange={(e) => setCustomWish(e.target.value)}
                placeholder="Or write custom greeting..."
                className="mt-1.5 w-full py-1.5 px-2.5 rounded-xl text-xs bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-amber-300"
              />
            </div>

            {/* Send CTA Button */}
            <button
              onClick={handleInitiateSend}
              disabled={numAmount <= 0}
              className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-red-950 font-black text-base shadow-xl hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 border-2 border-amber-200"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                redeem
              </span>
              <span>
                Send {selectedCurrency.symbol}{finalAmount || '0'} Red Packet
                {paymentMethod === 'upi' ? ' (via UPI)' : ' (from Wallet)'}
              </span>
            </button>
          </div>
        ) : (
          /* Secure UPI PIN Screen */
          <div className="py-2">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <button
                type="button"
                onClick={() => setStep('compose')}
                className="text-xs text-amber-200 flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-300">UPI PIN Verification</span>
              </div>
            </div>

            <div className="text-center my-4">
              <p className="text-xs text-white/75">Paying to Together Red Packet</p>
              <h2 className="text-3xl font-black text-amber-300 my-1">
                {selectedCurrency.symbol}{finalAmount}
              </h2>
              <p className="text-[11px] text-white/60 font-mono">From: {upiIdInput}</p>
            </div>

            <div className="my-4 bg-black/25 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-xs text-amber-200 font-semibold mb-3">ENTER 4 OR 6 DIGIT UPI PIN</p>
              <div className="flex items-center justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const isFilled = idx < upiPin.length;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isFilled
                          ? 'bg-amber-400 border-amber-300 scale-110'
                          : 'border-white/40 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>

              {pinError && (
                <p className="text-xs text-red-300 mt-2 font-medium">{pinError}</p>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    playChime('tap');
                    if (k === 'C') {
                      setUpiPin('');
                    } else if (k === '⌫') {
                      setUpiPin((prev) => prev.slice(0, -1));
                    } else {
                      if (upiPin.length < 6) {
                        setUpiPin((prev) => prev + k);
                      }
                    }
                  }}
                  className="py-3 rounded-xl bg-white/10 hover:bg-white/20 active:bg-amber-400 active:text-red-950 font-bold text-base border border-white/15 transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handlePinSubmit}
              disabled={upiPin.length < 4}
              className="mt-5 w-full py-3.5 rounded-2xl bg-amber-400 text-red-950 font-black text-base shadow-lg hover:bg-amber-300 active:scale-98 transition-all flex items-center justify-center gap-2 border border-amber-200 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Confirm & Send UPI Shagun</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
