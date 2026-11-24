import os
# pyre-ignore[21]
from dotenv import load_dotenv
load_dotenv()
key = os.getenv("GEMINI_API_KEY")
if key and isinstance(key, str):
    # pyre-ignore
    print(f"KEY FOUND: {key[:5]}...{key[-5:]}")
else:
    print("KEY NOT FOUND")
