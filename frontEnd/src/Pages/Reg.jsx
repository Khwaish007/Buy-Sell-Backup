  import React, { useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import "./Styles/Login.css";

  const Register = () => {
    const [form, setForm] = useState({
      firstName: "",
      lastName: "",
      email: "",
      age: "",
      contactNumber: "",
      password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) =>
      setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
      e.preventDefault();
      // Email format validation
      const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@students\.iiit\.ac\.in$/;
      if (!emailRegex.test(form.email)) {
        alert(
          "Please enter a valid email in the format firstname.lastname@students.iiit.ac.in"
        );
        return;
      }
      try {
        const res = await axios.post("http://localhost:5000/auth/register", form);
        if (res.data && res.data.message) {
          alert(res.data.message);
          navigate("/Login");
        } else {
          alert("Registration successful");
          navigate("/Login");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Error occurred");
      }
    };

    return (
      <>
        <section className="container">
          <div className="login-container">
            <div className="circle circle-one"></div>
            <div className="form-container">
              <h1 className="opacity">SIGN UP</h1>
              <form onSubmit={handleSubmit}>
                <input
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleChange}
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleChange}
                />
                <input name="email" placeholder="Email" onChange={handleChange} />
                <input
                  name="age"
                  placeholder="Age"
                  type="number"
                  onChange={handleChange}
                />
                <input
                  name="contactNumber"
                  placeholder="Contact Number"
                  onChange={handleChange}
                />
                <input
                  name="password"
                  placeholder="Password"
                  type="password"
                  onChange={handleChange}
                />
                <button type="submit">Submit</button>
              </form>
            </div>
            <div className="circle circle-two"></div>
          </div>
          <div className="theme-btn-container"></div>
        </section>
      </>
    );
  };

  export default Register;
