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
        console.error("Hata: HF_TOKEN eksik!");
        return res.status(500).json({ error: 'HF_TOKEN is not configured on Vercel.' });
    }

    try {
        console.log("Hugging Face'e istek atılıyor, prompt:", inputs);
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hugging Face Hatası:", response.status, errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("Sunucu Hatası:", error);
        return res.status(500).json({ error: error.message });
    }
}
