import { useState, useEffect } from "react";
import axios from "axios";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Compass } from "lucide-react";

const WeatherCard = ({ destination }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const city = (destination || "").split("+")[0].split(",")[0].trim();
        // Using Open-Meteo as it's free and requires no API key
        const geoRes = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        
        if (geoRes.data.results && geoRes.data.results.length > 0) {
          const { latitude, longitude } = geoRes.data.results[0];
          const weatherRes = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          setWeather(weatherRes.data.current_weather);
        }
      } catch (err) {
        console.error("Weather fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (destination) fetchWeather();
  }, [destination]);

  if (loading) {
    return (
      <div className="luxury-weather-skeleton">
        <div className="skeleton-pulse">Fetching destination climate forecast...</div>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="weather-svg sun" size={26} />;
    if (code <= 3) return <Cloud className="weather-svg cloud" size={26} />;
    if (code >= 51) return <CloudRain className="weather-svg rain" size={26} />;
    return <Cloud className="weather-svg" size={26} />;
  };

  const getConditionText = (code) => {
    if (code === 0) return "Clear Skies";
    if (code <= 3) return "Partly Cloudy";
    if (code >= 51 && code <= 65) return "Light Rain";
    if (code > 65) return "Precipitation Expected";
    return "Temperate Conditions";
  };

  return (
    <div className="luxury-weather-widget">
      <div className="weather-header-row">
        <div className="weather-kicker">
          <span className="kicker-dot"></span>
          <span>CURRENT DESTINATION CLIMATE</span>
        </div>
        <div className="weather-condition-badge">
          {getConditionText(weather.weathercode)}
        </div>
      </div>

      <div className="weather-body-row">
        <div className="weather-primary-col">
          <div className="weather-icon-box">
            {getWeatherIcon(weather.weathercode)}
          </div>
          <div className="weather-temp-info">
            <span className="weather-temp-val">{Math.round(weather.temperature)}°C</span>
            <span className="weather-sub">Avg Daytime Temp</span>
          </div>
        </div>

        <div className="weather-details-col">
          <div className="weather-stat-item">
            <Wind size={15} className="stat-icon" />
            <div className="stat-text">
              <span className="stat-label">Breeze</span>
              <span className="stat-val">{weather.windspeed} km/h</span>
            </div>
          </div>

          <div className="weather-stat-divider"></div>

          <div className="weather-stat-item">
            <Thermometer size={15} className="stat-icon" />
            <div className="stat-text">
              <span className="stat-label">Atmosphere</span>
              <span className="stat-val">Mild & Pleasant</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .luxury-weather-widget {
          background: #FFFFFF;
          border: 1px solid #E8E9E5;
          border-radius: 8px;
          padding: 18px 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(41, 45, 42, 0.03);
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .luxury-weather-skeleton {
          background: #F7F7F4;
          border: 1px dashed #E8E9E5;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 24px;
          text-align: center;
          font-size: 0.85rem;
          color: #777D78;
        }
        .skeleton-pulse {
          animation: pulseFade 1.6s ease-in-out infinite;
        }
        @keyframes pulseFade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .weather-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid #F7F7F4;
        }
        .weather-kicker {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #C4A46D;
          text-transform: uppercase;
        }
        .kicker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #263C32;
        }
        .weather-condition-badge {
          font-size: 0.78rem;
          font-weight: 600;
          color: #263C32;
          background: #F7F7F4;
          padding: 3px 10px;
          border-radius: 4px;
          border: 1px solid #E8E9E5;
        }
        .weather-body-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .weather-primary-col {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .weather-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #F7F7F4;
          border: 1px solid #E8E9E5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .weather-svg.sun { color: #C4A46D; }
        .weather-svg.cloud { color: #465747; }
        .weather-svg.rain { color: #263C32; }
        .weather-temp-info {
          display: flex;
          flex-direction: column;
        }
        .weather-temp-val {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.85rem;
          font-weight: 700;
          color: #292D2A;
          line-height: 1;
        }
        .weather-sub {
          font-size: 0.75rem;
          color: #777D78;
          margin-top: 4px;
        }
        .weather-details-col {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .weather-stat-divider {
          width: 1px;
          height: 32px;
          background: #E8E9E5;
        }
        .weather-stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stat-icon {
          color: #465747;
        }
        .stat-text {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #777D78;
        }
        .stat-val {
          font-size: 0.88rem;
          font-weight: 600;
          color: #292D2A;
        }
      `}</style>
    </div>
  );
};

export default WeatherCard;
