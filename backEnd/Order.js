  const mongoose = require('mongoose');

  const OrderSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    sellerEmail: {
       type: String,
        required: true 
      }, 
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      sellerEmail: {
        type: String,
        required: true
      },
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    otp: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  module.exports = mongoose.model('Order', OrderSchema);