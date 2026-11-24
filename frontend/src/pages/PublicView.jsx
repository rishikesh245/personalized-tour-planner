import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { 
  Clock, 
  Download, 
  Sparkles, 
  UtensilsCrossed, 
  MapPin, 
  Calendar, 
  Wallet,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Car
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import WeatherCard from "../components/WeatherCard";
import MapPreview from "../components/MapPreview";
import "./style.css";

const PublicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itineraryRef = useRef(null);

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        const res = await api.get(`/itinerary/public/${id}`);
        setTrip(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "This itinerary is private or no longer available.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrip();
  }, [id]);

  const downloadPDF = async () => {
    const element = itineraryRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${trip.destination}_Itinerary.pdf`);
  };

  if (loading) {
    return (
      <div className="public-loading-screen">
        <div className="loader"></div>
        <p className="loading-caption">Retrieving bespoke travel dossier...</p>
        <style>{`
          .public-loading-screen {
            min-height: 100vh;
            background: #F7F7F4;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', sans-serif;
          }
          .loading-caption {
            color: #777D78;
            font-size: 0.95rem;
            margin-top: 14px;
            letter-spacing: 0.5px;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-error-screen">
        <div className="error-card">
          <div className="error-badge">
            <Compass size={24} color="#C4A46D" />
          </div>
          <h2 className="error-title">Itinerary Unavailable</h2>
          <p className="error-desc">{error}</p>
          <div className="error-actions">
            <button className="btn-primary-luxury" onClick={() => navigate("/")}>
              <span>Return to Concierge</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <style>{`
          .public-error-screen {
            min-height: 100vh;
            background: #F7F7F4;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: 'DM Sans', sans-serif;
          }
          .error-card {
            background: #FFFFFF;
            border: 1px solid #E8E9E5;
            border-radius: 12px;
            padding: 48px 40px;
            max-width: 480px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(41, 45, 42, 0.05);
          }
          .error-badge {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #F7F7F4;
            border: 1px solid #E8E9E5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px auto;
          }
          .error-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 1.85rem;
            color: #292D2A;
            margin: 0 0 10px 0;
          }
          .error-desc {
            color: #777D78;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 28px;
          }
        `}</style>
      </div>
    );
  }

  const itinerary = trip?.tripData || [];

  return (
    <div className="public-dossier-wrapper">
      {/* 1. TOP BRAND HEADER */}
      <header className="public-brand-header">
        <div className="public-brand-container">
          <Link to="/" className="public-brand-logo">
            <div className="brand-compass-icon">
              <Compass size={18} color="#C4A46D" />
            </div>
            <div className="brand-titles">
              <span className="brand-main">TOURAI</span>
              <span className="brand-sub">BESPOKE TRAVEL CONCIERGE</span>
            </div>
          </Link>

          <div className="public-header-actions">
            <Link to="/" className="header-link-simple">
              <ChevronLeft size={16} />
              <span>Explore Voyages</span>
            </Link>
            <button 
              className="btn-create-voyage"
              onClick={() => navigate("/create-trip")}
            >
              <span>Curate Your Own Trip</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN DOSSIER CONTAINER */}
      <main className="public-main-content">
        <div className="public-dossier-card">
          {/* Editorial Itinerary Header */}
          <div className="dossier-header-band">
            <div>
              <div className="dossier-eyebrow">
                <span className="eyebrow-accent"></span>
                <span>CURATED TRAVEL DOSSIER</span>
              </div>
              <h1 className="dossier-destination">{trip.destination}</h1>
              <div className="dossier-meta-row">
                <div className="meta-pill">
                  <Calendar size={14} />
                  <span>{trip.duration} Days Circuit</span>
                </div>
                <div className="meta-pill">
                  <Wallet size={14} />
                  <span>Est. ₹{trip.budget?.toLocaleString()}</span>
                </div>
                {trip.user?.name && (
                  <div className="meta-pill curator">
                    <span>Curated for {trip.user.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="dossier-actions">
              <button onClick={downloadPDF} className="btn-download-pdf">
                <Download size={16} />
                <span>Download PDF Dossier</span>
              </button>
            </div>
          </div>

          {/* Meteorological & Cartographic Overview */}
          <div className="dossier-widgets-grid">
            <WeatherCard destination={trip.destination} />
            {itinerary.length > 0 && itinerary[0]?.places && (
              <MapPreview destination={trip.destination} places={itinerary[0].places} />
            )}
          </div>

          {/* Day-by-Day Timeline */}
          <div className="itinerary-scroll" ref={itineraryRef} style={{ overflow: "visible" }}>
            {/* EXECUTIVE EXPEDITION FINANCIAL DOSSIER */}
            {(() => {
              const tripDays = trip?.tripData || [];
              const totalDaysCount = tripDays.length || trip?.duration || 1;
              const totalTransportExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.transport || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.18)), 0);
              const totalStayExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.stay || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.40)), 0);
              const totalFoodExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.food || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.22)), 0);
              const totalActivitiesExp = tripDays.reduce((sum, d) => sum + (d.budget_breakdown?.activities || Math.round((d.budget_breakdown?.total_for_day || 0) * 0.12)), 0);
              const totalAllCalculated = totalTransportExp + totalStayExp + totalFoodExp + totalActivitiesExp || trip?.budget || 1;

              const pctTransit = Math.max(5, Math.round((totalTransportExp / totalAllCalculated) * 100));
              const pctStay = Math.max(5, Math.round((totalStayExp / totalAllCalculated) * 100));
              const pctFood = Math.max(5, Math.round((totalFoodExp / totalAllCalculated) * 100));
              const pctSightseeing = Math.max(5, 100 - (pctTransit + pctStay + pctFood));

              return (
                <div className="executive-dossier-card" style={{ marginBottom: "32px" }}>
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
                            const el = document.getElementById(`public-day-${i}`);
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

            <div className="timeline-section-title">
              <span className="title-rule"></span>
              <h3>DAY-BY-DAY CURATED SCHEDULE</h3>
              <span className="title-rule"></span>
            </div>

            {itinerary.map((day, index) => {
              const spentSoFar = itinerary
                .slice(0, index + 1)
                .reduce((acc, d) => acc + (d.budget_breakdown?.total_for_day || 0), 0);
              const remainingBalance = trip.budget - spentSoFar;

              return (
                <div className="premium-day-card" key={index} id={`public-day-${index}`}>
                  <div className="day-side">
                    <div className="day-num">Day {day.day || index + 1}</div>
                    <div className="time-line">
                      <Clock size={14} /> 
                      <span>{day.best_time || "Morning to Evening"}</span>
                    </div>
                    {day.budget_breakdown && (
                      <div className="budget-tracker-side">
                        <div className="spent">Spent: ₹{day.budget_breakdown.total_for_day?.toLocaleString()}</div>
                        <div className="balance">Left: ₹{remainingBalance < 0 ? 0 : remainingBalance?.toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  <div className="day-main">
                    {/* Featured Places */}
                    <div className="place-grid">
                      {day.places && day.places.map((p, i) => {
                        const placeName = typeof p === "string" ? p : p.place_name;
                        const fee = typeof p === "object" ? p.entry_fee : null;
                        return (
                          <div key={i} className="mini-place-card">
                            <img 
                              src={`https://loremflickr.com/400/300/${encodeURIComponent(placeName || "landmark")}`} 
                              alt={placeName} 
                              loading="lazy"
                            />
                            <div className="mini-info">
                              <h6>{placeName}</h6>
                              {fee > 0 ? (
                                <span>Entry: ₹{fee}</span>
                              ) : (
                                <span style={{ color: "#777D78" }}>Complimentary</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Culinary Highlight */}
                    {day.special_food && (
                      <div className="food-highlight">
                        <UtensilsCrossed size={16} />
                        <span>
                          Gastronomic Highlight: <strong>{day.special_food.food_name}</strong>
                          {day.special_food.cost > 0 && ` (~₹${day.special_food.cost})`}
                        </span>
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
                      <div className="tag">
                        <Sparkles size={12} /> 
                        <span>{day.interest || "Curated Discovery"}</span>
                      </div>
                      <div className="day-cost">
                        Est. ₹{day.budget_breakdown?.total_for_day?.toLocaleString() || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Conversion Banner */}
          <div className="public-bottom-cta">
            <div className="cta-left">
              <h4>Ready to curate your next expedition?</h4>
              <p>Design bespoke multi-city circuits with intelligent budgeting and recommendations.</p>
            </div>
            <button className="btn-primary-luxury" onClick={() => navigate("/create-trip")}>
              <span>Start Planning</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="public-footer">
        <p>© {new Date().getFullYear()} TourAI Bespoke Voyages. All rights reserved.</p>
      </footer>

      <style>{`
        .public-dossier-wrapper {
          min-height: 100vh;
          background-color: #F7F7F4;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #292D2A;
        }
        .public-brand-header {
          background: #FFFFFF;
          border-bottom: 1px solid #E8E9E5;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .public-brand-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .public-brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .brand-compass-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #263C32;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-titles {
          display: flex;
          flex-direction: column;
        }
        .brand-main {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #263C32;
          line-height: 1.1;
        }
        .brand-sub {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 1.2px;
          color: #C4A46D;
        }
        .public-header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .header-link-simple {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #777D78;
          font-size: 0.88rem;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .header-link-simple:hover {
          color: #263C32;
        }
        .btn-create-voyage {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #263C32;
          color: #FFFFFF;
          border: 1px solid #263C32;
          padding: 8px 18px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-create-voyage:hover {
          background: #1b2c24;
          border-color: #1b2c24;
        }
        .public-main-content {
          max-width: 1140px;
          margin: 40px auto 60px auto;
          padding: 0 24px;
        }
        .public-dossier-card {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 12px;
          padding: 44px;
          box-shadow: 0 10px 30px rgba(41, 45, 42, 0.04);
        }
        .dossier-header-band {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          padding-bottom: 28px;
          border-bottom: 1px solid #E8E9E5;
          margin-bottom: 30px;
        }
        .dossier-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #C4A46D;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .eyebrow-accent {
          width: 18px;
          height: 2px;
          background: #C4A46D;
        }
        .dossier-destination {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: #292D2A;
          margin: 0 0 12px 0;
          line-height: 1.15;
        }
        .dossier-meta-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .meta-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #F7F7F4;
          border: 1px solid #E8E9E5;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 0.82rem;
          font-weight: 500;
          color: #292D2A;
        }
        .meta-pill.curator {
          color: #263C32;
          font-weight: 600;
        }
        .btn-download-pdf {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          color: #263C32;
          border: 1px solid #263C32;
          padding: 11px 22px;
          border-radius: 4px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-download-pdf:hover {
          background: #263C32;
          color: #FFFFFF;
        }
        .dossier-widgets-grid {
          margin-bottom: 32px;
        }
        .timeline-section-title {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 36px 0 28px 0;
        }
        .timeline-section-title h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #263C32;
          margin: 0;
          white-space: nowrap;
        }
        .title-rule {
          flex: 1;
          height: 1px;
          background: #E8E9E5;
        }
        .public-bottom-cta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #F7F7F4;
          border: 1px solid #E8E9E5;
          border-radius: 8px;
          padding: 28px 32px;
          margin-top: 40px;
          gap: 20px;
          flex-wrap: wrap;
        }
        .cta-left h4 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.35rem;
          color: #292D2A;
          margin: 0 0 6px 0;
        }
        .cta-left p {
          color: #777D78;
          font-size: 0.9rem;
          margin: 0;
        }
        .public-footer {
          text-align: center;
          padding: 30px 24px;
          border-top: 1px solid #E8E9E5;
          background: #FFFFFF;
          color: #777D78;
          font-size: 0.82rem;
        }
        @media (max-width: 768px) {
          .public-dossier-card {
            padding: 24px 18px;
          }
          .dossier-destination {
            font-size: 1.85rem;
          }
          .public-header-actions .header-link-simple {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicView;