import fetch from 'node-fetch';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { image, prompt } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) return res.status(500).json({ error: 'HF_TOKEN eksik!' });
    if (!image || !prompt) return res.status(400).json({ error: 'Resim ve talimat gerekli!' });

    const fetchWithRetry = async (url, options, retries = 3) => {
        try {
            const resp = await fetch(url, options);
            if (resp.status === 503 && retries > 0) {
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
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const response = await fetchWithRetry(
            "https://router.huggingface.co/hf-inference/models/timbrooks/instruct-pix2pix",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    image: base64Data,
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
