import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SubscriptionPage from "./pages/SubscriptionPage";
import TopicInterestsPage from "./pages/TopicInterestsPage";
import ViewRoomsPage from "./pages/ViewRoomsPage";
import RoomPage from "./pages/RoomPage"; // Import the Room Page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/rooms" />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/topics" element={<TopicInterestsPage />} />
        <Route path="/rooms" element={<ViewRoomsPage />} />
        <Route path="/room/:id" element={<RoomPage />} /> {/* Handles individual rooms */}
      </Routes>
    </Router>
  );
}

export default App;
