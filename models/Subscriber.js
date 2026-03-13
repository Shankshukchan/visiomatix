const mongoose = require("mongoose");

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  subscribedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Subscriber", SubscriberSchema);
