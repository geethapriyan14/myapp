import { SupportedLanguage } from '../types';

export interface FamilyPhrase {
  id: string;
  category: 'care' | 'birthday' | 'meals' | 'warmth';
  categoryLabelKey: string;
  translations: Record<SupportedLanguage, string>;
}

export const FAMILY_PHRASES: FamilyPhrase[] = [
  {
    id: 'fp-1',
    category: 'care',
    categoryLabelKey: 'careHealth',
    translations: {
      en: 'Did you drink warm water and take your heart vitamins this morning?',
      'zh-HK': '外婆，今朝有無飲溫水同食心臟維他命呀？',
      'zh-CN': '外婆，今天早上喝温水、吃心脏维生素了吗？',
      es: '¿Tomaste agua tibia y tus vitaminas para el corazón esta mañana?',
      ja: 'おばあちゃん、今朝は温かいお白湯を飲んで、ビタミン剤は飲みましたか？',
      ko: '할머니, 오늘 아침에 따뜻한 물 드시고 심장 영양제 챙겨 드셨어요?',
      fr: "As-tu bu de l'eau tiède et pris tes vitamines pour le cœur ce matin ?",
      vi: 'Bà ơi, sáng nay bà đã uống nước ấm và uống vitamin trợ tim chưa ạ?',
    },
  },
  {
    id: 'fp-2',
    category: 'care',
    categoryLabelKey: 'careHealth',
    translations: {
      en: 'Please rest your eyes and sit comfortably, do not tire yourself.',
      'zh-HK': '外婆快啲坐低休息下，閉目養神，唔好太操勞啊。',
      'zh-CN': '外婆快坐下休息会儿，闭目养神，别太操劳啦。',
      es: 'Descansa un poco la vista y siéntate cómoda, no te canses demasiado.',
      ja: '目を休めて楽に座っていてね、無理しないでね。',
      ko: '눈 좀 쉬시고 편히 앉아 계세요, 너무 무리하지 마세요.',
      fr: 'Repose un peu tes yeux et assieds-toi confortablement, ne te fatigue pas.',
      vi: 'Bà nghỉ ngơi cho khỏe mắt và ngồi thư giãn đi ạ, đừng làm mệt nhé bà.',
    },
  },
  {
    id: 'fp-3',
    category: 'care',
    categoryLabelKey: 'careHealth',
    translations: {
      en: 'How was your blood pressure check today? The sensor says 118/76, perfectly stable!',
      'zh-HK': '今日量血壓點呀？客廳儀器顯示118/76，好穩定好健康！',
      'zh-CN': '今天量血压怎么样？仪器显示118/76，非常平稳健康！',
      es: '¿Cómo estuvo la presión hoy? El monitor marca 118/76, ¡perfecta y estable!',
      ja: '今日の血圧はどうでしたか？118/76でとても安定していて安心です！',
      ko: '오늘 혈압은 어떠셨어요? 측정기에 118/76으로 아주 건강하게 나왔어요!',
      fr: 'Comment était ta tension aujourd’hui ? Le capteur affiche 118/76, parfaitement stable !',
      vi: 'Huyết áp hôm nay của bà thế nào ạ? Máy đo báo 118/76, rất ổn định ạ!',
    },
  },
  {
    id: 'fp-4',
    category: 'birthday',
    categoryLabelKey: 'birthdayBlessings',
    translations: {
      en: 'Happy 78th Birthday, beloved Grandma! Wishing you eternal health, peace, and boundless joy!',
      'zh-HK': '外婆78歲生日快樂！祝您福如東海、壽比南山，身體健康，天天開懷！🎂❤️',
      'zh-CN': '外婆78岁生日快乐！祝您福如东海、寿比南山，身体倍儿棒，天天开怀！🎂❤️',
      es: '¡Feliz 78 cumpleaños, querida abuela! ¡Te deseo salud eterna, paz y alegría infinita! 🎂❤️',
      ja: 'おばあちゃん、78歳のお誕生日おめでとうございます！いつまでも元気で笑顔いっぱいでいてね！🎂❤️',
      ko: '사랑하는 할머니의 78번째 생신을 진심으로 축하드려요! 늘 무병장수하시고 행복하세요! 🎂❤️',
      fr: 'Joyeux 78e anniversaire très chère grand-mère ! Je te souhaite santé, paix et bonheur infini ! 🎂❤️',
      vi: 'Kính chúc bà sinh nhật lần thứ 78 tràn đầy niềm vui, sống lâu trăm tuổi và an khang thịnh vượng! 🎂❤️',
    },
  },
  {
    id: 'fp-5',
    category: 'birthday',
    categoryLabelKey: 'birthdayBlessings',
    translations: {
      en: 'I sent you a special red packet and fresh flowers to brighten your living room!',
      'zh-HK': '我寄咗個心意紅包同新鮮靚花俾您，等客廳芬芳滿屋！🧧🌸',
      'zh-CN': '我给您发了个心意大红包和鲜花，让客厅满是花香！🧧🌸',
      es: '¡Te envié un sobre rojo especial y flores frescas para alegrar tu sala! 🧧🌸',
      ja: 'お部屋を明るくする特別なお祝いのお花と紅包を送りましたよ！🧧🌸',
      ko: '거실을 화사하게 밝혀줄 생신 축하 용돈과 꽃을 보내드렸어요! 🧧🌸',
      fr: 'Je t’ai envoyé une enveloppe rouge et de jolies fleurs pour illuminer ton salon ! 🧧🌸',
      vi: 'Cháu đã gửi một phong bao lì xì và giỏ hoa tươi thắm đến để bà vui nhé! 🧧🌸',
    },
  },
  {
    id: 'fp-6',
    category: 'meals',
    categoryLabelKey: 'mealsCooking',
    translations: {
      en: 'I miss your homemade shrimp dumplings and slow-boiled soup so much!',
      'zh-HK': '好掛住外婆親手包嘅鮮蝦餃同老火靚湯呀！🥟🍲',
      'zh-CN': '太想念外婆亲手包的鲜虾水饺和老火靓汤啦！🥟🍲',
      es: '¡Extraño muchísimo tus empanadillas caseras de camarón y tu sopa caliente! 🥟🍲',
      ja: 'おばあちゃん手作りのエビ水餃子と温かいスープが恋しいです！🥟🍲',
      ko: '할머니가 직접 빚어주신 새우만두랑 따끈한 국물이 너무 먹고 싶어요! 🥟🍲',
      fr: 'Tes délicieux raviolis maison aux crevettes et ta soupe réconfortante me manquent tant ! 🥟🍲',
      vi: 'Cháu nhớ món há cảo tôm thơm ngon và bát canh nóng hổi của bà nấu lắm ạ! 🥟🍲',
    },
  },
  {
    id: 'fp-7',
    category: 'meals',
    categoryLabelKey: 'mealsCooking',
    translations: {
      en: 'Did you have lunch yet? Remember to eat nutritious, warm food today.',
      'zh-HK': '外婆食咗晏晝未呀？記得食暖笠笠又有營養嘅嘢呀。🍚🥢',
      'zh-CN': '外婆吃午饭了吗？记得吃点热乎又营养的食物哦。🍚🥢',
      es: '¿Ya almorzaste? Recuerda comer alimentos nutritivos y calientitos hoy. 🍚🥢',
      ja: 'お昼ご飯はもう食べましたか？体に優しくて温かいものをしっかり食べてね。🍚🥢',
      ko: '점심 식사 하셨어요? 영양가 있고 따뜻한 음식 꼭 챙겨 드세요. 🍚🥢',
      fr: 'As-tu déjà déjeuné ? Pense à manger chaud et équilibré aujourd’hui. 🍚🥢',
      vi: 'Bà đã dùng bữa trưa chưa ạ? Bà nhớ ăn cơm nóng và đủ chất nhé. 🍚🥢',
    },
  },
  {
    id: 'fp-8',
    category: 'warmth',
    categoryLabelKey: 'familyWarmth',
    translations: {
      en: 'I am coming home to visit you this weekend! We can chat on the balcony.',
      'zh-HK': '我呢個週末就返嚟探您！到時一齊喺露台飲茶傾偈！🏃🏠',
      'zh-CN': '我这个周末就回家看您！到时候在阳台上陪您喝茶聊天！🏃🏠',
      es: '¡Voy a ir a visitarte este fin de semana! Podemos platicar y tomar el té en el balcón. 🏃🏠',
      ja: '今週末におうちに会いに行きます！ベランダでお茶を飲みながらゆっくりお話ししましょう。🏃🏠',
      ko: '이번 주말에 할머니 뵈러 갈게요! 발코니에서 차 마시며 이야기 나눠요. 🏃🏠',
      fr: 'Je viens te rendre visite ce week-end ! Nous pourrons papoter sur le balcon. 🏃🏠',
      vi: 'Cuối tuần này cháu sẽ về thăm bà nhé! Hai bà cháu mình cùng ngồi uống trà trò chuyện. 🏃🏠',
    },
  },
  {
    id: 'fp-9',
    category: 'warmth',
    categoryLabelKey: 'familyWarmth',
    translations: {
      en: 'Sleep peacefully tonight, Grandma. Dream of sweet flowers and sunny gardens.',
      'zh-HK': '外婆今晚早啲瞓，祝您好夢連連，甜美入眠！🌙✨',
      'zh-CN': '外婆今晚早点睡，祝您好梦连连，安心踏实！🌙✨',
      es: 'Duerme tranquila esta noche, abuelita. Sueña con flores y mañanas soleadas. 🌙✨',
      ja: 'おばあちゃん、今夜はゆっくり休んでね。良い夢を見てね。🌙✨',
      ko: '할머니 오늘 밤 편안히 주무세요. 달콤하고 좋은 꿈 꾸시길 바라요. 🌙✨',
      fr: 'Dors paisiblement ce soir grand-mère. Fais de doux rêves fleuris. 🌙✨',
      vi: 'Bà ngủ thật ngon giấc tối nay nhé. Chúc bà có những giấc mơ thật đẹp! 🌙✨',
    },
  },
];

