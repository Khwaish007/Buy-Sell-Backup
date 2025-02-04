  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import "../Components/Navbar";
  import Header from "../Components/Header";
  import Navbar from "../Components/Navbar";
  import "./Styles/Profile.css";

  const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      contactNumber: "",
      password: "",
      cartItems: [],
    });

    const [isEditing, setIsEditing] = useState(false);
    const [userReviews, setUserReviews] = useState([]);

    useEffect(() => {
      const fetchUserProfile = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error("Token not found");
          navigate("/login");
          return;
        }

        try {
          const response = await axios.get(
            "http://localhost:5000/api/user/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          if (error.response?.status === 403) {
            console.error("Token is invalid or expired"); 
            localStorage.removeItem("authToken");
            navigate("/login");
          }
        }
      };

      const fetchUserReviews = async () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error("Token not found");
          return;
        }

        try {
          const response = await axios.get(
            "http://localhost:5000/api/user/reviews",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.reviews) {
            setUser((prevUser) => ({
              ...prevUser,
              sellerReviews: response.data.reviews,
            }));
          }
        } catch (error) {
          console.error("Error fetching user reviews:", error);
        }
      };

      fetchUserProfile();
      fetchUserReviews();
    }, []);

    const handleEdit = () => setIsEditing(true);

    const handleChange = (e) => {
      setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        console.log("Sending update request with data:", user); // Debug log

        const response = await axios.put(
          "http://localhost:5000/api/user/update-profile",
          {
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            contactNumber: user.contactNumber,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Update response:", response.data); // Debug log
        setUser(response.data);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert(error.response?.data?.message || "Error updating profile");
      }
    };

    const handleLogout = () => {
      localStorage.removeItem("authToken");
      navigate("/");
    };

    return (
      <>
        <Header />
        <Navbar />
        <div id="wrapper">
          <div className="gradient" id="gradient"></div>
          <div className="profile-bio" id="card">
            <form className="profile-form">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={user.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={user.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={user.email} disabled />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input
                  type="number"
                  name="age"
                  value={user.age}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Contact Number:</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={user.contactNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              {isEditing ? (
                <button
                  type="button"
                  className="btn save-btn"
                  onClick={handleSave}
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  className="btn edit-btn"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              )}
            </form>
            <h2>Seller Reviews</h2>
            {user.sellerReviews && user.sellerReviews.length > 0 ? (
              <ul>
                {user.sellerReviews.map((review, index) => (
                  <li key={index}>
                    <strong>Rating:</strong> {review.rating}/5
                    <br />
                    <strong>Comment:</strong> {review.comment}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews yet.</p>
            )}  
            <div className="form-buttons">
              <button className="btn edit-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>{" "}
          </div>
        </div>
      </>
    );
  };

  export default Profile;
