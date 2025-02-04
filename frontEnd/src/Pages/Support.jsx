import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";
import "./Styles/Support.css"

const Chatbot = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add authentication check using useEffect
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      // Check if user is still authenticated before making the request
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Add token to request headers
        },
        body: JSON.stringify({ prompt, context: conversation }),
      });

      const data = await res.json();

      if (res.ok) {
        const newExchange = { prompt, response: data.response };
        setConversation([...conversation, newExchange]);
        setPrompt("");
      } else {
        // Handle unauthorized access
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="chatbot-container">
        <h2>AI Chatbot</h2>
        <div className="conversation-history">
          {conversation.map((entry, index) => (
            <div key={index} className="chat-entry">
              <p><strong>User:</strong> {entry.prompt}</p>
              <p><strong>AI:</strong> {entry.response}</p>
            </div>
          ))}
        </div>
        <textarea
          rows="4"
          placeholder="Type your question or prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading || !prompt}
          className="generate-button"
        >
          {loading ? "Generating..." : "Ask AI"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </>
  );
};

export default Chatbot;