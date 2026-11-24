import express from "express";
import { generateItinerary } from "../controllers/itineraryController.js";
import { saveItinerary, getUserItineraries, deleteItinerary, togglePublic, getPublicItinerary, updateItinerary } from "../controllers/savedItineraryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* 🌍 PUBLIC ROUTE (No Auth) */
router.get("/public/:id", getPublicItinerary);

/* 🔒 PROTECTED ROUTES */
router.post("/generate", authMiddleware, generateItinerary);
router.post("/save", authMiddleware, saveItinerary);
router.get("/my-trips", authMiddleware, getUserItineraries);
router.patch("/toggle-public/:id", authMiddleware, togglePublic);
router.patch("/update-data/:id", authMiddleware, updateItinerary);
router.delete("/:id", authMiddleware, deleteItinerary);

export default router;
