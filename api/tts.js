import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Metin gerekli' });

    try {
        // Google TTS Hack: Hızı 0.9 yaparak daha ağır ve ciddi bir ses elde ediyoruz
        // tl=tr-TR ve client=tw-ob kombinasyonu en temiz sesi verir
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=tr&total=1&idx=0&textlen=${text.length}&client=tw-ob&prev=input&ttsspeed=0.9`;
        
        const response = await fetch(url, {
            headers: {
                'Referer': 'http://translate.google.com/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36'
            }
        });

        if (!response.ok) throw new Error('Ses motoru cevap vermedi.');

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("TTS Hatasi:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
