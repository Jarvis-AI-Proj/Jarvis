import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) return res.status(500).json({ error: 'HF_TOKEN eksik!' });
    if (!prompt) return res.status(400).json({ error: 'Müzik açıklaması gerekli!' });

    // Yeniden deneme mekanizması (Hızı artırır ve hataları önler)
    const fetchWithRetry = async (url, options, retries = 2) => {
        try {
            const resp = await fetch(url, options);
            if (resp.status === 503 && retries > 0) {
                console.log("Müzik modeli yükleniyor, tekrar deneniyor...");
                await new Promise(resolve => setTimeout(resolve, 3000));
                return fetchWithRetry(url, options, retries - 1);
            }
            return resp;
        } catch (err) {
            if (retries <= 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 3000));
            return fetchWithRetry(url, options, retries - 1);
        }
    };

    try {
        const response = await fetchWithRetry(
            "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HF Hatası: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error("Müzik Hatası:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
