import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";
import "./Styles/Cart.css"

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await fetch("http://localhost:5000/api/cart/items", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch cart items");
        }
        const data = await response.json();
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [navigate]);

  const handleRemove = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(
        `http://localhost:5000/api/cart/remove/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setCartItems(cartItems.filter((item) => item._id !== id));
        alert("Item removed from cart!");
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        throw new Error("Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <h2>Loading cart...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-error">
        <h2>Error loading cart</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart</h2>
        <p>Your cart is empty</p>
        <button onClick={() => navigate("/Buy")}>Continue Shopping</button>
      </div>
    );
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Orders placed successfully! Your OTPs are: ${data.otps.join(", ")}`
        );
        navigate("/OrderHistory", {
          state: {
            orderIds: data.orderIds,
            otps: data.otps,
          },
        });
      } else {
        throw new Error(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message);
    }
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="cart">
        <h2>Your Cart</h2>
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="item-details">
                {item.productId.image && (
                  <img
                    src={`http://localhost:5000${item.productId.image}`}
                    alt={item.productId.name}
                    className="cart-item-image"
                  />
                )}
                <h3>{item.productId.name}</h3>
                <p>Price: ₹{item.productId.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Subtotal: ₹{item.productId.price * item.quantity}</p>
              </div>
              <button
                onClick={() => handleRemove(item._id)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Total: ₹{calculateTotal()}</h3>
          <button
            onClick={handleCheckout}
            className="checkout-button"
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;
