def format_itinerary(data):
    """
    Accepts either:
    - string (from GPT)
    - list (from fallback)
    Returns a clean list of strings
    """

    # ✅ If already a list, return as-is
    if isinstance(data, list):
        return data

    # ✅ If string, split into lines
    if isinstance(data, str):
        return [
            line.strip()
            for line in data.split("\n")
            if line.strip()
        ]

    # Safety fallback
    return []
