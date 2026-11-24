const buildTravelPrompt = ({
  destination,
  duration,
  budget,
  travelType,
  numberOfTravelers = 1,
  activities = [],
  interests = [],
  nearbyDestinations = []
}) => {
  const activitiesStr = Array.isArray(activities) && activities.length > 0
    ? activities.join(", ")
    : (typeof activities === "string" && activities ? activities : "Sightseeing, Local exploration");

  const interestsStr = Array.isArray(interests) && interests.length > 0
    ? interests.join(", ")
    : (typeof interests === "string" && interests ? interests : "Culture, Food, Nature");

  const nearbyList = Array.isArray(nearbyDestinations)
    ? nearbyDestinations.filter(Boolean)
    : (typeof nearbyDestinations === "string" && nearbyDestinations ? [nearbyDestinations] : []);

  const destinationStatement = nearbyList.length > 0
    ? `${destination} and nearby destination(s): ${nearbyList.join(", ")}`
    : destination;

  return `
Create a ${duration}-day personalized travel itinerary for ${destinationStatement}.
Total trip budget: ₹${budget}.
Number of travelers: ${numberOfTravelers}.
Travel type: ${travelType}.
Preferred activities: ${activitiesStr}.
Interests: ${interestsStr}.
${nearbyList.length > 0 ? `Important: The traveler wants to experience BOTH ${destination} and nearby stop(s) ${nearbyList.join(", ")}. Distribute the days smoothly across both locations including scenic transit highlights.` : ""}

Requirements:
- Realistic day-by-day plan with specific times and places
- Entry fees, food expenses, and travel/transit expenses in Indian Rupees (₹)
- Explicit budget breakdown for every day: MUST include explicit travel/commute expense ("transport"), accommodation ("stay"), dining ("food"), sightseeing ("activities"), and "miscellaneous"
- If the total budget (₹${budget}) is too low for a ${duration}-day trip with ${numberOfTravelers} traveler(s) (minimum recommended ~₹1,500/day/traveler), return status "invalid_request"
- Strict adherence to total budget ₹${budget}
`;
};

export default buildTravelPrompt;
