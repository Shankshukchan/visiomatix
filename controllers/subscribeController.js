const Subscriber = require("../models/Subscriber");
const { validateEmail } = require("../utils/emailService");

// Subscribe endpoint - add email if not present
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({
      email: normalizedEmail,
    });

    if (existingSubscriber) {
      // If exists but not active, reactivate them
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        return res.status(200).json({
          message: "You have been resubscribed successfully!",
          subscriber: existingSubscriber,
        });
      }

      return res.status(409).json({
        message: "This email is already subscribed",
        subscriber: existingSubscriber,
      });
    }

    // Create new subscriber
    const newSubscriber = new Subscriber({
      email: normalizedEmail,
    });

    await newSubscriber.save();

    res.status(201).json({
      message:
        "Subscription successful! You will receive updates about new blogs and careers.",
      subscriber: newSubscriber,
    });
  } catch (error) {
    console.error("Subscription error:", error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already subscribed",
      });
    }

    res.status(500).json({
      message: "Error during subscription",
      error: error.message,
    });
  }
};

// Unsubscribe endpoint
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: normalizedEmail },
      { isActive: false },
      { new: true },
    );

    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.status(200).json({
      message: "You have been unsubscribed successfully",
      subscriber,
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({
      message: "Error during unsubscription",
      error: error.message,
    });
  }
};

// Get all active subscribers (admin only)
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({ isActive: true }).sort({
      subscribedAt: -1,
    });

    res.status(200).json({
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    res.status(500).json({
      message: "Error fetching subscribers",
      error: error.message,
    });
  }
};

module.exports = { subscribe, unsubscribe, getSubscribers };
