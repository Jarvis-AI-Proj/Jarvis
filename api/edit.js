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

    try {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        
        // DOĞRU PAYLOAD FORMATI: { "inputs": image, "parameters": { "prompt": prompt } }
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/timbrooks/instruct-pix2pix",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: base64Data,
                    parameters: { prompt: prompt.trim() }
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: `HF Hatası (${response.status}): ${errText}` });
        }

        const resultBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(resultBuffer));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
