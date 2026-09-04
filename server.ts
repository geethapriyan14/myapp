import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Translation API using Gemini API
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, from, to } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text string is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return gracefully so client-side fallback can handle seamlessly
        return res.json({
          translatedText: null,
          fallbackRequired: true,
          message: 'No GEMINI_API_KEY configured; using offline family dictionary engine.',
        });
      }

      // Lazy import and initialization of GoogleGenAI
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are an expert bilingual family interpreter for an elder care app named "Together".
Translate the following text from ${from || 'auto-detect'} to ${to || 'English'}.
Guidelines:
1. Maintain elder warmth, natural generational kindness, and filial respect.
2. If translating to Cantonese or Chinese, use natural Cantonese / Chinese conversational phrasing suitable for talking with a grandmother.
3. Keep emojis, punctuation, numbers, and proper names intact.
4. Output ONLY the translated text string. Do NOT add explanations, notes, or quotes.

Text to translate:
${text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const translatedText = response.text?.trim() || text;
      return res.json({
        translatedText,
        sourceText: text,
        from,
        to,
      });
    } catch (err: any) {
      console.error('Gemini translate error:', err);
      // Return 200 with fallback flag so frontend gracefully continues
      return res.json({
        translatedText: null,
        fallbackRequired: true,
        error: err?.message || 'Gemini service error',
      });
    }
  });

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Together server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
