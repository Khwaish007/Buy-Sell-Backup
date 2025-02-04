import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import Profile from "./Pages/Profile"; 
import Register from "./Pages/Reg"
import Home from "./Pages/Home";
import Buy from './Pages/Buy'
import Sell from "./Pages/Sell";
import Cart from "./Pages/Cart"
import Chatbot from "./Pages/Support";
import ProductDetails from "./Pages/ProductDetails";
import { ProductProvider } from "./Pages/ProductContext";
import { AuthProvider } from "./Pages/AuthContext";
import DeliverItems from "./Pages/DeliverItems";
import OrderHistory from "./Pages/OrderHistory";
import CASLoginSuccess from "./Pages/CASLoginSuccess";

const App = () => {
    return (
        <AuthProvider>
        <ProductProvider>
            <Router>  
                <Routes>  
                    <Route path="/" element={<Home />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/Register" element={<Register />} />
                    <Route path="/Profile" element={<Profile />} />
                    <Route path="/Buy" element={<Buy />} />
                    <Route path="/Sell" element={<Sell />} />
                    <Route path="/item/:id" element={<ProductDetails />} /> 
                    <Route path="/Cart" element={<Cart />} />
                    <Route path="/DeliverItems" element={<DeliverItems />} />
                    <Route path="/OrderHistory" element={<OrderHistory />} />
                    <Route path="/Support" element={<Chatbot />} />
                    <Route path="/cas-login-success" element={<CASLoginSuccess />} />
                </Routes>
            </Router>
        </ProductProvider>
        </AuthProvider>
    );
};

export default App;
