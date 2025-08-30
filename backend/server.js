// ------------ IMPORTS ------------
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');

// ------------ CONFIGURATIONS ------------
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ------------ APP INITIALIZATION ------------
const app = express();

// ------------ LOAD STATIC DATA ------------
const products = require('./products.json');

// ------------ MIDDLEWARE ------------
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'build')));

// ------------ DATABASE CONNECTION ------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✔️ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ------------ MODELS ------------
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, unique: true, trim: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExp: Date,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: String },
    title: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    size: { type: String },
    color: { type: String },
    image: { type: String },
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: Object, required: true },
  paymentIntentId: { type: String, required: true, unique: true },
  status: { type: String, default: 'succeeded' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// ------------ AUTH MIDDLEWARE FUNCTION ------------
function authenticate(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ message: "No token provided." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ------------ API ROUTES ------------

// --- User Authentication Routes ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ message: 'Registered!', userId: user._id });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Email already used.' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ message: "Login successful!", token, userId: user._id, name: user.name });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login error", error: err.message });
  }
});

// --- Password Reset Routes ---
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExp = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    const clientURL = process.env.CLIENT_URL || "http://localhost:3000";
    const resetURL = `${clientURL}/login?token=${resetToken}`;

    const emailHTML = `
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #dddddd; padding: 40px;">
          <h2 style="text-align: center; color: #333333; font-weight: 500;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555555;">Hello ${user.name},</p>
          <p style="font-size: 16px; color: #555555;">You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 16px; color: #555555;">If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>
          <p style="font-size: 16px; color: #555555;">Best regards,<br>Swap.co Team</p>
        </div>
      </body>
    `;
    
    const msg = {
      to: user.email,
      from: 'Swapnildeka14@gmail.com',
      subject: 'Password Reset Request',
      html: emailHTML,
    };

    await sgMail.send(msg);

    console.log(`Reset link sent via SendGrid: ${resetURL}`);
    res.json({ message: "Password reset email sent successfully." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset email." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ error: "Token and new password required." });
    
    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error: "Invalid or expired token." });
    
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();
    
    return res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Password reset failed." });
  }
});

// --- Payment & Order Routes ---
app.post("/api/create-payment-intent", authenticate, async (req, res) => {
  try {
    const { total } = req.body;
    const amountInCents = Math.round(total * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/api/create-order', authenticate, async (req, res) => {
  try {
    const { cart, total, shippingInfo, paymentIntentId } = req.body;
    const newOrder = new Order({
      userId: req.user.userId,
      products: cart.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.backgroundImage,
      })),
      totalAmount: total,
      shippingAddress: shippingInfo,
      paymentIntentId: paymentIntentId,
    });
    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully!', orderId: newOrder._id });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This payment has already been recorded.' });
    }
    res.status(500).json({ error: 'Failed to save order.' });
  }
});

app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// --- Products Route ---
app.get('/api/products', (req, res) => {
  res.json({ products: products });
});

// ------------ SERVER LISTENER ------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
