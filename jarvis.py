import requests
import time

# Senin paylaştığın anahtar
API_KEY = "GEMINI_API_KEY"

# Model ismini GEMINI 2.0 FLASH olarak güncelledim
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

def jarvis_sor(soru):
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{
            "parts": [{"text": f"Sen Jarvis'sin. Sosisli'nin ekip arkadaşısın. Çok kısa ve öz cevap ver. Soru: {soru}"}]
        }]
    }
    
    while True:
        try:
            response = requests.post(URL, json=payload, headers=headers)
            data = response.json()
            
            if response.status_code == 200:
                return data['candidates'][0]['content']['parts'][0]['text']
            elif response.status_code == 429:
                print("Jarvis: Kota doldu, 10 saniye bekleyip tekrar deniyorum...")
                time.sleep(10)
                continue
            else:
                return f"Hata ({response.status_code}): {data.get('error', {}).get('message', 'Bilinmeyen hata')}"
        except Exception as e:
            return f"Bağlantı koptu: {e}"

print("Jarvis: Ege'yi orospu.com'dan almış- paydon.")

while True:
    istek = input("Sosisli: ")
    if not istek.strip(): continue
    if istek.lower() in ["exit", "kapat"]: break
    
    cevap = jarvis_sor(istek)
    print(f"Jarvis: {cevap}")

