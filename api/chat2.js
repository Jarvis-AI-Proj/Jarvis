import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// CORS Başlıkları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 1. OPTIONS İsteği Kontrolü (Preflight)
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// 2. GET İsteği Kontrolü (Tarayıcıdan linke direkt tıklayınca 404 vermesin diye)
export async function GET() {
  return NextResponse.json({ status: "Sanovic API Aktif" }, { headers: corsHeaders });
}

// 3. Ana POST İsteği
export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Geçersiz format.' }, { status: 400, headers: corsHeaders });
    }

    const systemMessage = {
      role: 'system',
      content: 'Senin adın Sanovic. Profesyonel ve analitik bir yapay zeka asistanısın.'
    };

    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: 'llama-4-scout-17bx16e',
      temperature: 0.3,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Bir hata oluştu.';
    return NextResponse.json({ reply }, { headers: corsHeaders });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500, headers: corsHeaders });
  }
}
