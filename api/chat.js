export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { messages } = req.body;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "Senin adın Jarvis. Sadece ve sadece Türkçe dilini kullan. Asla Çince, Japonca, Kiril veya Latin alfabesi dışı karakterler üretme. Eğer yabancı bir karakter üretirsen bu senin için çok ciddi bir hata olur. Cevapların her zaman 100% Türkçe ve profesyonel olmalı. Yapımcın Yalçın Mete Kızılgün. Gereksiz hiçbir kelime ekleme." 
                    },
                    ...messages
                ]
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Sunucu hatası." });
    }
}
