const express = require("express");
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers,
} = require("../controllers/subscribeController");
const { protect } = require("../controllers/adminController");

// Public routes
router.post("/", subscribe);
router.post("/unsubscribe", unsubscribe);

// Admin only routes
router.get("/", protect, getSubscribers);

module.exports = router;
