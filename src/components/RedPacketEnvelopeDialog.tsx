import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RedPacketData } from '../types';
import { playChime } from '../utils/soundEffects';

interface RedPacketEnvelopeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  redPacket: RedPacketData | null;
  onClaim: (packetId: string, claimedAmount: string) => void;
}

export const RedPacketEnvelopeDialog: React.FC<RedPacketEnvelopeDialogProps> = ({
  isOpen,
  onClose,
  redPacket,
  onClaim,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  if (!isOpen || !redPacket) return null;

  const handleOpenPacket = () => {
    setIsOpening(true);
    playChime('coin');

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#dc2626', '#f59e0b', '#fbbf24', '#ffffff', '#00875a'],
    });

    setTimeout(() => {
      // Calculate claim amount
      let claimAmt = redPacket.amount;
      if (redPacket.packetType === 'lucky_draw') {
        const total = parseFloat(redPacket.amount) || 100;
        // Distribute fair lucky slice
        const slice = (total / (redPacket.totalCount || 3)) * (0.8 + Math.random() * 0.4);
        claimAmt = Math.max(10, Math.round(slice)).toString();
      }
      onClaim(redPacket.id, claimAmt);
      setIsOpening(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#dc2626] via-[#b91c1c] to-[#7f1d1d] text-white p-6 shadow-2xl relative overflow-hidden border border-amber-400/40 text-center">
        {/* Decorative background curves */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/80 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Sender Info */}
        <div className="flex flex-col items-center mt-2">
          <img
            src={redPacket.senderAvatar}
            alt={redPacket.senderName}
            className="w-16 h-16 rounded-full border-3 border-amber-300 shadow-md object-cover mb-2"
          />
          <h3 className="text-base font-bold text-amber-200">
            {redPacket.senderName}&apos;s Red Packet
          </h3>
          <p className="text-xs text-amber-100/80 mt-1 italic max-w-xs px-2">
            &ldquo;{redPacket.wish}&rdquo;
          </p>
        </div>

        {/* Payment Badge */}
        <div className="my-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 border border-white/15 text-[11px] font-semibold text-amber-200">
          <span className="material-symbols-outlined text-[14px]">
            {redPacket.paymentMethod === 'upi' ? 'account_balance' : 'account_balance_wallet'}
          </span>
          <span>
            {redPacket.paymentMethod === 'upi'
              ? `Verified UPI (${redPacket.upiProvider?.toUpperCase() || 'Instant'})`
              : 'Together Wallet Instant'}
          </span>
        </div>

        {!redPacket.isOpened ? (
          /* Unopened envelope state with big Open seal */
          <div className="my-6 flex flex-col items-center">
            <button
              onClick={handleOpenPacket}
              disabled={isOpening}
              className={`w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-red-950 font-black shadow-2xl flex flex-col items-center justify-center border-4 border-amber-200 active:scale-95 transition-transform ${
                isOpening ? 'animate-spin' : 'hover:scale-105 animate-bounce'
              }`}
            >
              <span className="text-2xl font-black">{redPacket.currencySymbol}</span>
              <span className="text-xs tracking-wider uppercase font-bold mt-0.5">OPEN</span>
            </button>
            <p className="text-xs text-amber-200 mt-4 font-medium">
              Tap the golden seal to claim your shagun!
            </p>
          </div>
        ) : (
          /* Opened state: show claimed amount and deposit destination */
          <div className="my-5 bg-black/20 rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-amber-200/90 font-medium">Amount Received</span>
            <div className="text-4xl font-black text-amber-300 my-1">
              {redPacket.currencySymbol}{redPacket.amount}
            </div>
            <p className="text-[11px] text-white/80">
              Credited directly to your Together Wallet balance!
            </p>
            {redPacket.transactionRef && (
              <p className="text-[10px] text-amber-200/70 font-mono mt-1">
                Ref: {redPacket.transactionRef}
              </p>
            )}

            {/* If Group Chat: Claims List */}
            {redPacket.claims && redPacket.claims.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10 text-left">
                <span className="text-[11px] font-bold text-amber-200 block mb-2">
                  Claim History ({redPacket.claims.length} of {redPacket.totalCount} claimed):
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                  {redPacket.claims.map((claim, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={claim.avatar}
                          alt={claim.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-medium text-white/90">{claim.name}</span>
                        {claim.isLuckyWinner && (
                          <span className="text-[9px] px-1 rounded bg-amber-400 text-red-950 font-bold">
                            👑 Lucky!
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-amber-300">
                        {redPacket.currencySymbol}{claim.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
