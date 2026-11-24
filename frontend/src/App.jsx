import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import ItineraryResult from "./pages/ItineraryResult";
import PublicView from "./pages/PublicView";

function AppLayout() {
  const location = useLocation();

  // ❌ Hide navbar on these routes
  const hideNavbarRoutes = ["/login", "/register"];
  const isSharePage = location.pathname.startsWith("/share/");
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname) && !isSharePage;

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/itinerary" element={<ItineraryResult />} />
        <Route path="/share/:id" element={<PublicView />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
