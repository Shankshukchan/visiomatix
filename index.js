const express = require("express");
const { Resend } = require("resend");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const blogRoutes = require("./routes/blogRoutes");
const careerRoutes = require("./routes/careerRoutes");
const subscribeRoutes = require("./routes/subscribeRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// warn if Cloudinary credentials are missing
if (
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET ||
  !process.env.CLOUDINARY_CLOUD_NAME
) {
  console.warn(
    "Cloudinary environment variables not set; image uploads will fail.",
  );
}

// simple contact endpoint (existing)
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/contact", async (req, res) => {
  const { name, email, businessName, mobile, service, message } = req.body;

  try {
    await resend.emails.send({
      from: process.env.CONTACT_EMAIL,
      to: [process.env.CONTACT_EMAIL],
      subject: "New Lead – Visiomatix Media",
      text: `
Name: ${name}
Email: ${email}
Business: ${businessName}
Phone: ${mobile}
Service: ${service}

Message:
${message || "N/A"}
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// mount new routes
app.use("/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/subscribe", subscribeRoutes);

// connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");
    // ensure an admin exists
    const Admin = require("./models/Admin");
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const existing = await Admin.findOne({ email });
    if (!existing) {
      await Admin.create({ email, password });
      console.log("Default admin created", email);
    }
  })
  .catch((err) => console.error("MongoDB connection error", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
