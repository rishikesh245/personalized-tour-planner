import sys
import traceback

try:
    # pyre-ignore[21]
    from app.services.gpt_service import generate_itinerary
    print("Testing generate_itinerary...")
    res = generate_itinerary("I want to go to Paris for 3 days with a budget of 50000 INR")
    print("SUCCESS")
    print(res)
except Exception as e:
    print("FAILED")
    traceback.print_exc()
