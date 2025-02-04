import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";
import "./Styles/ProductDetails.css"


const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          } else if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("authToken");
            navigate("/login");
            return;
          } else {
            throw new Error("Failed to fetch product details");
          }
        }
  
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProductDetails();
  }, [id, navigate]);
  

  const handleAddToCart = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to add products to your cart.");
      navigate("/login");
      return;
    }
    if (product) {
      try {
        const response = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: 1,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Product added to cart!");
          navigate("/cart");
        } else if (response.status === 401 || response.status === 403) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("authToken"); 
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          throw new Error(data.message || "Failed to add product to cart");
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert(error.message || "An error occurred while adding to cart");
      }
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="error">Product not found</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Navbar />
      <div className="product-details">
        <h2>{product.name}</h2>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Price:</strong> ₹{product.price}</p>
        <p><strong>Vendor:</strong> {product.vendor}</p>
        <p><strong>Description:</strong> {product.description}</p>
        <button 
          onClick={handleAddToCart}
          className="add-to-cart-button"
        >
          Add to Cart
        </button>
      </div>
    </>
  );
};

export default ProductDetails;