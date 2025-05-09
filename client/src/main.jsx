import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import {AuthProvider} from "./context/AuthContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/*" element={<App />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
);