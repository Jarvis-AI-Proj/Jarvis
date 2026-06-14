import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { image, prompt } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) return res.status(500).json({ error: 'HF_TOKEN eksik!' });
    if (!image || !prompt) return res.status(400).json({ error: 'Resim ve talimat gerekli!' });

    try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    image: base64Data,
                    parameters: { strength: 0.7 } // Orijinal resme sadık kalma oranı
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: `HF Hatası: ${response.status}` });
        }

        const resultBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(resultBuffer));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
