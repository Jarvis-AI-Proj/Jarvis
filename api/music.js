import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const apiKey = process.env.HF_TOKEN; // Replicate anahtarını Vercel'de buraya yaz

    if (req.method === 'GET') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID gerekli' });
        try {
            const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
                headers: { "Authorization": `Token ${apiKey.trim()}` }
            });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (e) { return res.status(500).json({ error: e.message }); }
    }

    if (req.method === 'POST') {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt gerekli' });

        try {
            const response = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${apiKey.trim()}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    version: "b05b1d43c2c19e5E7c7a5270275a5078a63212871f37e556e4c73950269389f4",
                    input: { prompt: prompt.trim(), duration: 8 }
                })
            });
            const data = await response.json();
            if (!response.ok) return res.status(response.status).json(data);
            return res.status(200).json(data);
        } catch (e) { return res.status(500).json({ error: e.message }); }
    }
}
