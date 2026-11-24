import buildTravelPrompt from "../utils/promptBuilder.js";
import callAIService from "../services/aiService.js";

export const generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      duration,
      budget,
      travelType,
      numberOfTravelers,
      activities = [],
      interests = [],
      nearbyDestinations = []
    } = req.body;

    if (
      !destination ||
      duration === undefined ||
      duration === null ||
      budget === undefined ||
      budget === null ||
      !travelType
    ) {
      return res.status(400).json({ message: "Destination, duration, budget, and travel type are required." });
    }

    // 🛑 Restrict if budget entered is too low for duration & travelers
    const numTravelers = Math.max(1, Number(numberOfTravelers) || 1);
    const numDays = Math.max(1, Number(duration) || 1);
    const minViableBudget = numDays * numTravelers * 1200;

    if (Number(budget) < minViableBudget) {
      const recommendedBudget = numDays * numTravelers * 3000;
      return res.status(200).json({
        status: "invalid_request",
        reason: `The entered budget of ₹${Number(budget).toLocaleString()} is insufficient for a ${numDays}-day journey with ${numTravelers} traveler(s). Minimum viable investment is ₹${minViableBudget.toLocaleString()} to cover travel transit, lodging, and daily meals.`,
        minimum_recommended_budget: recommendedBudget,
        suggestions: [
          `Increase your investment to at least ₹${minViableBudget.toLocaleString()} (₹1,200/day/traveler for transit & essentials).`,
          `Recommended budget for curated travel: ₹${recommendedBudget.toLocaleString()}.`,
          `Consider reducing trip duration to ${Math.max(1, Math.floor(Number(budget) / (numTravelers * 1200)))} day(s) for this budget.`
        ]
      });
    }

    const prompt = buildTravelPrompt({
      destination,
      duration,
      budget,
      travelType,
      numberOfTravelers: numberOfTravelers || 1,
      activities: Array.isArray(activities) ? activities : [activities].filter(Boolean),
      interests: Array.isArray(interests) ? interests : [interests].filter(Boolean),
      nearbyDestinations: Array.isArray(nearbyDestinations) ? nearbyDestinations : [nearbyDestinations].filter(Boolean)
    });

    // 🔥 CALL AI MICROSERVICE
    const aiResponse = await callAIService(prompt);

    let parsedResponse;
    try {
      parsedResponse =
        typeof aiResponse === "string"
          ? JSON.parse(aiResponse)
          : aiResponse;
    } catch (err) {
      console.error("Failed to parse AI response JSON:", aiResponse);
      return res.status(500).json({
        success: false,
        message: "Invalid AI response format returned from model."
      });
    }

    // ✅ CASE 1: INVALID BUDGET / REQUEST DETECTED BY AI
    if (parsedResponse && parsedResponse.status === "invalid_request") {
      return res.status(200).json(parsedResponse);
    }

    // ✅ CASE 2: DIRECT ITINERARY ARRAY
    if (Array.isArray(parsedResponse)) {
      return res.status(200).json(parsedResponse);
    }

    // ✅ CASE 3: WRAPPED OBJECT { itinerary: [...] } or { days: [...] } or { plan: [...] }
    if (parsedResponse && typeof parsedResponse === "object") {
      const arrayData = parsedResponse.itinerary || parsedResponse.days || parsedResponse.plan;
      if (Array.isArray(arrayData)) {
        return res.status(200).json(arrayData);
      }
    }

    // ❌ UNKNOWN FORMAT
    console.error("AI Response format was neither an array nor recognized wrapper:", parsedResponse);
    return res.status(500).json({
      success: false,
      message: "Unexpected AI response structure from model."
    });

  } catch (error) {
    console.error("AI GENERATION ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "AI itinerary generation failed.",
      error: error.message
    });
  }
};
