import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import "./Styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (token) {
            navigate("/profile");
          } 
        } catch (error) {
          console.error("Auth check error:", error);
        } 
      };
  
      checkAuth();
    }, [navigate]);
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recaptchaToken) {
      alert("Please complete the reCAPTCHA challenge.");
      return;
    }
    try {
      console.log("Attempting login with:", { email });
      const result = await login(email, password, recaptchaToken);
      console.log("Login result:", result);

      if (result?.success && result?.token) {
        console.log("Login successful, token:", result.token);
        navigate(result.redirect || "/profile");
      } else {
        throw new Error("Login failed - no token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed");
    }
  };

  
  const handleCASLogin = () => {
    // Make sure this matches exactly with backend callback URL
    const callbackUrl = encodeURIComponent("http://localhost:5000/auth/cas/callback");
    const casLoginUrl = `https://login.iiit.ac.in/cas/login?service=${callbackUrl}`;
    
    console.log('Opening CAS login URL:', casLoginUrl);
  
    window.location.href = casLoginUrl;
  };
  
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        navigate("/profile"); // Redirect to the profile page after successful login
      } else {
        throw new Error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("CAS login failed. Please try again.");
    }
  };
  

  return (
    <>
      <section className="container">
        <div className="login-container">
          <div className="circle circle-one"></div>
          <div className="form-container">

            <h1 className="opacity">LOGIN</h1>
            <form onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="recaptcha-container">
                <ReCAPTCHA
                  sitekey="6LdgesIqAAAAAEBiBpUzBdU72ZXC7BnhTBjsNIg1"
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>
              <button className="opacity" type="submit">
                Submit
              </button>
            </form>
            <div className="register-forget opacity">
              <a href="/Register">REGISTER</a>
            </div>
            <button onClick={handleCASLogin} className="cas-login-button">
              Login with CAS
            </button>
          </div>
          <div className="circle circle-two"></div>
        </div>
        <div className="theme-btn-container"></div>
      </section>
    </>
  );
};

export default Login;
