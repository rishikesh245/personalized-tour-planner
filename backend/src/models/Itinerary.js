import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  destination: String,
  duration: Number,
  budget: Number,
  tripData: {
    type: Object, // Stores the AI generated JSON array/object
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);
export default Itinerary;
