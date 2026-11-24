import { useNavigate } from "react-router-dom";
import { Compass, Plus } from "lucide-react";
import "./style.css";

function ItineraryResult() {
  const navigate = useNavigate();

  return (
    <div className="premium-page">
      <div className="glass-container" style={{ textAlign: "center", maxWidth: "600px", padding: "60px 40px" }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#F7F7F4",
          border: "1px solid #E8E9E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px auto"
        }}>
          <Compass size={24} color="#C4A46D" />
        </div>
        <h2 className="premium-title" style={{ fontSize: "2rem" }}>Curate a New Voyage</h2>
        <p className="premium-subtitle" style={{ marginBottom: "30px" }}>
          Explore custom multi-city destinations or access saved itineraries directly from your private portfolio.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="next-btn" style={{ maxWidth: "220px", marginTop: 0 }} onClick={() => navigate("/create-trip")}>
            <Plus size={16} />
            <span>Plan Itinerary</span>
          </button>
          <button className="pdf-btn" style={{ padding: "12px 24px" }} onClick={() => navigate("/")}>
            <span>View Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItineraryResult;
  