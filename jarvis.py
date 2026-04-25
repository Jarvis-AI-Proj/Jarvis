import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# İŞTE O GÜNCEL KAPI: Gemini 2.5 Flash
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

gecmis = []

def jarvis_konus(soru):
    global gecmis
    if not API_KEY:
        return "Jarvis: Anahtar (.env) hatalı veya eksik!"

    gecmis.append({"role": "user", "parts": [{"text": soru}]})

    payload = {
        "contents": gecmis[-15:] # Hafızayı biraz daha genişlettik (Son 15 mesaj)
    }

    try:
        response = requests.post(URL, json=payload)
        if response.status_code == 200:
            cevap = response.json()['candidates'][0]['content']['parts'][0]['text']
            gecmis.append({"role": "model", "parts": [{"text": cevap}]})
            return cevap
        elif response.status_code == 404:
            return "Hata 404: 2.5 Flash modeli bu bölgede henüz aktif olmayabilir veya ismi değişmiş olabilir."
        else:
            return f"Hata oluştu: {response.status_code}"
    except Exception as e:
        return f"Bağlantı sorunu: {str(e)}"

print("--- Jarvis v2.5 Aktif ---")
while True:
    input_text = input("Siz: ")
    if input_text.lower() in ["çık", "quit"]:
        break
    
    print("Jarvis:", jarvis_konus(input_text))

