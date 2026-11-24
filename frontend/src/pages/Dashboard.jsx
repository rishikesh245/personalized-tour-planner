import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { 
  Plus, 
  History, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Wallet, 
  Clock, 
  UtensilsCrossed, 
  Download, 
  X, 
  Trash2, 
  Share2, 
  Globe, 
  Lock, 
  Edit3,
  Check,
  Compass,
  ArrowRight,
  ShieldCheck,
  Palmtree,
  Mountain,
  Landmark,
  Building2,
  Mail,
  Car,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./style.css";
import WeatherCard from "../components/WeatherCard";
import MapPreview from "../components/MapPreview";

// Curated luxury travel categories with prefill routing
const TRAVEL_COLLECTIONS = [
  {
    title: "Heritage & Palaces",
    subtitle: "Jaipur, Rome, Kyoto & Mysore",
    icon: Landmark,
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop",
    dest: "Jaipur, Rajasthan, India",
    nearby: ["Agra", "Udaipur"]
  },
  {
    title: "Alpine & Hill Sanctuaries",
    subtitle: "Swiss Alps, Manali & Kashmir",
    icon: Mountain,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    dest: "Manali, Himachal Pradesh, India",
    nearby: ["Kasol", "Solang Valley"]
  },
  {
    title: "Coastal & Island Retreats",
    subtitle: "Santorini, Bali, Goa & Maldives",
    icon: Palmtree,
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop",
    dest: "Santorini, Greece",
    nearby: ["Mykonos"]
  },
  {
    title: "Metropolitan Elegance",
    subtitle: "Paris, Tokyo, London & Dubai",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
    dest: "Paris, France",
    nearby: ["Versailles"]
  }
];

function Dashboard() {
  const navigate = useNavigate();
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Day editing states
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [editingDayData, setEditingDayData] = useState(null);
  const [savingChanges, setSavingChanges] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  
  // Luxury UI States: Custom Toast & Confirmation Dialog
  const [toast, setToast] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const itineraryRef = useRef(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get("/itinerary/my-trips");
      setSavedTrips(res.data);
    } catch (err) {
      console.error("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setTripToDelete(id);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;
    try {
      await api.delete(`/itinerary/${tripToDelete}`);
      setSavedTrips(savedTrips.filter(t => t._id !== tripToDelete));
      showToast("Journey permanently archived from portfolio", "info");
    } catch (err) {
      showToast("Failed to remove journey", "error");
    } finally {
      setTripToDelete(null);
    }
  };

  const handleToggleShare = async (id) => {
    try {
      const res = await api.patch(`/itinerary/toggle-public/${id}`);
      setSavedTrips(savedTrips.map(t => t._id === id ? res.data : t));
      if (selectedTrip && selectedTrip._id === id) {
        setSelectedTrip(res.data);
      }
      showToast(res.data.isPublic ? "Expedition is now public & shareable" : "Expedition set to private", "info");
    } catch (err) {
      showToast("Failed to toggle sharing permissions", "error");
    }
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setEditingDayIndex(null);
    setEditingDayData(null);
    setShowModal(true);
  };

  const copyShareLink = (id) => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    showToast("Shareable expedition dossier link copied to clipboard!", "success");
  };

  // Day Edit Handlers
  const startEditDay = (index) => {
    setEditingDayIndex(index);
    setEditingDayData(JSON.parse(JSON.stringify(selectedTrip.tripData[index])));
  };

  const cancelEditDay = () => {
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
    updated.places.push({ place_name: "New Landmark or Experience", entry_fee: 0 });
    setEditingDayData(updated);
  };

  const handleRemovePlace = (placeIndex) => {
    const updated = { ...editingDayData };
    if (updated.places.length <= 1) {
      showToast("Each day should feature at least one destination.", "error");
      return;
    }
    updated.places.splice(placeIndex, 1);
    setEditingDayData(updated);
  };

  const saveEditedDay = async (index) => {
    setSavingChanges(true);
    const updatedTripData = [...selectedTrip.tripData];
    updatedTripData[index] = editingDayData;

    try {
      await api.patch(`/itinerary/update-data/${selectedTrip._id}`, { tripData: updatedTripData });
      setSelectedTrip({ ...selectedTrip, tripData: updatedTripData });
      setSavedTrips(savedTrips.map(t => t._id === selectedTrip._id ? { ...t, tripData: updatedTripData } : t));
      setEditingDayIndex(null);
      setEditingDayData(null);
      showToast("Day plan updated and saved to your portfolio!", "success");
    } catch (err) {
      showToast("Failed to update day plan. Please try again.", "error");
    } finally {
      setSavingChanges(false);
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
    pdf.save(`${selectedTrip.destination}_Itinerary.pdf`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="dashboard-hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            <span className="eyebrow-text">BESPOKE TRAVEL CONCIERGE</span>
            <span className="eyebrow-line"></span>
          </div>

          <h1 className="hero-headline">
            Curated Expeditions & <br />
            <span>Artisanal Journeys</span>
          </h1>

          <p className="hero-lead">
            Plan personalized multi-day circuits, explore secluded retreats, and experience 
            intelligent expense tracking tailored to the finest standards of global travel.
          </p>

          <div className="hero-cta-group">
            <button 
              className="btn-primary-luxury"
              onClick={() => navigate("/create-trip")}
            >
              <Plus size={18} />
              <span>Plan a New Journey</span>
            </button>
            <button 
              className="btn-secondary-luxury"
              onClick={() => {
                const el = document.getElementById("collections-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Compass size={18} />
              <span>Explore Collections</span>
            </button>
          </div>

          {/* Luxury Quality Badges */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-number">60+</span>
              <span className="trust-label">Global & Domestic Destinations</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">Multi-City</span>
              <span className="trust-label">Circuit & Nearby Stop Routing</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">100%</span>
              <span className="trust-label">Budget Precision & Offline PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURATED TRAVEL PILLARS / COLLECTIONS */}
      <section className="collections-section" id="collections-section">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-kicker">CURATED EXPERIENCES</span>
            <h2 className="section-title">Explore by Travel Collection</h2>
            <p className="section-description">
              Select an archetype to begin designing an itinerary tailored to your vision.
            </p>
          </div>

          <div className="collections-grid">
            {TRAVEL_COLLECTIONS.map((col, idx) => {
              const IconComponent = col.icon;
              return (
                <div 
                  key={idx} 
                  className="collection-card"
                  onClick={() => navigate("/create-trip", { state: { prefillDestination: col.dest, prefillNearby: col.nearby || [] } })}
                >
                  <div className="collection-img-wrap">
                    <img src={col.image} alt={col.title} loading="lazy" />
                    <div className="collection-overlay" />
                    <div className="collection-badge">
                      <IconComponent size={14} />
                      <span>Collection</span>
                    </div>
                  </div>
                  <div className="collection-info">
                    <h3>{col.title}</h3>
                    <p>{col.subtitle}</p>
                    <span className="collection-link">
                      <span>Curate Itinerary</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SAVED TRIPS / PORTFOLIO */}
      <section className="trips-portfolio-section">
        <div className="section-container">
          <div className="portfolio-header">
            <div>
              <span className="section-kicker">PERSONAL PORTFOLIO</span>
              <h2 className="section-title">Your Saved Journeys</h2>
            </div>
            <button 
              className="btn-outline-forest"
              onClick={() => navigate("/create-trip")}
            >
              <Plus size={16} />
              <span>Create New Plan</span>
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Retrieving your bespoke itineraries...</p>
            </div>
          ) : savedTrips.length === 0 ? (
            <div className="empty-portfolio-box">
              <Compass size={44} color="#C4A46D" />
              <h3>Your Portfolio is Empty</h3>
              <p>You haven't planned any journeys yet. Start curating your first personalized expedition today.</p>
              <button 
                className="btn-primary-luxury" 
                style={{ marginTop: "20px" }}
                onClick={() => navigate("/create-trip")}
              >
                <Plus size={16} /> Plan First Trip
              </button>
            </div>
          ) : (
            <div className="trips-grid-luxury">
              {savedTrips.map((trip) => {
                const coverImage = `https://loremflickr.com/600/400/${encodeURIComponent(trip.destination.split(",")[0].trim())}`;
                
                return (
                  <div key={trip._id} className="luxury-trip-card">
                    <div className="card-media-wrap">
                      <img 
                        src={coverImage} 
                        alt={trip.destination} 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop"; }}
                      />
                      <div className="card-top-actions">
                        <span className="duration-pill">
                          <Calendar size={12} />
                          {trip.duration} Days
                        </span>
                        <div className="right-card-icons">
                          <button 
                            onClick={() => handleToggleShare(trip._id)} 
                            className="icon-action-btn"
                            title={trip.isPublic ? "Public Itinerary (Click to make private)" : "Private (Click to make public)"}
                          >
                            {trip.isPublic ? <Globe size={15} color="#10b981" /> : <Lock size={15} color="#777D78" />}
                          </button>
                          <button 
                            onClick={() => handleDelete(trip._id)} 
                            className="icon-action-btn delete-btn"
                            title="Delete this journey"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="trip-card-destination">{trip.destination}</h3>
                      <div className="trip-card-meta">
                        <div className="meta-item">
                          <span className="meta-label">Total Budget</span>
                          <span className="meta-value">₹{trip.budget.toLocaleString()}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Curated Days</span>
                          <span className="meta-value">{trip.tripData?.length || trip.duration} Days Plan</span>
                        </div>
                      </div>

                      <div className="card-footer-btns">
                        <button 
                          className="btn-view-plan"
                          onClick={() => handleViewTrip(trip)}
                        >
                          <span>View & Edit Plan</span>
                          <ArrowRight size={14} />
                        </button>
                        {trip.isPublic && (
                          <button 
                            onClick={() => copyShareLink(trip._id)} 
                            className="btn-share-link"
                            title="Copy shareable link"
                          >
                            <Share2 size={14} />
                            <span>Share</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. LUXURY EDITORIAL FOOTER */}
      <footer className="luxury-footer">
        <div className="footer-container">
          <div className="footer-top-grid">
            <div className="footer-brand-col">
              <div className="footer-logo">
                <Compass size={22} color="#C4A46D" />
                <span>TOURAI</span>
              </div>
              <p className="footer-tagline">
                The art of bespoke luxury travel. Transforming dream destinations into flawlessly curated, 
                budget-conscious multi-day itineraries.
              </p>
              <div className="footer-gold-seal">
                <ShieldCheck size={16} color="#C4A46D" />
                <span>Authentic Global & Domestic Travel Intelligence</span>
              </div>
            </div>

            <div className="footer-col">
              <h4>Destinations</h4>
              <ul>
                <li><a href="#collections-section">Heritage Palaces & Forts</a></li>
                <li><a href="#collections-section">Alpine & Hill Retreats</a></li>
                <li><a href="#collections-section">Coastal & Island Sanctuaries</a></li>
                <li><a href="#collections-section">Metropolitan Architecture</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Concierge Services</h4>
              <ul>
                <li><span onClick={() => navigate("/create-trip")} style={{ cursor: "pointer" }}>Bespoke Trip Creator</span></li>
                <li><span onClick={() => navigate("/create-trip")} style={{ cursor: "pointer" }}>Multi-City Routing (e.g. Ooty + Mysuru)</span></li>
                <li><span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>In-Place Day Customization</span></li>
                <li><span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Offline PDF Dossier Export</span></li>
              </ul>
            </div>

            <div className="footer-newsletter-col">
              <h4>The Traveler's Journal</h4>
              <p>Receive seasonal destination guides, secret hotel openings, and exclusive circuit inspirations.</p>
              
              {newsletterSubscribed ? (
                <div className="newsletter-success">
                  <Check size={16} />
                  <span>Thank you. You have been subscribed to our journal.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Subscribe</button>
                </form>
              )}
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>© {new Date().getFullYear()} TourAI Bespoke Voyages. All rights reserved.</p>
            <div className="footer-links-inline">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Concierge Desk</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. DETAILED VIEW & EDIT MODAL */}
      {showModal && selectedTrip && (
        <div className="modalOverlay">
          <div className="premium-modal">
             <div className="itinerary-view">
                <div className="itinerary-header">
                   <div>
                     <h2>{selectedTrip.destination}</h2>
                     <p>{selectedTrip.duration} Days Plan • ₹{selectedTrip.budget.toLocaleString()}</p>
                   </div>
                   <div className="action-btns">
                      <button onClick={downloadPDF} className="pdf-btn"><Download size={16} /> Export PDF</button>
                      <button onClick={() => setShowModal(false)} className="save-btn" style={{ background: "#F7F7F4", color: "#292D2A", borderColor: "#E8E9E5" }}>
                         <X size={16} /> Close
                      </button>
                   </div>
                </div>

                <div className="itinerary-scroll" ref={itineraryRef}>
                   {/* EXECUTIVE EXPEDITION FINANCIAL DOSSIER */}
                   {(() => {
                     const tripDays = selectedTrip?.tripData || [];
                     const totalDaysCount = tripDays.length || selectedTrip?.duration || 1;
                     const totalTransportExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.transport || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.18)), 0);
                     const totalStayExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.stay || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.40)), 0);
                     const totalFoodExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.food || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.22)), 0);
                     const totalActivitiesExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.activities || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.12)), 0);
                     const totalAllCalculated = totalTransportExp + totalStayExp + totalFoodExp + totalActivitiesExp || selectedTrip?.budget || 1;

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
                                   const el = document.getElementById(`dash-day-${i}`);
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

                   {/* WEATHER & MAP */}
                   <div className="modal-addons" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                      <WeatherCard destination={selectedTrip.destination} />
                      <MapPreview destination={selectedTrip.destination} places={selectedTrip.tripData[0]?.places} />
                   </div>

                   {selectedTrip.tripData.map((day, index) => {
                     let spentSoFar = selectedTrip.tripData.slice(0, index + 1).reduce((acc, d) => acc + (d.budget_breakdown?.total_for_day || 0), 0);
                     let remainingBalance = selectedTrip.budget - spentSoFar;
                     const isThisDayEditing = editingDayIndex === index;
                     
                     return (
                       <div className="premium-day-card" key={index} id={`dash-day-${index}`}>
                          <div className="day-side">
                             <div className="day-num">Day {day.day}</div>
                             <div className="time-line"><Clock size={13} /> {day.best_time}</div>
                             
                             <div className="budget-tracker-side">
                               <div className="spent">Spent: ₹{day.budget_breakdown?.total_for_day}</div>
                               <div className="balance">Left: ₹{remainingBalance < 0 ? 0 : remainingBalance}</div>
                             </div>

                             {/* EDIT TOGGLE BUTTON */}
                             {!isThisDayEditing ? (
                               <button 
                                 className="edit-day-action-btn"
                                 onClick={() => startEditDay(index)}
                                 title="Edit places, food, description and budget for this day"
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
                             {/* EDIT FORM FOR DAY */}
                             {isThisDayEditing && editingDayData ? (
                               <div className="day-edit-container">
                                  <div className="edit-section-header">
                                    <Sparkles size={16} color="#263C32" />
                                    <span>Edit Day {editingDayData.day} Plan</span>
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
                                      <label>Day Expense Budget (₹)</label>
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

                                  {/* EDIT FOOD */}
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

                                  {/* SAVE / CANCEL BUTTONS */}
                                  <div className="day-edit-actions">
                                    <button 
                                      type="button" 
                                      className="save-day-changes-btn"
                                      disabled={savingChanges}
                                      onClick={() => saveEditedDay(index)}
                                    >
                                      <Check size={16} /> {savingChanges ? "Saving..." : "Save Changes"}
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
                               /* NORMAL DISPLAY VIEW */
                               <>
                                 <div className="place-grid">
                                    {day.places.map((p, i) => {
                                      const placeName = typeof p === "string" ? p : p.place_name;
                                      const imageUrl = `https://loremflickr.com/400/300/${encodeURIComponent(placeName + "," + selectedTrip.destination)}`;
                                      return (
                                        <div key={i} className="mini-place-card">
                                           <img src={imageUrl} alt={placeName} onError={(e) => { e.target.src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=400&auto=format&fit=crop"; }} />
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
                                      <UtensilsCrossed size={16} color="#C4A46D" />
                                      <span>Must Try: <strong>{day.special_food.food_name}</strong></span>
                                      {day.special_food.cost > 0 && <b>~₹{day.special_food.cost}</b>}
                                   </div>
                                 )}

                                 <div className="day-desc">{day.description}</div>
                                 
                                 {/* EXPLICIT TRAVEL EXPENSE & BREAKDOWN */}
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
                                    <div className="tag"><Sparkles size={12} color="#263C32" /> {day.interest}</div>
                                    <div className="day-cost">Est. ₹{day.budget_breakdown?.total_for_day?.toLocaleString()}</div>
                                 </div>
                               </>
                             )}
                          </div>
                        </div>
                      );
                   })}
                </div>
             </div>
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

      {/* LUXURY DELETION CONFIRMATION DIALOG */}
      {tripToDelete && (
        <div className="modalOverlay" style={{ zIndex: 3000 }}>
          <div className="confirm-modal-box">
            <div className="confirm-icon-wrap">
              <AlertCircle size={26} color="#d9534f" />
            </div>
            <h3>Decommission Itinerary?</h3>
            <p>Are you sure you wish to remove this bespoke itinerary from your private vault? This action cannot be undone.</p>
            <div className="confirm-actions-row">
              <button className="confirm-btn-cancel" onClick={() => setTripToDelete(null)}>
                Keep Itinerary
              </button>
              <button className="confirm-btn-delete" onClick={confirmDelete}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LUXURY DASHBOARD STYLES */}
      <style>{`
        .dashboard-wrapper {
          min-height: 100vh;
          background-color: #FFFFFF;
          color: #292D2A;
          overflow-x: hidden;
        }

        /* HERO */
        .dashboard-hero {
          background-color: #F7F7F4;
          padding: 130px 24px 80px 24px;
          border-bottom: 1px solid #E8E9E5;
          text-align: center;
        }

        .hero-inner {
          max-width: 960px;
          margin: 0 auto;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .eyebrow-line {
          width: 30px;
          height: 1px;
          background-color: #C4A46D;
        }

        .eyebrow-text {
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: #C4A46D;
          text-transform: uppercase;
        }

        .hero-headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 3.4rem;
          font-weight: 700;
          line-height: 1.18;
          color: #292D2A;
          margin: 0 0 20px 0;
          letter-spacing: -0.02em;
        }

        .hero-headline span {
          color: #263C32;
          font-style: italic;
        }

        .hero-lead {
          font-size: 1.12rem;
          color: #777D78;
          max-width: 680px;
          margin: 0 auto 36px auto;
          line-height: 1.7;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 50px;
        }

        .btn-primary-luxury {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: #263C32;
          color: #FFFFFF;
          border: 1px solid #263C32;
          padding: 14px 32px;
          border-radius: 4px;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-primary-luxury:hover {
          background-color: #1b2c24;
          border-color: #1b2c24;
          box-shadow: 0 8px 24px rgba(38, 60, 50, 0.15);
          transform: translateY(-2px);
        }

        .btn-secondary-luxury {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: #FFFFFF;
          color: #263C32;
          border: 1px solid #263C32;
          padding: 14px 28px;
          border-radius: 4px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-secondary-luxury:hover {
          background-color: #F7F7F4;
        }

        .hero-trust-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding-top: 32px;
          border-top: 1px solid #E8E9E5;
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .trust-number {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #263C32;
        }

        .trust-label {
          font-size: 0.78rem;
          color: #777D78;
          margin-top: 2px;
        }

        .trust-divider {
          width: 1px;
          height: 34px;
          background-color: #E8E9E5;
        }

        /* COLLECTIONS SECTION */
        .collections-section {
          padding: 90px 24px;
          background-color: #FFFFFF;
        }

        .section-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .section-header-centered {
          text-align: center;
          max-width: 620px;
          margin: 0 auto 50px auto;
        }

        .section-kicker {
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: #C4A46D;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.3rem;
          color: #292D2A;
          margin: 0 0 12px 0;
        }

        .section-description {
          color: #777D78;
          font-size: 0.98rem;
          margin: 0;
        }

        .collections-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .collection-card {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .collection-card:hover {
          border-color: #263C32;
          box-shadow: 0 14px 30px rgba(38, 60, 50, 0.08);
          transform: translateY(-4px);
        }

        .collection-img-wrap {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .collection-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .collection-card:hover .collection-img-wrap img {
          transform: scale(1.06);
        }

        .collection-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
        }

        .collection-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(38, 60, 50, 0.85);
          backdrop-filter: blur(4px);
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .collection-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .collection-info h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.22rem;
          color: #292D2A;
          margin: 0 0 6px 0;
        }

        .collection-info p {
          color: #777D78;
          font-size: 0.85rem;
          margin: 0 0 16px 0;
          flex: 1;
        }

        .collection-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #263C32;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* PORTFOLIO SECTION */
        .trips-portfolio-section {
          padding: 80px 24px 100px 24px;
          background-color: #F7F7F4;
          border-top: 1px solid #E8E9E5;
        }

        .portfolio-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .btn-outline-forest {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #FFFFFF;
          color: #263C32;
          border: 1px solid #263C32;
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline-forest:hover {
          background-color: #263C32;
          color: #FFFFFF;
        }

        .empty-portfolio-box {
          background: #FFFFFF;
          border: 1px dashed #E8E9E5;
          border-radius: 8px;
          padding: 60px 20px;
          text-align: center;
          max-width: 580px;
          margin: 0 auto;
        }

        .empty-portfolio-box h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem;
          color: #292D2A;
          margin: 16px 0 8px 0;
        }

        .empty-portfolio-box p {
          color: #777D78;
          font-size: 0.95rem;
          margin: 0 auto;
          max-width: 440px;
        }

        .trips-grid-luxury {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .luxury-trip-card {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }

        .luxury-trip-card:hover {
          border-color: #263C32;
          box-shadow: 0 12px 28px rgba(41, 45, 42, 0.08);
          transform: translateY(-3px);
        }

        .card-media-wrap {
          position: relative;
          height: 210px;
          overflow: hidden;
          background-color: #E8E9E5;
        }

        .card-media-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .luxury-trip-card:hover .card-media-wrap img {
          transform: scale(1.04);
        }

        .card-top-actions {
          position: absolute;
          top: 14px;
          left: 14px;
          right: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .duration-pill {
          background: rgba(38, 60, 50, 0.9);
          backdrop-filter: blur(4px);
          color: #FFFFFF;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .right-card-icons {
          display: flex;
          gap: 6px;
        }

        .icon-action-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border: 1px solid #E8E9E5;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .icon-action-btn:hover {
          background: #FFFFFF;
          border-color: #263C32;
        }

        .icon-action-btn.delete-btn:hover {
          border-color: #d9534f;
          color: #d9534f;
        }

        .card-body {
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .trip-card-destination {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.35rem;
          color: #292D2A;
          margin: 0 0 14px 0;
          line-height: 1.3;
        }

        .trip-card-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 12px 0;
          border-top: 1px solid #E8E9E5;
          border-bottom: 1px solid #E8E9E5;
          margin-bottom: 18px;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
        }

        .meta-label {
          font-size: 0.72rem;
          color: #777D78;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .meta-value {
          font-size: 0.98rem;
          font-weight: 700;
          color: #263C32;
          margin-top: 2px;
        }

        .card-footer-btns {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }

        .btn-view-plan {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background-color: #263C32;
          color: #FFFFFF;
          border: 1px solid #263C32;
          padding: 11px;
          border-radius: 4px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-view-plan:hover {
          background-color: #1b2c24;
        }

        .btn-share-link {
          display: flex;
          align-items: center;
          gap: 5px;
          background-color: #FFFFFF;
          color: #777D78;
          border: 1px solid #E8E9E5;
          padding: 0 14px;
          border-radius: 4px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-share-link:hover {
          border-color: #263C32;
          color: #263C32;
        }

        /* FOOTER */
        .luxury-footer {
          background-color: #263C32;
          color: #FFFFFF;
          padding: 80px 24px 30px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1.8fr;
          gap: 40px;
          padding-bottom: 60px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.4rem;
          letter-spacing: 2px;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 16px;
        }

        .footer-tagline {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 320px;
        }

        .footer-gold-seal {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #C4A46D;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .footer-col h4,
        .footer-newsletter-col h4 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.15rem;
          color: #FFFFFF;
          margin-bottom: 20px;
        }

        .footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-col li {
          margin-bottom: 12px;
        }

        .footer-col a,
        .footer-col span {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.88rem;
          transition: color 0.2s;
        }

        .footer-col a:hover,
        .footer-col span:hover {
          color: #C4A46D;
        }

        .footer-newsletter-col p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.88rem;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .newsletter-form {
          display: flex;
          gap: 8px;
        }

        .newsletter-form input {
          flex: 1;
          height: 44px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          padding: 0 14px;
          color: #FFFFFF;
          font-size: 0.88rem;
          outline: none;
        }

        .newsletter-form input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .newsletter-form input:focus {
          border-color: #C4A46D;
        }

        .newsletter-form button {
          background-color: #C4A46D;
          color: #263C32;
          border: none;
          padding: 0 18px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .newsletter-form button:hover {
          background-color: #b0915a;
        }

        .newsletter-success {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #C4A46D;
          font-size: 0.88rem;
          font-weight: 500;
        }

        .footer-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 26px;
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-links-inline {
          display: flex;
          gap: 10px;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .collections-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .trips-grid-luxury {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-top-grid {
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-hero {
            padding: 100px 20px 50px 20px;
          }
          .hero-headline {
            font-size: 2.3rem;
          }
          .hero-cta-group {
            flex-direction: column;
            width: 100%;
          }
          .btn-primary-luxury,
          .btn-secondary-luxury {
            width: 100%;
            justify-content: center;
          }
          .hero-trust-bar {
            flex-direction: column;
            gap: 16px;
          }
          .trust-divider {
            display: none;
          }
          .collections-grid {
            grid-template-columns: 1fr;
          }
          .trips-grid-luxury {
            grid-template-columns: 1fr;
          }
          .portfolio-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .footer-top-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom-bar {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
