import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SubscriptionPage from "./pages/SubscriptionPage";
import TopicInterestsPage from "./pages/TopicInterestsPage";
import ViewRoomsPage from "./pages/ViewRoomsPage";
import RegisterPage from "./pages/RegisterPage";
import RoomPage from "./pages/RoomPage"; // Import the Room Page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/subscription" />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/topics" element={<TopicInterestsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rooms" element={<ViewRoomsPage />} />
        <Route path="/room/:id" element={<RoomPage />} /> {/* Handles individual rooms */}
      </Routes>
    </Router>
  );
}

export default App;
