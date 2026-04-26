const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Railway Variables kısmına ekleyeceğin anahtarlar
const keys = [
    process.env.KEY_1,
    process.env.KEY_2,
    process.env.KEY_3
];

app.post('/chat', async (req, res) => {
    const { messages } = req.body;
    
    // Senin o meşhur "Sırayla Dene" mantığı burada çalışıyor
    for (let i = 0; i < keys.length; i++) {
        const activeKey = keys[i];
        if (!activeKey) continue;

        try {
            const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${activeKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: messages
                })
            });

            const data = await response.json();

            if (response.ok) {
                return res.json(data); // Çalışan anahtarı bulduk, cevabı dön
            } else if (response.status === 429) {
                console.log(`Anahtar ${i+1} yoğun, diğerine geçiliyor...`);
                continue; // Kota dolmuş, döngü devam etsin
            }
        } catch (err) {
            console.error("Hata:", err);
        }
    }
    
    res.status(429).json({ error: "Tüm hatlar şu an yoğun, biraz bekle Sosisli!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Jarvis Backend ${PORT} portunda hazır!`));

