const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  vendor: { type: String, required: true },
  email: { type: String, required: true }, 
  description: { type: String, required: true },
  image: { type: String }, 
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
