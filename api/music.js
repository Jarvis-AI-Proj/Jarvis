import fetch from 'node-fetch';

export default async function handler(req, res) {
    // TAM ÖZGÜRLÜK (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const apiKey = process.env.HF_TOKEN;

    if (!apiKey) return res.status(500).json({ error: 'API Anahtarı eksik!' });
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
        return res.status(200).json(data);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
