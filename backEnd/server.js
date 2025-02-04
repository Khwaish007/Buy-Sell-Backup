const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./User");
const jwt = require("jsonwebtoken");
const Product = require("./Product");
const Cart = require("./Cart");
const Order = require("./Order");
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const multer = require("multer");
const path = require("path");

const JWT_SECRET = "Sherif007";
const TOKEN_EXPIRY = "7d";
const MONGO_URI = "mongodb+srv://Sherif:7x2JarWD4715ge9u@bazaario.b3itt.mongodb.net/Bazaario";
const genAI = new GoogleGenerativeAI("AIzaSyC2UwxKRuO1jKuT1ocBPK-EEU200J_x2sY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(bodyParser.json());

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.log(err);
    ; return res.status(403).json({ message: "Invalid or expired token." });
  }
};

const verifyRecaptcha = async (req, res, next) => {
  const { recaptchaToken } = req.body;
  if (!recaptchaToken) {
    return res.status(400).json({ message: "reCAPTCHA token is required" });
  }

  const secretKey = "6LdgesIqAAAAAIoZHfPR4dOlOvSdtJ1hDVPcjmSX"; // Replace with your secret key

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`,
      { method: "POST" }
    );
    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ message: "Invalid reCAPTCHA token" });
    }
    next();
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

app.get("/", (req, res) => res.send("API is running..."));

app.post("/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;
    if (!firstName || !lastName || !email || !password || !age || !contactNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/auth/login", verifyRecaptcha, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials. Please try again." });
    }
    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
    res.status(200).json({
      message: "Login successful",
      token,
      redirect: "/profile"
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/user/update-profile", authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, age, contactNumber } = req.body;

    const userToUpdate = await User.findById(req.user.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (age) updateFields.age = age;
    if (contactNumber) updateFields.contactNumber = contactNumber;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);

  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(500).json({ message: "Error updating profile. Please try again." });
  }
});


app.post("/api/products", authenticateToken,upload.single("image"), async (req, res) => {
  try {
    const { name, category, price, vendor, email, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!name || !category || !price || !vendor || !email || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newProduct = new Product({ name, category, price, vendor, email, description, image, });
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/products/:id", authenticateToken,async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.json(product);
});

app.post("/api/cart/add", authenticateToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  const email = req.user.email;
  if (!productId || !quantity) {
    return res.status(400).send({ message: "Product ID and quantity are required" });
  }
  try {
    const existingCartItem = await Cart.findOne({ userId, productId });
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      const newCartItem = new Cart({ userId, productId, quantity, email });
      await newCartItem.save();
    }
    res.status(200).send({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).send({ error: "Failed to add product to cart" });
  }
});

app.get("/api/cart/items", authenticateToken, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id })
      .populate('productId');
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Error fetching cart items" });
  }
});

app.put("/api/cart/update/:id", authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { quantity },
      { new: true }
    );
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json(cartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Error updating cart item" });
  }
});

app.delete("/api/cart/remove/:id", authenticateToken, async (req, res) => {
  try {
    const result = await Cart.deleteOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

app.get('/api/orders/pending', async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'pending' });
    res.json(pendingOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending orders', error });
  }
});

app.post('/api/orders/verify-otp/:orderId',authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { otp } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (order.otp === otp) {
      order.status = 'completed';
      await order.save();
      res.json({ success: true, message: 'Transaction completed successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error });
  }
});

app.post("/api/checkout",authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;
    const cartItems = await Cart.find({ userId }).populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Group cart items by seller
    const ordersBySeller = {};
    cartItems.forEach(item => {
      const sellerEmail = item.productId.email;
      if (!ordersBySeller[sellerEmail]) {
        ordersBySeller[sellerEmail] = [];
      }
      ordersBySeller[sellerEmail].push(item);
    });

    const orderIds = [];
    const otps = [];

    // Create separate orders for each seller
    for (const [sellerEmail, items] of Object.entries(ordersBySeller)) {
      const totalAmount = items.reduce((total, item) =>
        total + (item.productId.price * item.quantity), 0);

      const orderItems = items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        sellerEmail: item.productId.email,  // Ensure sellerEmail is correctly assigned
      }));

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otps.push(otp); // Store the plaintext OTP for response

      // Hash the OTP
      const saltRounds = 10; // Adjust salt rounds as needed
      const newOrder = new Order({
        userId,
        email,
        sellerEmail,
        items: orderItems,
        totalAmount,    
        status: 'pending',
        otp: otp, 
      });

      await newOrder.save();
      orderIds.push(newOrder._id);
      // otps.push(otp);
    }

    // Clear the cart after creating orders
    await Cart.deleteMany({ userId });

    res.status(201).json({
      message: "Orders created successfully",
      orderIds,
      otps
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
});

app.get("/api/orders/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Pending Orders
    const pendingOrders = await Order.find({
      userId: userId,
      status: 'pending'
    });

    // Items Bought (Completed Orders)
    const itemsBought = await Order.find({
      email: user.email,
      status: 'completed'
    }).select('items');

    // Items Sold (Completed Orders where user is seller)
    const itemsSold = await Order.find({
      'items.sellerEmail': user.email,
      status: 'completed'
    }).select('items');

    res.json({
      pendingOrders: pendingOrders.map(order => ({
        id: order._id,
        otp: order.otp,
        status: order.status,
        items: order.items
      })),
      itemsBought: itemsBought.flatMap(order =>
        order.items.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price
        }))
      ),
      itemsSold: itemsSold.flatMap(order =>
        order.items
          .filter(item => item.sellerEmail === user.email)
          .map(item => ({
            id: item._id,
            name: item.name,
            price: item.price
          }))
      )
    });
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Failed to fetch order history" });
  }
});

app.get("/api/orders/to-deliver", authenticateToken, async (req, res) => {
  try {
    const sellerEmail = req.user.email; // Get the logged-in seller's email

    // Fetch orders that are 'pending' and contain products from this seller
    const ordersToDeliver = await Order.find({
      status: 'pending',
      sellerEmail: sellerEmail, // Only fetch orders where the sellerEmail matches
    }).populate({
      path: 'items.productId', // Populate the productId in the items array
    });

    res.json(ordersToDeliver);
  } catch (error) {
    console.error("Error fetching orders to deliver:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


app.post("/api/orders/verify-delivery/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }
    order.status = 'completed';
    await order.save();
    res.json({ message: "Order delivered successfully" });
  } catch (error) {
    console.error("Error verifying delivery:", error);
    res.status(500).json({ message: "Failed to verify delivery" });
  }
});

app.post("/api/generate", authenticateToken,async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    // Combine context into a single conversation string
    const contextString = context
      .map(entry => `User: ${entry.prompt}\nAI: ${entry.response}`)
      .join("\n") + `\nUser: ${prompt}`;

    const result = await model.generateContent(contextString);
    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Failed to generate content" });
  }
});


app.post("/api/products/:id/reviews", authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newReview = {
      userId,
      rating,
      comment,
    };

    product.reviews.push(newReview);
    await product.save();

    // Add the review to the seller's profile
    const seller = await User.findOne({ email: product.email });
    
    if (seller) {
      seller.sellerReviews.push({
        productId,
        rating,
        comment,
      });
      await seller.save();
    }

    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/user/reviews", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user by ID and fetch their reviews
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ reviews: user.sellerReviews });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/auth/cas/callback", async (req, res) => {
  const { ticket } = req.query;

  if (!ticket) {
    return res.status(400).json({ message: "Ticket is required" });
  }

  try {
    const callbackUrl = "http://localhost:5000/auth/cas/callback";
    const casValidateUrl = `https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(callbackUrl)}`;

    const response = await axios.get(casValidateUrl);
    const casResponse = response.data;

    const userMatch = casResponse.match(/<cas:user>(.*?)<\/cas:user>/);
    if (!userMatch) {
      return res.status(401).json({ message: "CAS authentication failed" });
    }

    const email = userMatch[1];
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const id = user._id;

    // Use the JWT_SECRET constant directly
    const token = jwt.sign(
      { id, email },
      JWT_SECRET,  // Using the constant defined in server.js
      { expiresIn: '7d' }
    );

    res.redirect(`http://localhost:5173/cas-login-success?token=${token}`);

  } catch (error) {
    console.error("CAS validation error:", error);
    res.status(500).json({
      message: "CAS authentication failed",
      error: error.message
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
