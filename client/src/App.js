import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SubscriptionPage from "./pages/SubscriptionPage";
import TopicInterestsPage from "./pages/TopicInterestsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/topics" />} /> {/* Redirect to topics page */}
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/topics" element={<TopicInterestsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
