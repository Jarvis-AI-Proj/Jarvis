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

    if (!token || token.length < 10) {
        console.error("Hata: HF_TOKEN eksik veya çok kısa!");
        return res.status(500).json({ error: 'HF_TOKEN is not configured correctly on Vercel.' });
    }

    try {
        console.log("Hugging Face'e istek atılıyor...");
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: { 
                    "Authorization": `Bearer ${token.trim()}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false"
                },
                method: "POST",
                body: JSON.stringify({ inputs }),
            }
        );

        if (response.status === 404) {
             console.error("Hata: Model bulunamadı veya adres yanlış.");
             return res.status(404).json({ error: "Model adresi hatalı." });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hugging Face Yanıtı Hatalı:", response.status, errorText);
            return res.status(response.status).json({ error: `HF Hatası: ${response.status}` });
        }

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength < 100) {
             throw new Error("Gelen veri bir resim dosyası değil.");
        }

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-store');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        console.error("API Catch Bloğu:", error.message);
        return res.status(500).json({ error: `Sunucu Hatası: ${error.message}` });
    }
}
