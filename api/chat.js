export default async function handler(req, res) {
    // CORS Ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Hata ayıklama: Body var mı yok mu kontrol et
    if (req.method === 'POST') {
        try {
            // Vercel bazen body'i string olarak gönderebilir, onu objeye çevirelim
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const messages = body?.messages;

            if (!messages) {
                return res.status(400).json({ error: "Mesajlar bulunamadı. Lütfen JSON formatını kontrol et." });
            }

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: messages
                })
            });

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            console.error("Detaylı Hata:", error.message);
            return res.status(500).json({ error: "Sunucu hatası: " + error.message });
        }
    }

    return res.status(405).json({ error: "Yalnızca POST desteklenir." });
}
