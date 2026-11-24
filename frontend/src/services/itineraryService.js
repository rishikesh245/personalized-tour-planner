import api from "./api";

export const generateItinerary = async (tripData) => {
  const res = await api.post("/itinerary/generate", tripData);
  return res.data;
};
