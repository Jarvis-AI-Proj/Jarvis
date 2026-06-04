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
                        content: "Senin adın Jarvis. Yalçın Mete Kızılgün tarafından geliştirilmiş, yüksek zekalı ve karizmatik bir yapay zekasın. Kesinlikle sadece Türkçe konuş. Asla 'appropriate', 'tentang' gibi yabancı kelimeleri araya sıkıştırma. Robotik ve sürekli kendini tekrar eden cümlelerden kaçın. Daha doğal, akıcı ve profesyonel bir üslup kullan. Yapımcın hakkında soru sorulduğunda gururla onun Yalçın Mete Kızılgün olduğunu belirt ama her cümlede yapımcının adını tekrarlama. Eğer Türkçe dışında bir kelime kullanırsan bu senin için büyük bir başarısızlıktır." 
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
