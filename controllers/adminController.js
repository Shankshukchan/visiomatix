const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, {
      expiresIn: "8h",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// helper middleware to protect routes
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
