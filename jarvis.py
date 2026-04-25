import os
import requests
from dotenv import load_dotenv

# .env dosyasındaki API anahtarını yükle
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini 2.5 Flash API URL (Bölgeye göre v1beta kullanımı)
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

# Hafıza listesi
gecmis = []

def jarvis_konus(soru):
    global gecmis
    
    if not API_KEY:
        return "Hata: .env dosyasında GEMINI_API_KEY bulunamadı!"

    # --- KİMLİK VE HAFIZA AYARI ---
    # Eğer konuşma yeni başlıyorsa Jarvis'e kim olduğunu tembihle
    if len(gecmis) == 0:
        talimat = (
            "Senin adın Jarvis. Sen benim kişisel asistanımsın. "
            "Asla 'bir dil modeliyim' gibi ifadeler kullanma. "
            "Her zaman profesyonel, zeki ve yardımcı ol. "
            "Cevaplarını kısa, öz ve etkili tut."
        )
        gecmis.append({"role": "user", "parts": [{"text": talimat}]})
        gecmis.append({"role": "model", "parts": [{"text": "Anlaşıldı. Ben Jarvis, sistemler aktif. Size nasıl yardımcı olabilirim?"}]})

    # Kullanıcı mesajını hafızaya ekle
    gecmis.append({"role": "user", "parts": [{"text": soru}]})

    # API isteği (Hafızadaki son 15 mesajı gönderir)
    payload = {
        "contents": gecmis[-15:]
    }

    try:
        response = requests.post(URL, json=payload)
        if response.status_code == 200:
            result = response.json()
            cevap = result['candidates'][0]['content']['parts'][0]['text']
            
            # Jarvis'in cevabını hafızaya ekle
            gecmis.append({"role": "model", "parts": [{"text": cevap}]})
            return cevap
        else:
            return f"API Hatası ({response.status_code}): {response.text}"
    except Exception as e:
        return f"Bağlantı Hatası: {str(e)}"

# --- ANA DÖNGÜ ---
os.system('clear') # Ekranı temizle
print("====================================")
print("   JARVIS v2.5 SİSTEMİ BAŞLATILDI   ")
print("====================================")
print("Çıkmak için 'çık' yazabilirsin.\n")

while True:
    kullanici_input = input("Siz: ")
    
    if kullanici_input.lower() in ["çık", "exit", "quit", "kapat"]:
        print("\nJarvis: Sistemler kapatılıyor. İyi günler.")
        break
    
    # Cevabı al ve ekrana yazdır
    yanit = jarvis_konus(kullanici_input)
    print(f"\nJarvis: {yanit}\n")
