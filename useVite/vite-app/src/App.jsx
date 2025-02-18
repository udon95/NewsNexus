// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// // import './App.css'
// import Login from "./pages/login.jsx";
// import "./index.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import "./index.css";

function App() {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App
