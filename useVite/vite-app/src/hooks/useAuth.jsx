import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import { BrowserRouter } from "react-router-dom";

const useAuth = () => {
	return useContext(AuthContext);
};

export default useAuth;