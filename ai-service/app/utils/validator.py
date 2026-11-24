def validate_prompt(data):
    if not data:
        return False, "Request body is missing"

    if "prompt" not in data:
        return False, "Prompt field is required"

    if not isinstance(data["prompt"], str):
        return False, "Prompt must be a string"

    if len(data["prompt"].strip()) < 10:
        return False, "Prompt is too short"

    return True, None
