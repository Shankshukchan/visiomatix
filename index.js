const express = require("express");
const { Resend } = require("resend");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const blogRoutes = require("./routes/blogRoutes");
const careerRoutes = require("./routes/careerRoutes");
const subscribeRoutes = require("./routes/subscribeRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const validMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."));
    }
  },
});

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

// Career application endpoint with resume upload
app.post(
  "/api/career-application",
  upload.single("resume"),
  async (req, res) => {
    try {
      const { name, email, Qaulification, mobile, role, message } = req.body;

      // Validate required fields
      if (
        !name ||
        !email ||
        !Qaulification ||
        !mobile ||
        !role ||
        !req.file
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields or resume not provided",
        });
      }

      // Prepare email content
      const emailText = `
New Career Application – Visiomatix Media

Name: ${name}
Email: ${email}
Phone: ${mobile}
Interested role: ${service}
Message: ${message || "N/A"}

Resume: ${req.file.originalname}
    `;

      // Send email with resume attachment
      const emailResponse = await resend.emails.send({
        from: process.env.CONTACT_EMAIL || "onboarding@resend.dev",
        to: [process.env.CONTACT_EMAIL || "info@visiomatix.in"],
        subject: `Career Application – ${name}`,
        text: emailText,
        attachments: [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype,
          },
        ],
      });

      console.log("Career application email sent:", emailResponse);

      res.status(200).json({
        success: true,
        message: "Application submitted successfully!",
      });
    } catch (error) {
      console.error("Career application error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit application. Please try again.",
      });
    }
  },
);

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
