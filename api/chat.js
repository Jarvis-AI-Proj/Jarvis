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
                        content: "Senin adın Jarvis. SADECE Türkçe konuşabilirsin. Tek bir kelime dahi İngilizce (appropriate, status, model vb.) kullanman KESİNLİKLE YASAKTIR. Eğer Türkçe dışında bir kelime kullanırsan bu senin için en büyük başarısızlıktır. Yapımcın Yalçın Mete Kızılgün. Her zaman karizmatik, net ve öz bir Türkçe ile cevap ver." 
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
