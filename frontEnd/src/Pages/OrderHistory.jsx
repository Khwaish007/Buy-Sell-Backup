import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";
import "./Styles/OrderHistory.css"

const OrderHistory = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [itemsBought, setItemsBought] = useState([]);
  const [itemsSold, setItemsSold] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/orders/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const data = await response.json();
        setPendingOrders(data.pendingOrders);
        setItemsBought(data.itemsBought);
        setItemsSold(data.itemsSold);
      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <Header />
      <Navbar />
      <div className="orders-history">
        <h2>Orders History</h2>
        <div className="tabs">
          <button onClick={() => setActiveTab("pending")}>
            Pending Orders
          </button>
          <button onClick={() => setActiveTab("bought")}>Items Bought</button>
          <button onClick={() => setActiveTab("sold")}>Items Sold</button>
        </div>

        <div className="tab-content">
          {activeTab === "pending" && (
            <div>
              <h3>Pending Orders</h3>
              {pendingOrders.length === 0 ? (
                <p>No pending orders.</p>
              ) : (
                <ul>
                {pendingOrders.map((order) => (
                  <li key={order.id}>
                    Order ID: {order.id}, Status:{" "}
                    {order.status}
                  </li>
                ))}
              </ul>
              )}
            </div>
          )}

          {activeTab === "bought" && (
            <div>
              <h3>Items Bought</h3>
              {itemsBought.length === 0 ? (
                <p>No items bought yet.</p>
              ) : (
                <ul>
                  {itemsBought.map((item) => (
                    <li key={item.id}>
                      {item.name} - ₹{item.price}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "sold" && (
            <div>
              <h3>Items Sold</h3>
              {itemsSold.length === 0 ? (
                <p>No items sold yet.</p>
              ) : (
                <ul>
                  {itemsSold.map((item) => (
                    <li key={item.id}>
                      {item.name} - ₹{item.price}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;