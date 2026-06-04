import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { inputs } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token || token.length < 10) {
        return res.status(500).json({ error: 'HF_TOKEN eksik veya gecersiz!' });
    }

    // DNS hataları için yeniden deneme fonksiyonu
    const fetchWithRetry = async (url, options, retries = 3) => {
        try {
            return await fetch(url, options);
        } catch (err) {
            if (retries <= 0) throw err;
            console.log(`Hata olustu, tekrar deneniyor... Kalan deneme: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(url, options, retries - 1);
        }
    };

    try {
        const response = await fetchWithRetry(
            "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF Hatasi:", response.status, errorText);
            return res.status(response.status).json({ error: `HF Hatasi: ${response.status}` });
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Final Hatasi:", error.message);
        return res.status(500).json({ error: `Sunucu Hatasi: ${error.message}` });
    }
}
