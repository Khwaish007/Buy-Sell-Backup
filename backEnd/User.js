const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: false},
  email: { type: String, unique: true, required: true },
  age: { type: Number, required: false }, 
  contactNumber: { type: String, required: false },
  password: { type: String, required: true },
  sellerReviews: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      rating: { type: Number, required: false },
      comment: { type: String, required: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password; 
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);


