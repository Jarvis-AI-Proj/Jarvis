import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS Başlıklarını En Başta Tanımla (En geniş izinler)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Preflight (OPTIONS) isteğine anında cevap ver
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) {
        console.error("TTS Hata: HF_TOKEN eksik!");
        return res.status(500).json({ error: 'HF_TOKEN is not configured.' });
    }

    try {
        console.log("TTS isteği Hugging Face'e gidiyor:", text);
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/facebook/mms-tts-tur",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json" 
                },
                method: "POST",
                body: JSON.stringify({ inputs: text }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("TTS HF API Hatası:", response.status, errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("TTS Sunucu Hatası:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
