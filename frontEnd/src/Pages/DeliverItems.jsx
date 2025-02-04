import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";
import "./Styles/DeliverItems.css"

const DeliveryPage = () => {
  const navigate = useNavigate();
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});

  // Add authentication check when component mounts
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    
    fetchPendingDeliveries();
  }, [navigate]);

  const fetchPendingDeliveries = async () => {
    try {
      const token = localStorage.getItem("authToken");
      // Check if user is still authenticated
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/orders/to-deliver",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle unauthorized access
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch deliveries");
      }

      const data = await response.json();
      setPendingDeliveries(data);
    } catch (error) {
      console.error("Delivery fetch error:", error);
    }
  };

  const handleOtpVerification = async (orderId) => {
    const otp = otpInputs[orderId];
    try {
      const token = localStorage.getItem("authToken");
      // Check if user is still authenticated
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/orders/verify-delivery/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp }),
        }
      );

      // Handle unauthorized access
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }

      const result = await response.json();
      if (response.ok) {
        setPendingDeliveries((prev) =>
          prev.filter((order) => order._id !== orderId)
        );
        alert("Delivery completed successfully");
      } else {
        alert(result.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const updateOtpInput = (orderId, value) => {
    setOtpInputs((prev) => ({
      ...prev,
      [orderId]: value,
    }));
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="delivery-page">
        <h2>Pending Deliveries</h2>
        {pendingDeliveries.length === 0 ? (
          <p>No pending deliveries</p>
        ) : (
          pendingDeliveries.map((order) => (
            <div key={order._id} className="delivery-order">
              <h3>Order Details</h3>
              {order.items.map((item) => (
                <div key={item._id} className="delivery-item">
                  <p>Product: {item.name}</p>
                  <p>Price: ₹{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
              ))}
              <div className="otp-verification">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otpInputs[order._id] || ""}
                  onChange={(e) => updateOtpInput(order._id, e.target.value)}
                />
                <button onClick={() => handleOtpVerification(order._id)}>
                  Verify Delivery
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default DeliveryPage;