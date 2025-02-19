import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductContext from "./ProductContext";
import Header from "../Components/Header";
import Navbar from "../Components/Navbar";
import "./Styles/Sell.css";

const Sell = () => {
    const navigate = useNavigate();
    const { addProduct } = useContext(ProductContext);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        vendor: "",
        description: "",
        image: null,
    });

    // Add authentication check when component mounts
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.log("User not authenticated, redirecting to login");
            navigate("/login");
            return;
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check authentication before submitting
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
            return;
        }

        const data = new FormData();
        data.append("name", formData.name);
        data.append("category", formData.category);
        data.append("price", formData.price);
        data.append("vendor", formData.vendor);
        data.append("description", formData.description);
        data.append("image", formData.image);

        try {
            const response = await fetch("http://localhost:5000/api/products", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`  // Add token to headers
                },
                body: data,
            });

            // Handle unauthorized access
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("authToken");
                navigate("/login");
                return;
            }

            if (response.ok) {
                alert("Product added successfully!");
                setFormData({
                    name: "",
                    category: "",
                    price: "",
                    vendor: "",
                    description: "",
                    image: null,
                });
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to add product.");
            }
        } catch (error) {
            console.error("Error adding product:", error);
            alert("An error occurred while adding the product.");
        }
    };

    return (
        <>
            <Header />
            <Navbar />
            <div className="sell-container">
                <h2>Sell a Product</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select Category
                        </option>
                        <option value="Electronics">Electronics</option>
                        <option value="Books">Books</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Others">Others</option>
                    </select>
                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="vendor"
                        placeholder="Vendor Name"
                        value={formData.vendor}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    ></textarea>
                    <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        accept="image/*"
                        required
                    />
                    <button type="submit">Add Product</button>
                </form>
            </div>
        </>
    );
};

export default Sell;