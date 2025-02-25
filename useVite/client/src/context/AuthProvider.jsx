import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
	const [auth, setAuth] = useState(() => {
		// Retrieve the auth data from localStorage
		const savedAuth = sessionStorage.getItem("auth");
		return savedAuth ? JSON.parse(savedAuth) : {};
	});

	useEffect(() => {
		// Persist auth state to localStorage whenever it changes
		sessionStorage.setItem("auth", JSON.stringify(auth));
	}, [auth]);

	return (
		<AuthContext.Provider value={{ auth, setAuth }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;