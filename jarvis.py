import os
import requests
# BU KÜTÜPHANE ŞART: .env dosyasını sisteme yükler
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Sosisli, pip install python-dotenv yazman lazım!")

# .env'den anahtarı çekiyoruz
API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini 3.0 Flash (En yeni, en hızlı versiyon)
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key={API_KEY}"

def jarvis_sor(soru):
    if not API_KEY:
        return "Jarvis: Sosisli, anahtarı hala göremiyorum. .env dosyasını kontrol et!"
    
    payload = {
        "contents": [{"parts": [{"text": f"Sen Jarvis'sin. Kullanıcın Sosisli ile konuşuyorsun: {soru}"}]}]
    }
    
    response = requests.post(URL, json=payload)
    
    if response.status_code == 200:
        return response.json()['candidates'][0]['content']['parts'][0]['text']
    else:
        # Hata 400 veriyorsa anahtar yanlış, 404 veriyorsa model ismi yanlıştır
        return f"Hata oluştu! Kod: {response.status_code} - Mesaj: {response.text}"

print("--- Jarvis Başlatılıyor ---")
while True:
    soru = input("Sosisli: ")
    if soru.lower() in ["kapat", "çık"]:
        break
    print("Jarvis:", jarvis_sor(soru))

