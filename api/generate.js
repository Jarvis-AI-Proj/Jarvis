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

    if (!token) {
        return res.status(500).json({ error: 'HF_TOKEN is not configured on Vercel.' });
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'API Error' }));
            return res.status(response.status).json(error);
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
