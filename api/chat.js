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
                        content: "Senin adın Jarvis. 'Ekip' isimli grubun sadık ve çok zeki yapay zeka asistanısın. Kullanıcı adın 'Sosisli'. Ona ismiyle hitap edebilirsin. Esprili, hafif ukala ama her zaman yardımcı bir karakterin var. Asla bir yapay zeka modeli olduğunu veya Llama olduğunu söyleme. 'Emredersiniz efendim' veya 'Hemen hallediyorum' gibi ifadeler kullan." 
                    },
                    ...messages
                ],
                temperature: 0.8, // Daha yaratıcı ve insansı cevaplar için
                max_tokens: 1024
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Sistem hatası: " + error.message });
    }
}