// Offline translation lookup table for instant high-speed fallback
const DICTIONARY_MAP: Record<string, Record<SupportedLanguage, string>> = {
  'hello': {
    en: 'Hello',
    'zh-HK': '你好',
    'zh-CN': '你好',
    es: 'Hola',
    ja: 'こんにちは',
    ko: '안녕하세요',
    fr: 'Bonjour',
    vi: 'Xin chào',
  },
  'hi grandma': {
    en: 'Hi Grandma',
    'zh-HK': '外婆好',
    'zh-CN': '外婆好',
    es: 'Hola abuela',
    ja: 'おばあちゃん、こんにちは',
    ko: '할머니 안녕하세요',
    fr: 'Bonjour grand-mère',
    vi: 'Cháu chào bà',
  },
  'good morning': {
    en: 'Good morning',
    'zh-HK': '早晨',
    'zh-CN': '早上好',
    es: 'Buenos días',
    ja: 'おはようございます',
    ko: '좋은 아침이에요',
    fr: 'Bonjour',
    vi: 'Chào buổi sáng',
  },
  'good night': {
    en: 'Good night',
    'zh-HK': '早抖，晚安',
    'zh-CN': '晚安',
    es: 'Buenas noches',
    ja: 'おやすみなさい',
    ko: '안녕히 주무세요',
    fr: 'Bonne nuit',
    vi: 'Chúc ngủ ngon',
  },
  'happy birthday': {
    en: 'Happy Birthday',
    'zh-HK': '生日快樂',
    'zh-CN': '生日快乐',
    es: 'Feliz cumpleaños',
    ja: 'お誕生日おめでとう',
    ko: '생일 축하해요',
    fr: 'Joyeux anniversaire',
    vi: 'Chúc mừng sinh nhật',
  },
  'i love you': {
    en: 'I love you',
    'zh-HK': '我好愛您',
    'zh-CN': '我很爱您',
    es: 'Te quiero mucho',
    ja: '大好きですよ',
    ko: '사랑해요',
    fr: 'Je t’aime fort',
    vi: 'Cháu yêu bà nhiều',
  },
  'i miss you': {
    en: 'I miss you so much',
    'zh-HK': '我好掛住您',
    'zh-CN': '我好想念您',
    es: 'Te extraño mucho',
    ja: 'とても会いたいです',
    ko: '정말 보고 싶어요',
    fr: 'Tu me manques beaucoup',
    vi: 'Cháu nhớ bà nhiều lắm',
  },
  'thank you': {
    en: 'Thank you',
    'zh-HK': '多謝您',
    'zh-CN': '谢谢您',
    es: 'Muchas gracias',
    ja: 'ありがとうございます',
    ko: '감사합니다',
    fr: 'Merci beaucoup',
    vi: 'Cảm ơn bà nhiều',
  },
  'take care': {
    en: 'Take good care of yourself',
    'zh-HK': '保重身體呀',
    'zh-CN': '多保重身体',
    es: 'Cuídate mucho',
    ja: 'お体を大切にしてくださいね',
    ko: '몸조리 잘 하세요',
    fr: 'Prends bien soin de toi',
    vi: 'Bà giữ gìn sức khỏe nhé',
  },
  'drink water': {
    en: 'Remember to drink warm water',
    'zh-HK': '記得多飲溫水呀',
    'zh-CN': '记得多喝温水',
    es: 'Recuerda beber agua tibia',
    ja: '温かいお水を飲んでね',
    ko: '따뜻한 물 자주 드세요',
    fr: "Pense à boire de l'eau tiède",
    vi: 'Nhớ uống nước ấm nhé bà',
  },
};

