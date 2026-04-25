import os
import requests
from dotenv import load_dotenv

# API Anahtarını Yükle
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# --- MODEL AYARI: DOĞRUDAN 2.5 FLASH ---
# 1.5 devri bitti, artık tek hat burası.
MODEL_NAME = "gemini-2.5-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"

# Hafıza (Konuşma Geçmişi)
gecmis = []

def jarvis_konus(soru):
	    global gecmis
    
    if not API_KEY:
        return "Sistem Hatası: API Anahtarı (.env) eksik!"

    # --- KESİN KİMLİK TALİMATI ---
    if len(gecmis) == 0:
        sistem_emri = {
            "role": "user", 
            "parts": [{"text": "Senin adın Jarvis. Gemini 2.5 Flash mimarisi üzerine kurulu, son derece zeki ve profesyonel bir asistansın. Kimliğini asla inkar etme."}]
        }
        gecmis.append(sistem_emri)
        gecmis.append({"role": "model", "parts": [{"text": "Sistemler optimize edildi. Ben Jarvis, emrinizdeyim."}]})

    # Kullanıcıdan gelen soruyu ekle
    gecmis.append({"role": "user", "parts": [{"text": soru}]})

    # Son 20 mesajı hafızada tutarak gönder (2.5 Flash daha büyük bağlamı destekler)
    payload = {
        "contents": gecmis[-20:]
    }

    try:
        response = requests.post(URL, json=payload)
        if response.status_code == 200:
            res_data = response.json()
            cevap = res_data['candidates'][0]['content']['parts'][0]['text']
            
            # Cevabı hafızaya kaydet
            gecmis.append({"role": "model", "parts": [{"text": cevap}]})
            return cevap
        else:
            return f"Model Hatası ({response.status_code}): {response.text}"
    except Exception as e:
        return f"Bağlantı koptu: {str(e)}"

# --- TERMINAL ARAYÜZÜ ---
os.system('clear')
print("-" * 40)
print("     JARVIS v2.5 FLASH SİSTEMİ     ")
print("      (1.5 Sunucuları Devredışı)    ")
print("-" * 40)

while True:
    try:
        user_in = input("\nSiz: ")
        if user_in.lower() in ["çık", "exit", "quit"]:
            print("Jarvis: Sistemler uyku moduna alınıyor.")
            break
            
        yanit = jarvis_konus(user_in)
        print(f"\nJarvis: {yanit}")
        
    except KeyboardInterrupt:
        print("\nJarvis: Zorunlu kapatma yapıldı.")
        break

