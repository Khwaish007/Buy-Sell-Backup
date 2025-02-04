import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CASLoginSuccess = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const hasRun = useRef(false); // Track if the effect has run

  useEffect(() => {
    if (hasRun.current) return; // Prevent running twice
    hasRun.current = true;

    const handleLogin = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          throw new Error("No token received");
        }

        // Store the token
        localStorage.setItem("authToken", token);
        console.log("Token stored:", token);

        // Redirect to profile or home page
        navigate("/profile");
      } catch (err) {
        console.log(err);
        setError(err.message);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleLogin();
  }, [navigate]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Processing login...</div>;
};

export default CASLoginSuccess;