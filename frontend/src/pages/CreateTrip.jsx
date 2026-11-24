import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { generateItinerary } from "../services/itineraryService";
import api from "../services/api";
import "./style.css";
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Users, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Bookmark, 
  CheckCircle,
  Clock,
  UtensilsCrossed,
  Info,
  Search,
  X,
  Compass,
  Plus,
  Trash2,
  Edit3,
  Check,
  Car,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import WeatherCard from "../components/WeatherCard";
import MapPreview from "../components/MapPreview";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// 60+ global & domestic destinations
const ALL_DESTINATIONS = [
  // India - Mountain Escapes & Nature
  "Manali, Himachal Pradesh, India",
  "Shimla, Himachal Pradesh, India",
  "Leh Ladakh, India",
  "Kashmir / Srinagar, India",
  "Dharamshala / McLeod Ganj, India",
  "Rishikesh, Uttarakhand, India",
  "Nainital, Uttarakhand, India",
  "Ooty, Tamil Nadu, India",
  "Kodaikanal, Tamil Nadu, India",
  "Munnar, Kerala, India",
  "Coorg, Karnataka, India",
  "Darjeeling, West Bengal, India",
  "Shillong, Meghalaya, India",
  "Gangtok, Sikkim, India",

  // India - Beach & Coastal
  "Goa, India",
  "Andaman & Nicobar Islands, India",
  "Gokarna, Karnataka, India",
  "Pondicherry, India",
  "Alleppey Backwaters, Kerala, India",
  "Varkala Beach, Kerala, India",

  // India - Heritage & Culture
  "Jaipur, Rajasthan, India",
  "Udaipur, Rajasthan, India",
  "Jodhpur, Rajasthan, India",
  "Jaisalmer, Rajasthan, India",
  "Varanasi, Uttar Pradesh, India",
  "Agra, Uttar Pradesh, India",
  "Hampi, Karnataka, India",
  "Amritsar, Punjab, India",
  "Mysore / Mysuru, Karnataka, India",

  // International - Europe
  "Paris, France",
  "Rome, Italy",
  "London, United Kingdom",
  "Santorini, Greece",
  "Zurich / Swiss Alps, Switzerland",
  "Barcelona, Spain",
  "Amsterdam, Netherlands",
  "Venice, Italy",
  "Florence, Italy",
  "Vienna, Austria",
  "Prague, Czech Republic",
  "Budapest, Hungary",
  "Reykjavik, Iceland",
  "Edinburgh, Scotland",

  // International - Asia & Middle East
  "Tokyo, Japan",
  "Kyoto, Japan",
  "Dubai, United Arab Emirates",
  "Bali, Indonesia",
  "Singapore",
  "Bangkok, Thailand",
  "Phuket, Thailand",
  "Seoul, South Korea",
  "Maldives",
  "Kuala Lumpur, Malaysia",
  "Hanoi, Vietnam",
  "Doha, Qatar",
  "Abu Dhabi, United Arab Emirates",
  "Istanbul, Turkey",

  // International - Americas & Oceania
  "New York City, USA",
  "Los Angeles / California, USA",
  "San Francisco, USA",
  "Honolulu, Hawaii, USA",
  "Sydney, Australia",
  "Melbourne, Australia",
  "Queenstown, New Zealand",
  "Toronto / Banff, Canada",
  "Rio de Janeiro, Brazil",
  "Cancun, Mexico"
];

// Smart nearby destination recommendations
const NEARBY_MAP = {
  "ooty": ["Mysuru", "Coonoor", "Wayanad", "Bandipur"],
  "mysuru": ["Ooty", "Coorg", "Kabini", "Belur"],
  "mysore": ["Ooty", "Coorg", "Kabini", "Belur"],
  "manali": ["Solang Valley", "Kasol", "Sissu / Rohtang", "Shimla"],
  "shimla": ["Kufri", "Chail", "Mashobra", "Manali"],
  "jaipur": ["Agra", "Pushkar", "Ajmer", "Udaipur"],
  "goa": ["Gokarna", "Dudhsagar", "Dandeli"],
  "delhi": ["Agra / Taj Mahal", "Jaipur", "Rishikesh"],
  "agra": ["Jaipur", "Fatehpur Sikri", "Mathura"],
  "tokyo": ["Kyoto", "Hakone / Mt. Fuji", "Yokohama", "Kamakura"],
  "kyoto": ["Nara", "Osaka", "Hiroshima", "Tokyo"],
  "paris": ["Versailles", "Mont Saint-Michel", "Brussels"],
  "rome": ["Florence", "Vatican City", "Naples / Pompeii"],
  "swiss": ["Interlaken", "Lucerne", "Zermatt", "Grindelwald"],
  "zurich": ["Lucerne", "Interlaken", "Zermatt"],
  "kashmir": ["Gulmarg", "Pahalgam", "Sonmarg"],
  "dubai": ["Abu Dhabi", "Sharjah", "Ras Al Khaimah"],
  "new york": ["Philadelphia", "Washington D.C.", "Boston"],
  "singapore": ["Sentosa Island", "Johor Bahru", "Bintan Island"],
  "bali": ["Nusa Penida", "Gili Islands", "Lombok"]
};

const POPULAR_CHIPS = [
  "Paris, France",
  "Tokyo, Japan",
  "Bali, Indonesia",
  "Goa, India",
  "Manali, India",
  "Jaipur, India",
  "Ooty, Tamil Nadu, India",
  "Santorini, Greece",
  "Swiss Alps",
  "Rome, Italy",
  "Dubai, UAE",
  "Kashmir, India"
];

