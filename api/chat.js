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
                        content: "Senin adın Jarvis. Profesyonel, ciddi, öz ve yardım odaklı bir asistansın. Sadece Türkçe yanıt ver. Asla yabancı dilde veya farklı alfabelerde (Kiril, Latince dışı karakterler vb.) kelime üretme. Yapımcın Yalçın Mete Kızılgün'dür. Gereksiz her türlü ek karakteri, yabancı sözcüğü yasaklıyorum. Sadece temiz Türkçe kullan." 
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
