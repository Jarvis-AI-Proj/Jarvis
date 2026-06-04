import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { image, prompt } = req.body; // image: base64 string
    const token = process.env.HF_TOKEN;

    if (!token) return res.status(500).json({ error: 'HF_TOKEN eksik!' });
    if (!image || !prompt) return res.status(400).json({ error: 'Resim ve talimat gerekli!' });

    try {
        // Base64'ü temizle ve Buffer'a çevir
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const response = await fetch(
            "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    image: base64Data, // Bazı HF modelleri base64 bekler
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HF Hatası: ${response.status} - ${errText}`);
        }

        const resultBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/jpeg');
        return res.send(Buffer.from(resultBuffer));

    } catch (error) {
        console.error("Düzenleme Hatası:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
