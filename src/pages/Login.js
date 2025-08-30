import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import './Login.css';

// It's good practice to define the API URL in one place
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null); // State to hold the token from URL

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });
  
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  // This effect now correctly handles the token found on the /login page
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) {
      setToken(urlToken); // Save the token
      setMode("reset");    // Switch to the reset password form
      triggerAlert("Please enter your new password.", "success");
    }
  }, []);

  function triggerAlert(message, type = "success") {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 5000);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.name);
        triggerAlert("Login successful! Redirecting...", "success");
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
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Registration successful! Please login.", "success");
        setMode("login"); 
      } else {
        triggerAlert(data.error || "Registration failed.", "error");
      }
    } catch (error) {
      triggerAlert("Registration failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }
  
  async function handleForgot(e) {
    e.preventDefault();
    setLoading(true);
    try {
     const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email }),
      });
      // Always show a generic success message for security
      triggerAlert("If an account with that email exists, a password reset link has been sent.", "success");
      setMode("login");
    } catch (error) {
      triggerAlert("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (resetForm.password !== resetForm.confirmPassword) {
      return triggerAlert("Passwords do not match!", "error");
    }
    if (!token) {
      return triggerAlert("Reset token missing or invalid. Please request a new link.", "error");
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: resetForm.password }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Password reset successful! You can now login.", "success");
        setMode("login");
        // Clean the token from the URL for a better user experience
        navigate('/login', { replace: true });
      } else {
        triggerAlert(data.error || "Password reset failed. The link may have expired.", "error");
      }
    } catch (error) {
      triggerAlert("Password reset failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }
  
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
              Don't have an account? <a href="#" onClick={(e) => {e.preventDefault(); setMode("register");}}>Signup</a><br />
              <a href="#" onClick={(e) => {e.preventDefault(); setMode("forgot");}}>Forgot Password?</a>
            </p>
          </form>
        </div>

        {/* Register Form */}
        <div className="fboxregister">
          <form onSubmit={handleRegister}>
            <h2>Signup</h2>
            {/* ... form inputs for name, email, password ... */}
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
            <p>Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); setMode("login");}}>Login</a></p>
          </form>
        </div>
        
        {/* Forgot Password Form */}
        <div className="fboxforgot">
          <form onSubmit={handleForgot}>
            <h2>Reset Password</h2>
            <p className="form-description">Enter your email address to receive a reset link.</p>
            {/* ... form input for email ... */}
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
            <p>Remember your password? <a href="#" onClick={(e) => {e.preventDefault(); setMode("login");}}>Back to Login</a></p>
          </form>
        </div>

        {/* Reset Password Form */}
        <div className="fboxreset">
          <form onSubmit={handleReset}>
            <h2>New Password</h2>
            <p className="form-description">Enter and confirm your new password.</p>
            {/* ... form inputs for password and confirmPassword ... */}
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