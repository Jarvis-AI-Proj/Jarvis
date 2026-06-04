import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) return res.status(500).json({ error: 'HF_TOKEN is not configured.' });

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/Ozen/vits-tts-tr",
            {
                headers: { "Authorization": `Bearer ${token.trim()}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ inputs: text }),
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: "Hugging Face hatası" }));
            return res.status(response.status).json(err);
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
