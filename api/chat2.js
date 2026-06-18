import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// CORS başlıkları (HTML arayüzünden sorunsuz bağlanabilmen için)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Tarayıcıların ön kontrol (Preflight) isteklerini onaylamak için OPTIONS fonksiyonu
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Geçersiz veya eksik mesaj formatı.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Sanovic Sistem Mesajı ve Kişiliği
    const systemMessage = {
      role: 'system',
      content: 'Senin adın Sanovic. Groq altyapısıyla çalışan, OpenAI modelleri dışındaki en gelişmiş mimariye sahip, son derece profesyonel ve analitik bir yapay zeka asistanısın. Karmaşık problemleri çözer, yazılım, veri analizi ve stratejik işlerde kullanıcıya en üst düzeyde, net ve profesyonel bir dille yardımcı olursun.'
    };

    const fullMessages = [systemMessage, ...messages];

    // Llama 4 Scout Modeli Entegrasyonu
    const chatCompletion = await groq.chat.completions.create({
      messages: fullMessages,
      model: 'llama-4-scout-17bx16e', 
      temperature: 0.3, 
      max_tokens: 4096,
      top_p: 1,
      stream: false, 
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Bir hata oluştu.';

    // Başarılı yanıtı CORS başlıklarıyla döndürüyoruz
    return NextResponse.json({ reply }, { headers: corsHeaders });

  } catch (error) {
    console.error('Sanovic AI Hatası (Chat2.js):', error);
    return NextResponse.json(
      { error: 'Sunucu tarafında bir hata meydana geldi.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
