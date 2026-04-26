import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
# Modeli ve URL'yi en güncel haliyle sabitledik
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

os.system('clear')
print("=== JARVIS v2.5: DIRECT HTTP MODE ===")

def sor_bakalim(metin):
    # Payload'u olabildiğince küçük tutuyoruz
    payload = {
        "contents": [{"parts": [{"text": metin}]}]
    }
    
    try:
        res = requests.post(URL, json=payload)
        
        if res.status_code == 200:
            return res.json()['candidates'][0]['content']['parts'][0]['text']
        elif res.status_code == 429:
            return "[!] Limit doldu. IP adresini değiştir (Uçak modu) veya 1 dk bekle."
        else:
            return f"Hata: {res.status_code}\n{res.text}"
    except Exception as e:
        return f"Bağlantı patladı: {e}"

while True:
    soru = input("\nSiz: ")
    if soru.lower() in ["çık", "exit"]: break
    if not soru: continue
    
    print("\nJarvis: " + sor_bakalim(soru))