/**
 * Translates text from one supported language to another.
 * First tries the full-stack server endpoint (/api/translate) powered by Gemini API.
 * If server is offline or fails, falls back immediately to our intelligent family dictionary engine.
 */
export async function translateText(
  text: string,
  fromLang: SupportedLanguage | 'auto',
  toLang: SupportedLanguage
): Promise<{ translatedText: string; provider: 'gemini' | 'offline-rules' }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translatedText: '', provider: 'offline-rules' };
  }

  // Resolve 'auto' language detection if needed
  let resolvedFrom: SupportedLanguage = fromLang === 'auto' ? 'en' : fromLang;
  if (fromLang === 'auto') {
    const hasChinese = /[\u4e00-\u9fa5]/.test(trimmed);
    if (hasChinese) {
      resolvedFrom = 'zh-HK';
    } else {
      resolvedFrom = toLang === 'en' ? 'zh-HK' : 'en';
    }
  }

  if (resolvedFrom === toLang) {
    return { translatedText: trimmed, provider: 'offline-rules' };
  }

  // 1. Try server-side Gemini API route
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        from: resolvedFrom,
        to: toLang,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.translatedText && typeof data.translatedText === 'string') {
        return {
          translatedText: data.translatedText,
          provider: 'gemini',
        };
      }
    }
  } catch (err) {
    // Network or server timeout: fallback to offline engine
    console.debug('Translate API unreachable, using local rules fallback', err);
  }

  // 2. Offline Rule-based & Preset Dictionary Fallback
  return {
    translatedText: translateOffline(trimmed, resolvedFrom, toLang),
    provider: 'offline-rules',
  };
}

