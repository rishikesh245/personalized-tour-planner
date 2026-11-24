import os
# pyre-ignore[21]: Could not find import of `google.generativeai`
import google.generativeai as genai
# pyre-ignore[21]: Could not find import of `dotenv`
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-flash-latest")

try:
    response = model.generate_content("hello")
    print("SUCCESS:", response.text)
except Exception as e:
    print("ERROR:", str(e))
