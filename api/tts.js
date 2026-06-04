export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) {
        console.error("TTS Hata: HF_TOKEN eksik!");
        return res.status(500).json({ error: 'HF_TOKEN is not configured.' });
    }

    try {
        console.log("TTS isteği atılıyor, metin:", text);
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/mms-tts-tur",
            {
                headers: { "Authorization": `Bearer ${token.trim()}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ inputs: text }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("TTS API Hatası:", response.status, errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav'); // MMS modeli wav döndürür
        return res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("TTS Catch Bloğu:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
