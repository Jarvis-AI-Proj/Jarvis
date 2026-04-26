export default async function handler(req, res) {
    // CORS Ayarları - HTML'den erişim sağlamak için şart
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Tarayıcı ön kontrolü (OPTIONS) için boş cevap dön
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Basit bir test için GET isteği yaparsan çalışıp çalışmadığını söyler
    if (req.method === 'GET') {
        return res.status(200).json({ status: "Jarvis tüneli aktif, mesaj bekliyor!" });
    }

    // Sadece POST isteklerini işle
    if (req.method === 'POST') {
        try {
            const { messages } = req.body;

            // Eğer mesaj gelmemişse hata ver
            if (!messages || !messages.length) {
                return res.status(400).json({ error: "Mesaj içeriği eksik." });
            }

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: messages
                })
            });

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            console.error("Sistem Hatası:", error);
            return res.status(500).json({ error: "Groq'a bağlanırken bir sorun oluştu." });
        }
    }

    return res.status(405).json({ error: "Sadece POST ve GET desteklenir." });
}
