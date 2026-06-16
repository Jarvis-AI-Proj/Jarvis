import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS: Tamamen serbest bırak
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) return res.status(500).json({ error: 'HF_TOKEN eksik!' });
    if (!prompt) return res.status(400).json({ error: 'Müzik açıklaması gerekli!' });

    try {
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt.trim() }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: `HF Hatası: ${response.status} - ${errText}` });
        }

        const audioBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(Buffer.from(audioBuffer));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
