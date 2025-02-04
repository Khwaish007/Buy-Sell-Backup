import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductContext from "./ProductContext";
import Button from "@mui/material/Button";
import { IoSearch } from "react-icons/io5";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";
import "./Styles/Buy.css";

const Buy = () => {
  const navigate = useNavigate();
  const { products } = useContext(ProductContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [reviewData, setReviewData] = useState({});
  const [userEmail, setUserEmail] = useState(""); // State to store logged-in user's email

  // Fetch the logged-in user's email from the token or context
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    // Decode the token to get the user's email
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setUserEmail(decodedToken.email); // Assuming the token contains the email
  }, [navigate]);

  const handleReviewChange = (productId, field, value) => {
    setReviewData({
      ...reviewData,
      [productId]: {
        ...reviewData[productId],
        [field]: value,
      },
    });
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    return matchesSearch && matchesCategory;
  });

  const handleReviewSubmit = async (productId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const review = reviewData[productId];

      const response = await fetch(
        `http://localhost:5000/api/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: review.rating,
            comment: review.comment,
          }),
        }
      );

      if (response.ok) {
        alert("Review submitted successfully!");
        setReviewData((prevData) => ({ ...prevData, [productId]: {} }));
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }
        throw new Error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.message);
    }
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" startIcon={<IoSearch />}>
          Search
        </Button>
      </div>
      <div className="category-filter">
        <h4>Filter by Category</h4>
        <div className="categories">
          {["Electronics", "Books", "Clothing", "Furniture", "Others"].map(
            (category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                {category}
              </label>
            )
          )}
        </div>
      </div>
      <div className="items">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => {
            const isUserProduct = item.email === userEmail; // Check if the product belongs to the logged-in user
            return (
              <div
                key={item._id}
                className="item-card"
                onClick={() => !isUserProduct && navigate(`/item/${item._id}`)} // Disable navigation for user's own product
              >
                {item.image && (
                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.name}
                    className="product-image"
                  />
                )}
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price}</p>
                <p>Vendor: {item.vendor}</p>
                <p>{item.description}</p>
                <p>Category: {item.category}</p>
                {isUserProduct && (
                  <p className="user-product-message">This is your product.</p>
                )}
                <div className="review-section">
                  <h4>Write a Review</h4>
                  <input
                    type="number"
                    placeholder="Rating (1-5)"
                    value={reviewData[item._id]?.rating || ""}
                    onChange={(e) =>
                      handleReviewChange(item._id, "rating", e.target.value)
                    }
                    min="1"
                    max="5"
                    onClick={(e) => e.stopPropagation()} // Prevent click propagation
                  />
                  <textarea
                    placeholder="Comment"
                    value={reviewData[item._id]?.comment || ""}
                    onChange={(e) =>
                      handleReviewChange(item._id, "comment", e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()} // Prevent click propagation
                  ></textarea>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent button click propagation
                      handleReviewSubmit(item._id);
                    }}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No items found matching your criteria.</p>
        )}
      </div>
    </>
  );
};

export default Buy;
