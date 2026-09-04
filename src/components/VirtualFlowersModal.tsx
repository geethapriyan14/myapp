import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SupportedLanguage } from '../types';
import { t } from '../i18n/translations';
import { playChime } from '../utils/soundEffects';

interface VirtualFlowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (flowerName: string, icon: string, note: string) => void;
  currentLanguage: SupportedLanguage;
}

interface FlowerItem {
  name: string;
  icon: string;
  desc: string;
}

const LOCALIZED_FLOWERS: Record<SupportedLanguage, { flowers: FlowerItem[]; defaultNote: string }> = {
  en: {
    flowers: [
      { name: 'Longevity Peonies', icon: '🌸', desc: 'Symbol of prosperity, grace, and elder honor' },
      { name: 'Golden Sunflowers', icon: '🌻', desc: 'Bringing cheerful morning warmth and health' },
      { name: 'Peaceful Lilies', icon: '💮', desc: 'Pure affection and soothing harmony' },
      { name: 'Jade Orchids', icon: '🌿', desc: 'Elegance, respect, and deep family heritage' },
    ],
    defaultNote: 'Happy 78th Birthday Grandma! Wishing you vibrant health and sweet smiles every day! 🌸❤️',
  },
  'zh-HK': {
    flowers: [
      { name: '富貴牡丹花籃', icon: '🌸', desc: '象徵吉祥富貴，頌揚長輩福澤延年' },
      { name: '金葵向陽花束', icon: '🌻', desc: '朝氣蓬勃，帶來滿滿健康與歡欣' },
      { name: '清雅百合花籃', icon: '💮', desc: '純潔深情，寓意闔家和睦美滿' },
      { name: '翡翠幽蘭花盆', icon: '🌿', desc: '高雅崇敬，承載深厚家族敬意' },
    ],
    defaultNote: '祝外婆78歲壽辰快樂！祝您福體安康，每日開開心心！🌸❤️',
  },
  'zh-CN': {
    flowers: [
      { name: '富贵牡丹花篮', icon: '🌸', desc: '象征吉祥富贵，颂扬长辈福泽延年' },
      { name: '金葵向阳花束', icon: '🌻', desc: '朝气蓬勃，带来满满健康与欢欣' },
      { name: '清雅百合花篮', icon: '💮', desc: '纯洁深情，寓意阖家和睦美满' },
      { name: '翡翠幽兰花盆', icon: '🌿', desc: '高雅崇敬，承载深厚家族敬意' },
    ],
    defaultNote: '祝外婆78岁寿辰快乐！祝您身体安康，每天都笑容满面！🌸❤️',
  },
  es: {
    flowers: [
      { name: 'Peonías de Longevidad', icon: '🌸', desc: 'Símbolo de prosperidad, gracia y honor familiar' },
      { name: 'Girasoles Dorados', icon: '🌻', desc: 'Aportan calidez, alegría matutina y vitalidad' },
      { name: 'Lirios de la Paz', icon: '💮', desc: 'Cariño puro y serenidad para el hogar' },
      { name: 'Orquídeas de Jade', icon: '🌿', desc: 'Elegancia, respeto y herencia familiar' },
    ],
    defaultNote: '¡Feliz 78 cumpleaños abuela! ¡Te deseamos mucha salud y felicidad todos los días! 🌸❤️',
  },
  ja: {
    flowers: [
      { name: '長寿の牡丹バスケット', icon: '🌸', desc: '繁栄と気品、長寿への敬意を象徴する花' },
      { name: '黄金のひまわり', icon: '🌻', desc: '明るい笑顔と健やかな毎日を届ける花' },
      { name: '清らかな百合', icon: '💮', desc: '穏やかで温かい家族の和を象徴する花' },
      { name: '翡翠の蘭', icon: '🌿', desc: '気品と深い敬愛、家族の絆を結ぶ花' },
    ],
    defaultNote: 'おばあちゃん、78歳のお誕生日おめでとう！いつも元気で笑顔いっぱいでいてね！🌸❤️',
  },
  ko: {
    flowers: [
      { name: '만수무강 모란 꽃바구니', icon: '🌸', desc: '부귀영화와 장수, 어르신을 향한 공경의 상징' },
      { name: '황금빛 해바라기', icon: '🌻', desc: '아침의 활력과 따스한 건강을 전하는 꽃' },
      { name: '평온한 백합', icon: '💮', desc: '순수한 사랑과 온 가족의 화목을 기원' },
      { name: '비취 난초', icon: '🌿', desc: '고결한 품격과 깊은 존경의 마음' },
    ],
    defaultNote: '할머니의 78번째 생신을 축하드려요! 늘 건강하시고 행복한 미소만 가득하세요! 🌸❤️',
  },
  fr: {
    flowers: [
      { name: 'Pivoines de Longévité', icon: '🌸', desc: 'Symbole de prospérité, de grâce et d’honneur' },
      { name: 'Tournesols Dorés', icon: '🌻', desc: 'Chaleur matinale, joie et bonne santé' },
      { name: 'Lys de Sérénité', icon: '💮', desc: 'Affection pure et harmonie familiale' },
      { name: 'Orchidées de Jade', icon: '🌿', desc: 'Élégance, respect et mémoire familiale' },
    ],
    defaultNote: 'Joyeux 78e anniversaire Grand-mère ! Beaucoup de santé et de sourires au quotidien ! 🌸❤️',
  },
  vi: {
    flowers: [
      { name: 'Mẫu Đơn Phú Quý', icon: '🌸', desc: 'Biểu tượng của phú quý, thanh cao và trường thọ' },
      { name: 'Hướng Dương Rực Rỡ', icon: '🌻', desc: 'Mang lại sự ấm áp, sức khỏe và niềm vui' },
      { name: 'Bách Hợp Bình An', icon: '💮', desc: 'Tình cảm trong sáng và gia đình thuận hòa' },
      { name: 'Phong Lan Ngọc Bích', icon: '🌿', desc: 'Sự tao nhã, lòng tôn kính và truyền thống gia đình' },
    ],
    defaultNote: 'Kính chúc Bà Ngoại sinh nhật 78 tuổi an khang, luôn mỉm cười vui khỏe mỗi ngày! 🌸❤️',
  },
};