const SUGGESTIONS = [
  { name: "Romantic Paris & Versailles", destination: "Paris, France", nearby: ["Versailles"], duration: 5, budget: 150000, type: "Couple", tags: ["Culture", "Food"] },
  { name: "Ooty & Royal Mysuru Circuit", destination: "Ooty, Tamil Nadu, India", nearby: ["Mysuru"], duration: 5, budget: 35000, type: "Family", tags: ["Culture", "Nature"] },
  { name: "Adventure Manali & Kasol", destination: "Manali, India", nearby: ["Kasol"], duration: 5, budget: 25000, type: "Friends", tags: ["Adventure", "Relaxation"] },
  { name: "Golden Triangle: Jaipur & Agra", destination: "Jaipur, Rajasthan, India", nearby: ["Agra"], duration: 4, budget: 28000, type: "Family", tags: ["Culture", "Sightseeing"] },
  { name: "Tokyo & Historic Kyoto", destination: "Tokyo, Japan", nearby: ["Kyoto"], duration: 7, budget: 175000, type: "Couple", tags: ["Culture", "Sightseeing"] },
  { name: "Santorini Aegean Escape", destination: "Santorini, Greece", nearby: [], duration: 4, budget: 120000, type: "Couple", tags: ["Beach", "Sightseeing"] },
  { name: "Swiss Alps & Lucerne", destination: "Zurich / Swiss Alps, Switzerland", nearby: ["Lucerne"], duration: 6, budget: 220000, type: "Family", tags: ["Adventure", "Relaxation"] },
  { name: "Goa Coastal & Gokarna Trek", destination: "Goa, India", nearby: ["Gokarna"], duration: 5, budget: 30000, type: "Friends", tags: ["Beach", "Nightlife"] }
];

