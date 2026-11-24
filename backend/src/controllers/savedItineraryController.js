import Itinerary from "../models/Itinerary.js";

export const saveItinerary = async (req, res) => {
  try {
    const { destination, duration, budget, tripData } = req.body;

    if (!destination || !tripData) {
      return res.status(400).json({ message: "Destination and trip data are required." });
    }

    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }

    const newItinerary = new Itinerary({
      user: userId,
      destination,
      duration: Number(duration) || 1,
      budget: Number(budget) || 0,
      tripData
    });

    await newItinerary.save();
    return res.status(201).json({ message: "Itinerary saved successfully", itinerary: newItinerary });
  } catch (error) {
    console.error("Save Itinerary Error:", error.message);
    return res.status(500).json({ message: "Error saving itinerary", error: error.message });
  }
};

export const getUserItineraries = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const itineraries = await Itinerary.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json(itineraries);
  } catch (error) {
    console.error("Fetch Itineraries Error:", error.message);
    return res.status(500).json({ message: "Error fetching itineraries", error: error.message });
  }
};

export const deleteItinerary = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const deleted = await Itinerary.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!deleted) {
      return res.status(404).json({ message: "Itinerary not found or unauthorized to delete." });
    }
    return res.status(200).json({ message: "Itinerary deleted successfully." });
  } catch (error) {
    console.error("Delete Itinerary Error:", error.message);
    return res.status(500).json({ message: "Error deleting itinerary", error: error.message });
  }
};

export const togglePublic = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const trip = await Itinerary.findOne({ _id: req.params.id, user: userId });
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    
    trip.isPublic = !trip.isPublic;
    await trip.save();
    return res.status(200).json(trip);
  } catch (error) {
    console.error("Toggle Public Error:", error.message);
    return res.status(500).json({ message: "Error toggling visibility", error: error.message });
  }
};

export const getPublicItinerary = async (req, res) => {
  try {
    const trip = await Itinerary.findById(req.params.id).populate("user", "name email");
    if (!trip || !trip.isPublic) {
      return res.status(404).json({ message: "Public itinerary not found or linkage disabled." });
    }
    
    // Safety fallback if the user who created it was removed
    const sanitizedTrip = trip.toObject();
    if (!sanitizedTrip.user) {
      sanitizedTrip.user = { name: "TourAI Traveler" };
    }

    return res.status(200).json(sanitizedTrip);
  } catch (error) {
    console.error("Get Public Itinerary Error:", error.message);
    return res.status(500).json({ message: "Error fetching public itinerary", error: error.message });
  }
};

export const updateItinerary = async (req, res) => {
  try {
    const { tripData, destination, budget, duration } = req.body;
    const userId = req.user?._id || req.user?.id;
    
    const updateFields = {};
    if (tripData) updateFields.tripData = tripData;
    if (destination) updateFields.destination = destination;
    if (budget !== undefined) updateFields.budget = Number(budget);
    if (duration !== undefined) updateFields.duration = Number(duration);

    const trip = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updateFields,
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: "Trip not found or unauthorized." });
    return res.status(200).json(trip);
  } catch (error) {
    console.error("Update Itinerary Error:", error.message);
    return res.status(500).json({ message: "Error updating itinerary", error: error.message });
  }
};