export const VirtualFlowersModal: React.FC<VirtualFlowersModalProps> = ({
  isOpen,
  onClose,
  onSend,
  currentLanguage,
}) => {
  const flowerData = LOCALIZED_FLOWERS[currentLanguage] || LOCALIZED_FLOWERS.en;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [note, setNote] = useState(flowerData.defaultNote);

  useEffect(() => {
    setNote(flowerData.defaultNote);
  }, [currentLanguage]);

  if (!isOpen) return null;

  const handleSend = () => {
    playChime('bell');
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#006948', '#85f8c4', '#ffb2b7', '#fea619'],
    });
    const chosen = flowerData.flowers[selectedIdx];
    onSend(chosen.name, chosen.icon, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-surface-container-lowest text-on-surface p-6 shadow-2xl relative overflow-hidden border border-outline-variant/30">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center shadow-sm mb-2">
            <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_florist
            </span>
          </div>
          <h3 className="text-lg font-bold text-on-surface">
            {t('flowersTitle', currentLanguage)}
          </h3>
          <p className="text-xs text-on-surface-variant">
            {t('flowersSubtitle', currentLanguage)}
          </p>
        </div>

        {/* Flower Selection */}
        <div className="mt-4 flex flex-col gap-2">
          {flowerData.flowers.map((fl, idx) => (
            <button
              key={fl.name}
              type="button"
              onClick={() => {
                setSelectedIdx(idx);
                playChime('tap');
              }}
              className={`p-3 rounded-2xl flex items-center gap-3 text-left transition-all border ${
                selectedIdx === idx
                  ? 'bg-primary/10 border-primary text-primary shadow-xs'
                  : 'bg-surface-container-low border-transparent text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="text-2xl">{fl.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">{fl.name}</div>
                <div className="text-xs text-on-surface-variant opacity-80">{fl.desc}</div>
              </div>
              {selectedIdx === idx && (
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
              )}
            </button>
          ))}
        </div>

        {/* Note input */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-on-surface-variant block mb-1">
            {t('personalNote', currentLanguage)}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-surface-container-low rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSend}
          className="mt-5 w-full py-3 rounded-2xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:bg-primary-container active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">local_florist</span>
          <span>{t('sendFlowersBtn', currentLanguage)}</span>
        </button>
      </div>
    </div>
  );
};