const CreateTrip = () => {
  const location = useLocation();
  const [step, setStep] = useState(0); // 0: Option Selection, 1: Details, 2: Budget/People, 3: Activities
  const [formData, setFormData] = useState({
    destination: "",
    nearbyDestinations: [],
    duration: "",
    budget: "",
    travelType: "",
    numberOfTravelers: "",
    activities: [],
    interests: []
  });

  const [customNearbyInput, setCustomNearbyInput] = useState("");
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [invalidTrip, setInvalidTrip] = useState(null);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // In-modal day editing state
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingDayData, setEditingDayData] = useState(null);
  
  // Luxury UI notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Prefill destination from Dashboard collection click
  useEffect(() => {
    if (location.state?.prefillDestination) {
      setFormData(prev => ({
        ...prev,
        destination: location.state.prefillDestination,
        nearbyDestinations: location.state.prefillNearby || []
      }));
      setStep(1);
    }
  }, [location.state]);
  
  const itineraryRef = useRef(null);
  const dropdownRef = useRef(null);

  const activitiesList = ["Beach", "Nightlife", "Sightseeing", "Shopping"];
  const interestsList = ["Adventure", "Food", "Culture", "Relaxation"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheckbox = (e, type) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((i) => i !== value)
        : [...prev[type], value]
    }));
  };

  // Nearby destination helpers
  const addNearbyDestination = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!formData.nearbyDestinations.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        nearbyDestinations: [...prev.nearbyDestinations, trimmed]
      }));
    }
    setCustomNearbyInput("");
  };

  const removeNearbyDestination = (name) => {
    setFormData(prev => ({
      ...prev,
      nearbyDestinations: prev.nearbyDestinations.filter(d => d !== name)
    }));
  };

  // Find smart nearby recommendations based on primary destination
  const getNearbyRecommendations = () => {
    const destLower = formData.destination.toLowerCase();
    for (const key of Object.keys(NEARBY_MAP)) {
      if (destLower.includes(key)) {
        return NEARBY_MAP[key].filter(item => !formData.nearbyDestinations.includes(item));
      }
    }
    return [];
  };

  const nearbyRecommendations = getNearbyRecommendations();

  const selectSuggestion = (s) => {
    setFormData({
      ...formData,
      destination: s.destination,
      nearbyDestinations: s.nearby || [],
      duration: s.duration.toString(),
      budget: s.budget.toString(),
      travelType: s.type,
      activities: ["Sightseeing"],
      interests: s.tags
    });
    setStep(2);
  };

  const filteredDestinations = ALL_DESTINATIONS.filter((d) =>
    d.toLowerCase().includes(formData.destination.toLowerCase().trim())
  );

  // Budget calculations & restrictions
  const numDays = Math.max(1, Number(formData.duration) || 1);
  const numTravelers = Math.max(1, Number(formData.numberOfTravelers) || 1);
  const minRequiredBudget = numDays * numTravelers * 1500;
  const recommendedBudget = numDays * numTravelers * 3500;
  const currentBudgetNum = Number(formData.budget) || 0;
  const isBudgetTooLow = formData.budget !== "" && currentBudgetNum < minRequiredBudget;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const payload = {
      ...formData,
      duration: Number(formData.duration),
      budget: Number(formData.budget),
      numberOfTravelers: Number(formData.numberOfTravelers) || 1
    };

    const days = Math.max(1, payload.duration || 1);
    const travelers = Math.max(1, payload.numberOfTravelers || 1);
    const minViable = days * travelers * 1500;

    // Strict client-side restriction if budget is too low
    if (payload.budget < minViable) {
      setInvalidTrip({
        status: "invalid_request",
        reason: `The entered budget of ₹${payload.budget.toLocaleString()} is restricted because it is below the minimum viable investment of ₹${minViable.toLocaleString()} for a ${days}-day journey with ${travelers} traveler(s). This is required to adequately cover travel transit, accommodations, and daily meals.`,
        minimum_recommended_budget: days * travelers * 3500,
        suggestions: [
          `Increase your budget to at least ₹${minViable.toLocaleString()} (est. ₹1,500/day/traveler for transit, lodging & meals).`,
          `Recommended investment for curated travel: ₹${(days * travelers * 3500).toLocaleString()}.`,
          `Shorten trip duration to ${Math.max(1, Math.floor(payload.budget / (travelers * 1500)))} day(s) for your current budget.`
        ]
      });
      setShowModal(true);
      setLoading(false);
      return;
    }

    setShowModal(true);
    setLoading(true);
    setError("");
    setIsSaved(false);
    setEditingDayIndex(null);

    try {
      const res = await generateItinerary(payload);
      if (Array.isArray(res) && typeof res[0] === "string") {
        setInvalidTrip({ reason: "Budget too low", suggestions: res });
        setItinerary([]);
      } else if (Array.isArray(res)) {
        setItinerary(res);
        setInvalidTrip(null);
      } else if (res?.status === "invalid_request") {
        setInvalidTrip(res);
        setItinerary([]);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      setError(err.response?.status === 401 ? "Please login first" : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  // Day Edit Handlers
  const startEditDay = (index) => {
    setEditingDayIndex(index);
    // Deep clone day object
    setEditingDayData(JSON.parse(JSON.stringify(itinerary[index])));
  };

  const cancelEditDay = () => {
    setEditingDayIndex(null);
    setEditingDayData(null);
  };

  const saveEditDay = (index) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[index] = editingDayData;
    setItinerary(updatedItinerary);
    setEditingDayIndex(null);
    setEditingDayData(null);
  };

  const handleEditPlaceChange = (placeIndex, field, value) => {
    const updated = { ...editingDayData };
    updated.places[placeIndex][field] = field === "entry_fee" ? Number(value) || 0 : value;
    setEditingDayData(updated);
  };

  const handleAddPlace = () => {
    const updated = { ...editingDayData };
    updated.places.push({ place_name: "New Attraction / Landmark", entry_fee: 0 });
    setEditingDayData(updated);
  };

  const handleRemovePlace = (placeIndex) => {
    const updated = { ...editingDayData };
    if (updated.places.length <= 1) {
      showToast("Each day should retain at least one curated attraction.", "error");
      return;
    }
    updated.places.splice(placeIndex, 1);
    setEditingDayData(updated);
  };

  const fullDisplayDestination = formData.destination + 
    (formData.nearbyDestinations.length > 0 ? ` + ${formData.nearbyDestinations.join(", ")}` : "");

  const saveToDB = async () => {
    try {
      await api.post("/itinerary/save", {
        destination: fullDisplayDestination,
        duration: Number(formData.duration),
        budget: Number(formData.budget),
        tripData: itinerary
      });
      setIsSaved(true);
      showToast("Bespoke itinerary saved to your private vault!", "success");
    } catch (err) {
      showToast(err.response?.status === 401 ? "Please sign in to save this bespoke itinerary" : "Failed to save itinerary", "error");
    }
  };

  const downloadPDF = async () => {
    const element = itineraryRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${formData.destination}_Itinerary.pdf`);
  };

  return (
    <div className="premium-page">
      <div className="glass-container">
        {step === 0 && (
          <div className="selection-screen fade-in">
            <h1 className="premium-title">Curate Your Journey</h1>
            <p className="premium-subtitle">Select your preferred method to design a bespoke travel itinerary.</p>
            
            <div className="option-grid">
              <div className="option-card" onClick={() => setStep(1)}>
                <div className="icon-circle blur-blue"><MapPin size={28} /></div>
                <h3>Bespoke Journey Planning</h3>
                <p>Specify your primary destination, add regional stopovers (e.g. Ooty with Mysuru), and customize every detail.</p>
                <ChevronRight className="arrow" />
              </div>
              
              <div className="option-card featured" onClick={() => setStep(4)}>
                <div className="icon-circle blur-purple"><Sparkles size={28} /></div>
                <h3>Curated Signature Expeditions</h3>
                <p>Explore masterfully pre-designed itineraries and multi-destination circuits curated by travel specialists.</p>
                <div className="badge">Signature</div>
                <ChevronRight className="arrow" />
              </div>
            </div>
          </div>
        )}

        {(step > 0 && step < 4) && (
          <div className="form-wizard fade-in">
            <div className="wizard-header">
              <button className="back-btn" onClick={() => setStep(step - 1)}><ChevronLeft /> Back</button>
              <div className="step-indicator">Step {step} of 3</div>
            </div>

            <h2 className="step-title">
              {step === 1 && "Destinations & Stopovers"}
              {step === 2 && "Duration & Investment"}
              {step === 3 && "Travel Style & Themes"}
            </h2>

            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
              {step === 1 && (
                <div className="step-content">
                  {/* MAIN DESTINATION INPUT */}
                  <div className="input-group" ref={dropdownRef} style={{ position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ margin: 0 }}>Primary Destination</label>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
                        Type any city, town, or country
                      </span>
                    </div>

                    <div className="input-with-icon" style={{ position: "relative" }}>
                      <MapPin className="input-icon" />
                      <input
                        name="destination"
                        type="text"
                        placeholder="e.g. Ooty, Paris, Manali, Tokyo, Jaipur..."
                        value={formData.destination}
                        onChange={(e) => {
                          handleChange(e);
                          setShowDestDropdown(true);
                        }}
                        onFocus={() => setShowDestDropdown(true)}
                        autoComplete="off"
                        required
                        style={{ paddingRight: formData.destination ? "45px" : "20px" }}
                      />
                      {formData.destination && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, destination: "" });
                            setShowDestDropdown(false);
                          }}
                          style={{
                            position: "absolute",
                            right: "16px",
                            background: "transparent",
                            border: "none",
                            color: "var(--text-dim)",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Clear destination"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showDestDropdown && filteredDestinations.length > 0 && (
                      <div className="destination-dropdown-menu">
                        <div className="dropdown-header">
                          <Compass size={13} />
                          <span>Matching Destinations ({filteredDestinations.length})</span>
                        </div>
                        {filteredDestinations.slice(0, 8).map((d) => (
                          <div
                            key={d}
                            className="destination-dropdown-item"
                            onClick={() => {
                              setFormData({ ...formData, destination: d });
                              setShowDestDropdown(false);
                            }}
                          >
                            <MapPin size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Popular Chips */}
                    <div className="popular-chips-wrap">
                      <span className="chips-title">Popular Destinations:</span>
                      <div className="chips-grid">
                        {POPULAR_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            className={`dest-pill ${formData.destination === chip ? "active" : ""}`}
                            onClick={() => {
                              setFormData({ ...formData, destination: chip });
                              setShowDestDropdown(false);
                            }}
                          >
                            {chip.split(",")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* MULTI-DESTINATION: ADD NEARBY DESTINATIONS / STOPS */}
                  <div className="input-group" style={{ marginTop: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ margin: 0 }}>Add Nearby Destinations & Stops</label>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                        e.g., Ooty + Mysuru
                      </span>
                    </div>

                    {/* Input to type custom nearby stop */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <div className="input-with-icon" style={{ flex: 1 }}>
                        <MapPin className="input-icon" size={16} />
                        <input
                          type="text"
                          placeholder="Type nearby city or stop (e.g. Mysuru, Coonoor, Kasol)..."
                          value={customNearbyInput}
                          onChange={(e) => setCustomNearbyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addNearbyDestination(customNearbyInput);
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addNearbyDestination(customNearbyInput)}
                        className="add-nearby-btn"
                        title="Add Stop"
                      >
                        <Plus size={18} />
                        <span>Add Stop</span>
                      </button>
                    </div>

                    {/* Selected Nearby Stops */}
                    {formData.nearbyDestinations.length > 0 && (
                      <div className="selected-stops-list">
                        <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>Added Stops:</span>
                        {formData.nearbyDestinations.map((stop) => (
                          <span key={stop} className="stop-badge">
                            <MapPin size={12} color="#10b981" />
                            <span>{stop}</span>
                            <button
                              type="button"
                              onClick={() => removeNearbyDestination(stop)}
                              className="remove-stop-btn"
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Smart Nearby Recommendations for Current Destination */}
                    {formData.destination && nearbyRecommendations.length > 0 && (
                      <div className="smart-nearby-wrap">
                        <span className="smart-nearby-title">
                          💡 Nearby Suggestions for {formData.destination.split(",")[0]}:
                        </span>
                        <div className="chips-grid">
                          {nearbyRecommendations.map((nearby) => (
                            <button
                              key={nearby}
                              type="button"
                              className="nearby-suggestion-pill"
                              onClick={() => addNearbyDestination(nearby)}
                            >
                              <Plus size={12} />
                              <span>{nearby}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DURATION INPUT */}
                  <div className="input-group" style={{ marginTop: "24px" }}>
                    <label>Duration (Days)</label>
                    <div className="input-with-icon">
                       <Calendar className="input-icon" />
                       <input 
                         name="duration" 
                         type="number" 
                         min="1" 
                         max="30" 
                         placeholder="How many days? (e.g. 3, 5, 7)" 
                         value={formData.duration} 
                         onChange={handleChange} 
                         required 
                       />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="step-content">
                  <div className="input-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ margin: 0 }}>Total Trip Budget (₹ INR)</label>
                      <span style={{ fontSize: "0.78rem", color: isBudgetTooLow ? "#d9534f" : "#C4A46D", fontWeight: 600 }}>
                        {isBudgetTooLow ? `Min required: ₹${minRequiredBudget.toLocaleString()}` : `Recommended: ₹${recommendedBudget.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="input-with-icon">
                      <Wallet className="input-icon" />
                      <input 
                        name="budget" 
                        type="number" 
                        placeholder={`Minimum ₹${minRequiredBudget.toLocaleString()}`} 
                        value={formData.budget} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    {/* LIVE BUDGET RESTRICTION ALERT */}
                    {isBudgetTooLow && (
                      <div className="budget-restriction-alert">
                        <div className="alert-header">
                          <AlertCircle size={15} color="#d9534f" />
                          <span>Budget Below Minimum Required Threshold</span>
                        </div>
                        <p>
                          A budget of ₹{currentBudgetNum.toLocaleString()} cannot cover necessary travel expenses (transit, accommodations, daily meals) for <strong>{numDays} day(s)</strong> with <strong>{numTravelers} traveler(s)</strong>.
                          Minimum required is <strong>₹{minRequiredBudget.toLocaleString()}</strong> (~₹1,500/day/traveler).
                        </p>
                        <div className="budget-quick-actions">
                          <button 
                            type="button" 
                            className="btn-set-budget"
                            onClick={() => setFormData({ ...formData, budget: minRequiredBudget.toString() })}
                          >
                            Set Minimum (₹{minRequiredBudget.toLocaleString()})
                          </button>
                          <button 
                            type="button" 
                            className="btn-set-budget recommended"
                            onClick={() => setFormData({ ...formData, budget: recommendedBudget.toString() })}
                          >
                            Set Recommended (₹{recommendedBudget.toLocaleString()})
                          </button>
                        </div>
                      </div>
                    )}

                    {!isBudgetTooLow && currentBudgetNum > 0 && (
                      <div className="budget-valid-badge">
                        <CheckCircle size={14} color="#10b981" />
                        <span>
                          Viable Budget: ~₹{Math.round(currentBudgetNum / (numDays * numTravelers)).toLocaleString()}/person/day (Allocated for daily transit, stay & meals)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label>Number of Travelers</label>
                    <div className="input-with-icon">
                      <Users className="input-icon" />
                      <input name="numberOfTravelers" type="number" min="1" max="50" placeholder="Number of people" value={formData.numberOfTravelers} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Travel Type</label>
                    <select name="travelType" value={formData.travelType} onChange={handleChange} required>
                      <option value="">Select Type</option>
                      <option>Solo</option><option>Friends</option><option>Family</option><option>Couple</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-content">
                  <div style={{ marginBottom: "8px", fontSize: "0.85rem", fontWeight: 600, color: "#292D2A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Preferred Activities
                  </div>
                  <div className="pill-grid">
                    {activitiesList.map(a => (
                      <label key={a} className={`pill ${formData.activities.includes(a) ? "active" : ""}`}>
                        <input type="checkbox" value={a} onChange={(e) => handleCheckbox(e, "activities")} hidden />
                        {a}
                      </label>
                    ))}
                  </div>
                  <div style={{ marginTop: "24px", marginBottom: "8px", fontSize: "0.85rem", fontWeight: 600, color: "#292D2A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Expedition Themes & Focus
                  </div>
                  <div className="pill-grid">
                    {interestsList.map(i => (
                      <label key={i} className={`pill ${formData.interests.includes(i) ? "active" : ""}`}>
                        <input type="checkbox" value={i} onChange={(e) => handleCheckbox(e, "interests")} hidden />
                        {i}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={`next-btn ${step === 2 && isBudgetTooLow ? "restricted-btn" : ""}`}
                disabled={step === 2 && isBudgetTooLow}
              >
                {step === 3 
                  ? "Curate Bespoke Itinerary" 
                  : step === 2 && isBudgetTooLow 
                    ? `Budget Restricted (Min ₹${minRequiredBudget.toLocaleString()} Required)`
                    : "Continue"}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="suggestions-screen fade-in">
             <div className="wizard-header">
              <button className="back-btn" onClick={() => setStep(0)}><ChevronLeft /> Back</button>
            </div>
            <h2 className="premium-title">Curated Signature Expeditions</h2>
            <p className="premium-subtitle">Select an artisanal itinerary pre-configured by our travel concierge specialists.</p>
            <div className="suggestion-list">
              {SUGGESTIONS.map((s, idx) => (
                <div key={idx} className="suggestion-item" onClick={() => selectSuggestion(s)}>
                  <div className="suggest-info">
                    <h4>{s.name}</h4>
                    <p>{s.destination} {s.nearby?.length > 0 && `(+ ${s.nearby.join(", ")})`} • {s.duration} Days</p>
                  </div>
                  <div className="suggest-price">₹{s.budget.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ITINERARY MODAL WITH IN-PLACE DAY EDITING */}
      {showModal && (
        <div className="modalOverlay">
          <div className="premium-modal">
            {loading ? (
              <div className="loading-state">
                 <div className="loader"></div>
                 <p>Curating your bespoke itinerary for {fullDisplayDestination}...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <Info color="#263C32" size={44} />
                <p>{error}</p>
                <button onClick={() => setShowModal(false)} className="next-btn" style={{ maxWidth: "220px", margin: "20px auto 0 auto" }}>Return</button>
              </div>
            ) : invalidTrip ? (
              <div className="warning-state luxury-warning-card">
                <div className="warning-icon-badge">
                  <AlertCircle size={32} color="#C4A46D" />
                </div>
                <span className="warning-kicker">TRAVEL BUDGET RESTRICTION</span>
                <h3>Investment Scope Below Required Minimum</h3>
                <p className="warning-reason-text">{invalidTrip.reason}</p>
                {invalidTrip.suggestions && (
                  <div className="suggest-box">
                    <span className="suggest-box-title">Travel Specialist Recommendations:</span>
                    <ul>
                      {invalidTrip.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                <div className="warning-actions-row">
                  {invalidTrip.minimum_recommended_budget && (
                    <button 
                      className="next-btn"
                      style={{ marginTop: 0 }}
                      onClick={() => {
                        const rec = invalidTrip.minimum_recommended_budget;
                        setFormData(prev => ({ ...prev, budget: rec.toString() }));
                        setShowModal(false);
                        setStep(2);
                      }}
                    >
                      <span>Apply Recommended Budget (₹{invalidTrip.minimum_recommended_budget.toLocaleString()})</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { setShowModal(false); setStep(2); }} 
                    className="pdf-btn"
                  >
                    Adjust Budget Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="itinerary-view">
                <div className="itinerary-header">
                   <div>
                     <h2>{fullDisplayDestination}</h2>
                     <p>{formData.duration} Days Plan • ₹{Number(formData.budget).toLocaleString()}</p>
                   </div>
                   <div className="action-btns">
                      <button onClick={saveToDB} className={`save-btn ${isSaved ? "saved" : ""}`}>
                        {isSaved ? <CheckCircle /> : <Bookmark />} 
                        {isSaved ? "Saved" : "Save Trip"}
                      </button>
                      <button onClick={downloadPDF} className="pdf-btn"><Download /> PDF</button>
                   </div>
                </div>

                <div className="itinerary-scroll" ref={itineraryRef}>
                   {/* EXECUTIVE EXPEDITION FINANCIAL DOSSIER */}
                   {(() => {
                     const tripDays = itinerary || [];
                     const totalDaysCount = tripDays.length || Number(formData.duration) || 1;
                     const totalTransportExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.transport || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.18)), 0);
                     const totalStayExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.stay || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.40)), 0);
                     const totalFoodExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.food || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.22)), 0);
                     const totalActivitiesExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.activities || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.12)), 0);
                     const totalAllCalculated = totalTransportExp + totalStayExp + totalFoodExp + totalActivitiesExp || Number(formData.budget) || 1;

                     const pctTransit = Math.max(5, Math.round((totalTransportExp / totalAllCalculated) * 100));
                     const pctStay = Math.max(5, Math.round((totalStayExp / totalAllCalculated) * 100));
                     const pctFood = Math.max(5, Math.round((totalFoodExp / totalAllCalculated) * 100));
                     const pctSightseeing = Math.max(5, 100 - (pctTransit + pctStay + pctFood));

                     return (
                       <div className="executive-dossier-card">
                         <div className="dossier-header-strip">
                           <div className="dossier-kicker">
                             <Compass size={14} color="#C4A46D" />
                             <span>EXECUTIVE EXPEDITION FINANCIAL DOSSIER</span>
                           </div>
                           <div className="dossier-meta-stats">
                             <span className="stat-pill-gold">
                               <strong>{totalDaysCount}</strong> Days Curated
                             </span>
                             <span className="stat-pill-gold">
                               Avg. <strong>₹{Math.round(totalAllCalculated / totalDaysCount).toLocaleString()}</strong> / day
                             </span>
                           </div>
                         </div>

                         <div className="allocation-bar-section">
                           <div className="allocation-progress-bar">
                             <div className="alloc-segment transit" style={{ width: `${pctTransit}%` }} title={`Transit & Commute: ₹${totalTransportExp.toLocaleString()} (${pctTransit}%)`} />
                             <div className="alloc-segment stay" style={{ width: `${pctStay}%` }} title={`Accommodations: ₹${totalStayExp.toLocaleString()} (${pctStay}%)`} />
                             <div className="alloc-segment food" style={{ width: `${pctFood}%` }} title={`Dining: ₹${totalFoodExp.toLocaleString()} (${pctFood}%)`} />
                             <div className="alloc-segment activities" style={{ width: `${pctSightseeing}%` }} title={`Sightseeing: ₹${totalActivitiesExp.toLocaleString()} (${pctSightseeing}%)`} />
                           </div>

                           <div className="allocation-legend-grid">
                             <div className="legend-chip">
                               <span className="dot transit-dot" />
                               <span className="lbl">🚗 Transit ({pctTransit}%)</span>
                               <span className="amt">₹{totalTransportExp.toLocaleString()}</span>
                             </div>
                             <div className="legend-chip">
                               <span className="dot stay-dot" />
                               <span className="lbl">🏨 Stays ({pctStay}%)</span>
                               <span className="amt">₹{totalStayExp.toLocaleString()}</span>
                             </div>
                             <div className="legend-chip">
                               <span className="dot food-dot" />
                               <span className="lbl">🍽️ Dining ({pctFood}%)</span>
                               <span className="amt">₹{totalFoodExp.toLocaleString()}</span>
                             </div>
                             <div className="legend-chip">
                               <span className="dot act-dot" />
                               <span className="lbl">🎟️ Sightseeing ({pctSightseeing}%)</span>
                               <span className="amt">₹{totalActivitiesExp.toLocaleString()}</span>
                             </div>
                           </div>
                         </div>

                         <div className="day-quick-nav">
                           <span className="quick-nav-label">Jump to Day:</span>
                           <div className="quick-nav-pills">
                             {tripDays.map((d, i) => (
                               <button
                                 key={i}
                                 type="button"
                                 className="quick-day-pill"
                                 onClick={() => {
                                   const el = document.getElementById(`create-day-${i}`);
                                   if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                                 }}
                               >
                                 Day {d.day || i + 1}
                               </button>
                             ))}
                           </div>
                         </div>
                       </div>
                     );
                   })()}

                   <div className="modal-addons" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                      {/* WEATHER & MAP */}
                         <WeatherCard destination={formData.destination} />
                         <MapPreview destination={formData.destination} places={itinerary[0]?.places} />
                      </div>

                   {itinerary.map((day, index) => {
                     // Calculate balance correctly
                     let spentSoFar = itinerary.slice(0, index + 1).reduce((acc, d) => acc + (d.budget_breakdown?.total_for_day || 0), 0);
                     let remainingBalance = formData.budget - spentSoFar;
                     const isThisDayEditing = editingDayIndex === index;

                     return (
                       <div className="premium-day-card" key={day.day || index} id={`create-day-${index}`}>
                          <div className="day-side">
                             <div className="day-num">Day {day.day}</div>
                             <div className="time-line"><Clock size={14} /> {day.best_time}</div>
                             
                             <div className="budget-tracker-side">
                               <div className="spent">Spent: ₹{day.budget_breakdown?.total_for_day}</div>
                               <div className="balance">Left: ₹{remainingBalance < 0 ? 0 : remainingBalance}</div>
                             </div>

                             {/* EDIT DAY TOGGLE BUTTON */}
                             {!isThisDayEditing ? (
                               <button 
                                 className="edit-day-action-btn"
                                 onClick={() => startEditDay(index)}
                                 title="Edit places, activities, and budget for this day"
                               >
                                 <Edit3 size={13} />
                                 <span>Edit Day</span>
                               </button>
                             ) : (
                               <button 
                                 className="cancel-day-btn"
                                 onClick={cancelEditDay}
                               >
                                 Cancel
                               </button>
                             )}
                          </div>

                          <div className="day-main">
                             {/* EDIT MODE FORM FOR DAY */}
                             {isThisDayEditing && editingDayData ? (
                               <div className="day-edit-container">
                                  <div className="edit-section-header">
                                    <Sparkles size={16} color="var(--primary)" />
                                    <span>Customize Day {editingDayData.day} Plan</span>
                                  </div>

                                  <div className="edit-form-grid">
                                    <div className="edit-field">
                                      <label>Best Time Window</label>
                                      <input 
                                        type="text" 
                                        value={editingDayData.best_time || ""} 
                                        onChange={(e) => setEditingDayData({ ...editingDayData, best_time: e.target.value })}
                                        placeholder="e.g. 9:00 AM - 1:30 PM"
                                      />
                                    </div>
                                    <div className="edit-field">
                                      <label>Day Total Budget (₹)</label>
                                      <input 
                                        type="number" 
                                        value={editingDayData.budget_breakdown?.total_for_day || 0} 
                                        onChange={(e) => {
                                          const val = Number(e.target.value) || 0;
                                          setEditingDayData({
                                            ...editingDayData,
                                            budget_breakdown: { ...editingDayData.budget_breakdown, total_for_day: val }
                                          });
                                        }}
                                      />
                                    </div>
                                    <div className="edit-field">
                                      <label>Travel / Transit Expense (₹)</label>
                                      <input 
                                        type="number" 
                                        value={editingDayData.budget_breakdown?.transport || 0} 
                                        onChange={(e) => {
                                          const val = Number(e.target.value) || 0;
                                          setEditingDayData({
                                            ...editingDayData,
                                            budget_breakdown: { ...editingDayData.budget_breakdown, transport: val }
                                          });
                                        }}
                                        placeholder="e.g. 500"
                                      />
                                    </div>
                                  </div>

                                  {/* EDIT PLACES LIST */}
                                  <div className="edit-places-section">
                                    <div className="places-header">
                                      <label>Places to Visit</label>
                                      <button type="button" onClick={handleAddPlace} className="add-place-pill">
                                        <Plus size={12} /> Add Place
                                      </button>
                                    </div>

                                    {editingDayData.places.map((p, pIdx) => (
                                      <div key={pIdx} className="edit-place-row">
                                        <input 
                                          type="text" 
                                          className="place-name-input"
                                          placeholder="Place or attraction name"
                                          value={p.place_name || ""}
                                          onChange={(e) => handleEditPlaceChange(pIdx, "place_name", e.target.value)}
                                        />
                                        <div className="entry-fee-wrap">
                                          <span>₹</span>
                                          <input 
                                            type="number"
                                            className="place-fee-input"
                                            placeholder="Entry Fee"
                                            value={p.entry_fee || 0}
                                            onChange={(e) => handleEditPlaceChange(pIdx, "entry_fee", e.target.value)}
                                            title="Entry Fee"
                                          />
                                        </div>
                                        <button 
                                          type="button" 
                                          className="delete-place-btn" 
                                          onClick={() => handleRemovePlace(pIdx)}
                                          title="Remove this place"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>

                                  {/* EDIT MUST TRY FOOD */}
                                  <div className="edit-food-section">
                                    <label>Must Try Food & Cost (₹)</label>
                                    <div className="edit-food-grid">
                                      <input 
                                        type="text"
                                        placeholder="Famous local dish name"
                                        value={editingDayData.special_food?.food_name || ""}
                                        onChange={(e) => setEditingDayData({
                                          ...editingDayData,
                                          special_food: { ...editingDayData.special_food, food_name: e.target.value }
                                        })}
                                      />
                                      <input 
                                        type="number"
                                        placeholder="Cost (₹)"
                                        value={editingDayData.special_food?.cost || 0}
                                        onChange={(e) => setEditingDayData({
                                          ...editingDayData,
                                          special_food: { ...editingDayData.special_food, cost: Number(e.target.value) || 0 }
                                        })}
                                      />
                                    </div>
                                  </div>

                                  {/* EDIT DESCRIPTION */}
                                  <div className="edit-desc-section">
                                    <label>Day Plan Description</label>
                                    <textarea 
                                      rows="3"
                                      value={editingDayData.description || ""}
                                      onChange={(e) => setEditingDayData({ ...editingDayData, description: e.target.value })}
                                      placeholder="Write your custom notes or details for this day..."
                                    />
                                  </div>

                                  {/* SAVE / CANCEL ACTION BUTTONS */}
                                  <div className="day-edit-actions">
                                    <button 
                                      type="button" 
                                      className="save-day-changes-btn"
                                      onClick={() => saveEditDay(index)}
                                    >
                                      <Check size={16} /> Save Changes
                                    </button>
                                    <button 
                                      type="button" 
                                      className="cancel-day-btn-flat"
                                      onClick={cancelEditDay}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                               </div>
                             ) : (
                               /* NORMAL VIEW MODE */
                               <>
                                 <div className="place-grid">
                                    {day.places?.map((p, i) => {
                                    const placeName = typeof p === "string" ? p : p.place_name;
                                    const searchQuery = placeName.split(" ").join(",");
                                    const imageUrl = `https://loremflickr.com/400/300/${encodeURIComponent(searchQuery + "," + formData.destination)}`;
                                    return (
                                      <div key={i} className="mini-place-card">
                                         <img src={imageUrl} alt={placeName} onError={(e) => { e.target.src="https://picsum.photos/400/300"; }} />
                                         <div className="mini-info">
                                            <h6>{placeName}</h6>
                                            {p.entry_fee > 0 && <span>Entry: ₹{p.entry_fee}</span>}
                                         </div>
                                      </div>
                                    )
                                  })}
                               </div>
                               
                               {day.special_food && (
                                 <div className="food-highlight">
                                    <UtensilsCrossed size={16} />
                                    <span>Must Try: <strong>{day.special_food.food_name}</strong></span>
                                    {day.special_food.cost > 0 && <b>~₹{day.special_food.cost}</b>}
                                 </div>
                               )}

                               <div className="day-desc">{day.description}</div>
                               
                               {/* EXPLICIT TRAVEL & COMMUTE EXPENSE */}
                               <div className="day-expense-breakdown">
                                 <div className="expense-pill transit-pill">
                                   <Car size={13} color="#263C32" />
                                   <span>Transit / Travel: ₹{(day.budget_breakdown?.transport || Math.round((day.budget_breakdown?.total_for_day || 2000) * 0.18)).toLocaleString()}</span>
                                 </div>
                                 {day.budget_breakdown?.stay ? (
                                   <div className="expense-pill">
                                     <span>Stay: ₹{day.budget_breakdown.stay.toLocaleString()}</span>
                                   </div>
                                 ) : null}
                                 {day.budget_breakdown?.food ? (
                                   <div className="expense-pill">
                                     <span>Meals: ₹{day.budget_breakdown.food.toLocaleString()}</span>
                                   </div>
                                 ) : null}
                                 {day.budget_breakdown?.activities ? (
                                   <div className="expense-pill">
                                     <span>Sightseeing: ₹{day.budget_breakdown.activities.toLocaleString()}</span>
                                   </div>
                                 ) : null}
                               </div>

                               <div className="day-footer">
                                  <div className="tag"><Sparkles size={12}/> {day.interest}</div>
                                  <div className="day-cost">Est. ₹{day.budget_breakdown?.total_for_day?.toLocaleString()}</div>
                               </div>
                             </>
                             )}
                          </div>
                      </div>
                    );
                   })}
                </div>
                <button className="modal-close" onClick={() => setShowModal(false)}>Close Itinerary</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LUXURY TOAST NOTIFICATION */}
      {toast && (
        <div className={`luxury-toast-bar toast-${toast.type || "success"}`}>
          <div className="toast-icon-wrap">
            {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          </div>
          <div className="toast-msg">{toast.message}</div>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Close notification">×</button>
        </div>
      )}

      {/* STYLES FOR DESTINATION SEARCH, NEARBY DESTINATIONS & IN-MODAL EDITING */}
      <style>{`
        .destination-dropdown-menu {
          position: absolute;
          top: calc(100% - 64px);
          left: 0;
          right: 0;
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 8px;
          max-height: 250px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 12px 30px rgba(41, 45, 42, 0.08);
        }
        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 0.75rem;
          color: #777D78;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #E8E9E5;
          background: #F7F7F4;
        }
        .destination-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          cursor: pointer;
          color: #292D2A;
          font-size: 0.92rem;
          transition: all 0.2s;
          border-bottom: 1px solid #F0F1ED;
        }
        .destination-dropdown-item:hover {
          background: #F7F7F4;
          color: #263C32;
          padding-left: 22px;
        }
        .popular-chips-wrap {
          margin-top: 14px;
        }
        .chips-title {
          display: block;
          font-size: 0.78rem;
          color: #777D78;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dest-pill {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 4px;
          padding: 6px 14px;
          font-size: 0.8rem;
          color: #777D78;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dest-pill:hover, .dest-pill.active {
          background: #263C32;
          color: #FFFFFF;
          border-color: #263C32;
        }
        /* NEARBY DESTINATIONS STYLING */
        .add-nearby-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          color: #263C32;
          border: 1px solid #263C32;
          border-radius: 6px;
          padding: 0 20px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .add-nearby-btn:hover {
          background: #263C32;
          color: #FFFFFF;
        }
        .selected-stops-list {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .stop-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F7F7F4;
          border: 1px solid #263C32;
          border-radius: 4px;
          padding: 5px 12px;
          font-size: 0.82rem;
          color: #292D2A;
          font-weight: 500;
        }
        .remove-stop-btn {
          background: transparent;
          border: none;
          color: #777D78;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .remove-stop-btn:hover {
          color: #d9534f;
        }
        .smart-nearby-wrap {
          margin-top: 10px;
          background: #F7F7F4;
          border: 1px dashed #E8E9E5;
          border-radius: 8px;
          padding: 14px 18px;
        }
        .smart-nearby-title {
          display: block;
          font-size: 0.8rem;
          color: #C4A46D;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .nearby-suggestion-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          color: #263C32;
          border-radius: 4px;
          padding: 5px 12px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nearby-suggestion-pill:hover {
          background: #263C32;
          color: #FFFFFF;
          border-color: #263C32;
        }
        /* DAY EDIT IN-PLACE STYLING */
        .edit-day-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          color: #292D2A;
          padding: 7px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 10px;
        }
        .edit-day-action-btn:hover {
          background: #263C32;
          color: #FFFFFF;
          border-color: #263C32;
        }
        .cancel-day-btn {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          color: #d9534f;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.78rem;
          cursor: pointer;
          margin-top: 8px;
        }
        .day-edit-container {
          background: #FFFFFF;
          border: 1px solid #263C32;
          border-radius: 8px;
          padding: 24px;
          animation: fadeIn 0.3s ease;
        }
        .edit-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #292D2A;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #E8E9E5;
        }
        .edit-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 18px;
        }
        .edit-field label,
        .edit-places-section label,
        .edit-food-section label,
        .edit-desc-section label {
          display: block;
          font-size: 0.8rem;
          color: #777D78;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .edit-field input,
        .edit-places-section input,
        .edit-food-section input,
        .edit-desc-section textarea {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 4px;
          color: #292D2A;
          padding: 8px 12px;
          font-size: 0.9rem;
          outline: none;
        }
        .edit-field input:focus,
        .edit-places-section input:focus,
        .edit-food-section input:focus,
        .edit-desc-section textarea:focus {
          border-color: #263C32;
        }
        .places-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .add-place-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: #F7F7F4;
          border: 1px solid #263C32;
          color: #263C32;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .add-place-pill:hover {
          background: #263C32;
          color: #FFFFFF;
        }
        .edit-place-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .place-name-input {
          flex: 2;
        }
        .entry-fee-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 4px;
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 4px;
          padding: 0 8px;
        }
        .entry-fee-wrap span {
          color: #263C32;
          font-weight: 600;
          font-size: 0.85rem;
        }
        .entry-fee-wrap input {
          border: none;
          background: transparent;
          padding: 8px 0;
        }
        .delete-place-btn {
          background: transparent;
          border: 1px solid #E8E9E5;
          color: #777D78;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .delete-place-btn:hover {
          border-color: #d9534f;
          color: #d9534f;
        }
        .edit-food-section {
          margin-top: 14px;
        }
        .edit-food-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 10px;
        }
        .edit-desc-section {
          margin-top: 14px;
        }
        .day-edit-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px solid #E8E9E5;
        }
        .save-day-changes-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #263C32;
          border: 1px solid #263C32;
          color: #FFFFFF;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 10px 22px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .save-day-changes-btn:hover {
          background: #1b2c24;
        }
        .cancel-day-btn-flat {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          color: #777D78;
          padding: 10px 18px;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .cancel-day-btn-flat:hover {
          color: #292D2A;
          border-color: #292D2A;
        }

        /* BUDGET RESTRICTION STYLES */
        .budget-restriction-alert {
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 12px 16px;
          margin-top: 10px;
        }
        .budget-restriction-alert .alert-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #dc2626;
        }
        .budget-restriction-alert p {
          font-size: 0.82rem;
          color: #7f1d1d;
          margin: 6px 0 10px 0;
          line-height: 1.5;
        }
        .budget-quick-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .btn-set-budget {
          background: #FFFFFF;
          border: 1px solid #dc2626;
          color: #dc2626;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-set-budget:hover {
          background: #dc2626;
          color: #FFFFFF;
        }
        .btn-set-budget.recommended {
          border-color: #263C32;
          color: #263C32;
        }
        .btn-set-budget.recommended:hover {
          background: #263C32;
          color: #FFFFFF;
        }
        .budget-valid-badge {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          padding: 8px 14px;
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #15803d;
          font-weight: 500;
        }
        .restricted-btn {
          opacity: 0.65;
          cursor: not-allowed;
          background: #777D78 !important;
          border-color: #777D78 !important;
        }

        /* DAY EXPENSE BREAKDOWN (TRANSIT & TRAVEL) */
        .day-expense-breakdown {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 14px 0 10px 0;
          padding-top: 12px;
          border-top: 1px solid #E8E9E5;
        }
        .expense-pill {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.78rem;
          color: #777D78;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .expense-pill.transit-pill {
          background: #F7F7F4;
          border: 1px solid #C4A46D;
          color: #263C32;
          font-weight: 600;
        }

        /* LUXURY WARNING & RESTRICTION CARD IN MODAL */
        .luxury-warning-card {
          text-align: center;
          padding: 36px 28px;
        }
        .warning-icon-badge {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #F7F7F4;
          border: 1px solid #E8E9E5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }
        .warning-kicker {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #C4A46D;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }
        .luxury-warning-card h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.6rem;
          color: #292D2A;
          margin: 0 0 10px 0;
        }
        .warning-reason-text {
          color: #777D78;
          font-size: 0.92rem;
          max-width: 560px;
          margin: 0 auto 20px auto;
          line-height: 1.6;
        }
        .luxury-warning-card .suggest-box {
          background: #F7F7F4;
          border: 1px solid #E8E9E5;
          border-radius: 8px;
          padding: 18px 24px;
          max-width: 560px;
          margin: 0 auto 24px auto;
          text-align: left;
        }
        .suggest-box-title {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #263C32;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }
        .luxury-warning-card .suggest-box ul {
          margin: 0;
          padding-left: 18px;
          color: #777D78;
          font-size: 0.88rem;
          line-height: 1.6;
        }
        .warning-actions-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
};

export default CreateTrip;
