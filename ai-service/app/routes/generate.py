from flask import Blueprint, request, jsonify
from app.services.gpt_service import generate_itinerary
import json
import re

generate_bp = Blueprint("generate", __name__)

@generate_bp.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()

    if not data or "prompt" not in data:
        return jsonify({
            "success": False,
            "error": "Prompt is required"
        }), 400

    prompt_text = str(data.get("prompt", ""))
    print(f"📥 Generating itinerary for prompt: {prompt_text[:120]}...")

    try:
        ai_output = generate_itinerary(prompt_text)

        if isinstance(ai_output, (dict, list)):
            itinerary = ai_output
        else:
            clean_text = str(ai_output).strip()
            # Strip markdown code blocks if present
            if clean_text.startswith("```"):
                clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text, flags=re.IGNORECASE)
                clean_text = re.sub(r"\s*```$", "", clean_text)
                clean_text = clean_text.strip()

            try:
                itinerary = json.loads(clean_text)
            except json.JSONDecodeError:
                # Fallback regex search for array or object
                match = re.search(r"(\[[\s\S]*\]|\{[\s\S]*\})", clean_text)
                if not match:
                    raise ValueError(f"AI response did not contain valid JSON format: {clean_text[:200]}")
                itinerary = json.loads(match.group(1))

        # If itinerary is wrapped in a dict like {"itinerary": [...]}, unwrap
        if isinstance(itinerary, dict) and "itinerary" in itinerary and isinstance(itinerary["itinerary"], list):
            itinerary = itinerary["itinerary"]

        print(f"✅ Itinerary successfully prepared. Returning to client.")
        return jsonify({
            "success": True,
            "itinerary": itinerary
        }), 200

    except Exception as e:
        print("🔥 GENERATION ERROR:", repr(e))
        import traceback
        try:
            with open("flask_error_log.txt", "w", encoding="utf-8") as f:
                f.write(repr(e) + "\n")
                f.write(traceback.format_exc())
                f.write("\nPrompt was: " + prompt_text)
        except Exception:
            pass
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
