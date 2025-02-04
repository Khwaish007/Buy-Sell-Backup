import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password, recaptchaToken) => {
    try {
      if (email && password && recaptchaToken) {
        const response = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          credentials: "include", 
          body: JSON.stringify({ email, password, recaptchaToken }) // Include token
        });
        const data = await response.json();
        console.log("Login response:", data); 
        if (response.ok && data.token) { 
          localStorage.setItem("authToken", data.token);
          console.log("Stored token:", data.token);
          const userResponse = await fetch("http://localhost:5000/api/user/profile", {
            headers: {
              "Authorization": `Bearer ${data.token}`,
              "Content-Type": "application/json"
            }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }
          return { success: true, token: data.token, redirect: data.redirect };
        } else {
          throw new Error(data.message || "No token received from server");
        }
      } else {
        throw new Error("Missing email, password, or reCAPTCHA token");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await fetch("http://localhost:5000/api/user/profile", {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;