/**
 * Offline rule-based translation fallback
 */
export function translateOffline(
  text: string,
  fromLang: SupportedLanguage,
  toLang: SupportedLanguage
): string {
  const clean = text.toLowerCase().trim();

  // Check direct preset phrases
  for (const phrase of FAMILY_PHRASES) {
    const sourceVal = phrase.translations[fromLang]?.toLowerCase().trim();
    if (sourceVal && (clean === sourceVal || clean.includes(sourceVal) || sourceVal.includes(clean))) {
      return phrase.translations[toLang] || text;
    }
  }

  // Check dictionary words
  for (const [key, mapping] of Object.entries(DICTIONARY_MAP)) {
    if (clean === key || clean.includes(key)) {
      return mapping[toLang] || text;
    }
  }

  // If no direct match, provide a graceful localized placeholder/wrapper
  const prefixMap: Record<SupportedLanguage, string> = {
    en: 'Translation',
    'zh-HK': '翻譯',
    'zh-CN': '翻译',
    es: 'Traducción',
    ja: '翻訳',
    ko: '번역',
    fr: 'Traduction',
    vi: 'Bản dịch',
  };

  return text;
}

/**
 * Browser Speech Recognition Helper
 */
export class SpeechRecognizer {
  private recognition: any = null;
  public isSupported: boolean = false;
  public isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public start(
    langCode: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ) {
    if (!this.isSupported || !this.recognition) {
      onError('Speech recognition is not supported in this browser environment');
      return;
    }

    try {
      this.recognition.lang = langCode;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        onResult(text, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(e?.message || 'Failed to start microphone');
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
    }
    this.isListening = false;
  }
}
