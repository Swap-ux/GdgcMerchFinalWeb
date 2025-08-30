import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import './Login.css';
import './ShoppingBag';

export default function Login() {
  const [mode, setMode] = useState("login"); // Controls which form is visible: login, register, forgot, reset
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Form state objects
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });
  
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  // Effect to handle the reset token from the URL
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      verifyResetToken(token);
    }
  }, []);

  // Function to show alerts
  function triggerAlert(message, type = "success") {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 5000);
  }

  // --- FORM SUBMISSION HANDLERS ---

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      return triggerAlert("Email and password are required!", "error");
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        // Use the login function from context
        login(data.token, data.name);
        triggerAlert("Login successful! Redirecting...", "success");
        // Navigate back to home page on success
        setTimeout(() => navigate("/"), 1500); 
      } else {
        triggerAlert(data.message || "Invalid credentials.", "error");
      }
    } catch (error) {
      triggerAlert("Login failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      return triggerAlert("All fields are required!", "error");
    }
    if (registerForm.password.length < 6) {
      return triggerAlert("Password must be at least 6 characters!", "error");
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok) {
        // On success, show alert and switch to login form
        triggerAlert("Registration successful! Please login.", "success");
        setMode("login"); 
      } else {
        triggerAlert(data.error || data.message || "Registration failed.", "error");
      }
    } catch (error) {
      triggerAlert("Registration failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }
  
  async function handleForgot(e) {
    e.preventDefault();
    if (!forgotForm.email) {
      return triggerAlert("Email is required!", "error");
    }
    setLoading(true);
    try {
     const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Password reset email sent! Check your inbox.", "success");
        setMode("login");
      } else {
        triggerAlert(data.error || "Failed to send reset email.", "error");
      }
    } catch (error) {
      triggerAlert("Failed to send reset email: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!resetForm.password || !resetForm.confirmPassword) {
      return triggerAlert("Both password fields are required!", "error");
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      return triggerAlert("Passwords do not match!", "error");
    }
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      return triggerAlert("Reset token missing or invalid.", "error");
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: resetForm.password }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Password reset successful! You can now login.", "success");
        setMode("login");
        window.history.replaceState({}, document.title, "/login"); // Clean URL
      } else {
        triggerAlert(data.error || "Password reset failed.", "error");
      }
    } catch (error) {
      triggerAlert("Password reset failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function verifyResetToken(token) {
    try {
      const res = await fetch(`http://localhost:5000/api/reset-password/${token}`);
      if (res.ok) {
        setMode("reset");
        triggerAlert("Token verified. Please enter your new password.", "success");
      } else {
        triggerAlert("Invalid or expired reset link.", "error");
        window.history.replaceState({}, document.title, "/login");
      }
    } catch (error) {
      triggerAlert("Failed to verify reset link.", "error");
    }
  }
  
  // --- Dynamic ClassNames for sliding effect ---
  const authContainerClass = `main-auth ${
    mode === 'register' ? 'slide' : 
    mode === 'forgot' ? 'forgot' : 
    mode === 'reset' ? 'reset' : ''
  }`;

  return (
    <div className="login-page-background">
      <div className={authContainerClass}>
        {alert.message && (
          <div className={`alert ${alert.type} show`}>
            <span>{alert.message}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="fbox">
          <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <div className="ibox">
              <input type="email" placeholder="Email" required 
                value={loginForm.email}
                onChange={e => setLoginForm({...loginForm, email: e.target.value})}
              />
              <i className='bx bxs-envelope'></i>
            </div>
            <div className="ibox">
              <input type="password" placeholder="Password" required 
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
              <i className='bx bxs-lock'></i>
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
            <p>
              Don't have an account? <a href="#" onClick={() => setMode("register")}>Signup</a><br />
              <a href="#" onClick={() => setMode("forgot")}>Forgot Password?</a>
            </p>
          </form>
        </div>

        {/* Register Form */}
        <div className="fboxregister">
          <form onSubmit={handleRegister}>
            <h2>Signup</h2>
            <div className="ibox">
              <input type="text" placeholder="Name" required 
                value={registerForm.name}
                onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
              />
              <i className='bx bxs-user'></i>
            </div>
            <div className="ibox">
              <input type="email" placeholder="Email" required 
                value={registerForm.email}
                onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
              />
              <i className='bx bxs-envelope'></i>
            </div>
            <div className="ibox">
              <input type="password" placeholder="Password" required 
                value={registerForm.password}
                onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
              />
              <i className='bx bxs-lock'></i>
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Please wait..." : "Signup"}
            </button>
            <p>Already have an account? <a href="#" onClick={() => setMode("login")}>Login</a></p>
          </form>
        </div>
        
        {/* Forgot Password Form */}
        <div className="fboxforgot">
          <form onSubmit={handleForgot}>
            <h2>Reset Password</h2>
            <p className="form-description">Enter your email address to receive a reset link.</p>
            <div className="ibox">
              <input type="email" placeholder="Email" required 
                value={forgotForm.email}
                onChange={e => setForgotForm({...forgotForm, email: e.target.value})}
              />
              <i className='bx bxs-envelope'></i>
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Please wait..." : "Send Reset Link"}
            </button>
            <p>Remember your password? <a href="#" onClick={() => setMode("login")}>Back to Login</a></p>
          </form>
        </div>

        {/* Reset Password Form */}
        <div className="fboxreset">
          <form onSubmit={handleReset}>
            <h2>New Password</h2>
            <p className="form-description">Enter and confirm your new password.</p>
            <div className="ibox">
              <input type="password" placeholder="New Password" required 
                value={resetForm.password}
                onChange={e => setResetForm({...resetForm, password: e.target.value})}
              />
              <i className='bx bxs-lock'></i>
            </div>
            <div className="ibox">
              <input type="password" placeholder="Confirm Password" required 
                value={resetForm.confirmPassword}
                onChange={e => setResetForm({...resetForm, confirmPassword: e.target.value})}
              />
              <i className='bx bxs-lock-alt'></i>
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Please wait..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}