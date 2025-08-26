import React, { useState, useEffect } from "react";
import './Login.css';

export default function Login() {
  // Modes: login, register, forgot, reset
  const [mode, setMode] = useState("login");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });

  // User info UI
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");

  // Check URL for reset token on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      verifyResetToken(token);
    }
  }, []);

  // Alert helper
  function triggerAlert(message, type = "success") {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 6000);
  }

  // Clear forms helper
  function clearForms() {
    setLoginForm({ email: "", password: "" });
    setRegisterForm({ name: "", email: "", password: "" });
    setForgotForm({ email: "" });
    setResetForm({ password: "", confirmPassword: "" });
  }

  // Login submit
  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      triggerAlert("Email and password are required!", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Login successful!", "success");
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);
        setUserName(data.name);
        clearForms();
        setMode("login");
        window.history.replaceState({}, document.title, "/");
      } else {
        triggerAlert(data.message || "Invalid credentials.", "error");
      }
    } catch (error) {
      triggerAlert("Login failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Register submit
  async function handleRegister(e) {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      triggerAlert("All fields are required!", "error");
      return;
    }
    if (registerForm.password.length < 6) {
      triggerAlert("Password must be at least 6 characters!", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Registration successful! Please login.", "success");
        clearForms();
        setMode("login");
      } else {
        triggerAlert(data.error || data.message, "error");
      }
    } catch (error) {
      triggerAlert("Registration failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Forgot password submit
  async function handleForgot(e) {
    e.preventDefault();
    if (!forgotForm.email) {
      triggerAlert("Email is required!", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotForm.email }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Password reset email sent! Check your inbox.", "success");
        clearForms();
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

  // Reset password submit
  async function handleReset(e) {
    e.preventDefault();
    if (!resetForm.password || !resetForm.confirmPassword) {
      triggerAlert("Both password fields are required!", "error");
      return;
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      triggerAlert("Passwords do not match!", "error");
      return;
    }
    if (resetForm.password.length < 6) {
      triggerAlert("Password must be at least 6 characters!", "error");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (!token) {
      triggerAlert("Reset token missing.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: resetForm.password }),
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert("Password reset successful! You can now login.", "success");
        clearForms();
        setMode("login");
        window.history.replaceState({}, document.title, "/");
      } else {
        triggerAlert(data.error || "Password reset failed.", "error");
      }
    } catch (error) {
      triggerAlert("Password reset failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Verify reset token
  async function verifyResetToken(token) {
    try {
      const res = await fetch(`/api/reset-password/${token}`);
      if (res.ok) {
        setMode("reset");
        triggerAlert("Please enter your new password.", "success");
      } else {
        triggerAlert("Invalid or expired reset link.", "error");
        setTimeout(() => {
          window.history.replaceState({}, document.title, "/");
          setMode("login");
        }, 3000);
      }
    } catch (error) {
      triggerAlert("Failed to verify reset link.", "error");
      setTimeout(() => {
        window.history.replaceState({}, document.title, "/");
        setMode("login");
      }, 3000);
    }
  }

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName("");
    triggerAlert("Logged out successfully!", "success");
  }

  return (
    <div className="main-auth">
      <div className="alert">
        <i className={alert.type === "success" ? "bx bx-check" : "bx bx-error-circle"}></i>
        <span>{alert.message}</span>
      </div>

      {!userName && mode === "login" && (
        <form className="fbox" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
            required
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
          <p>
            <button type="button" className="login" onClick={() => setMode("register")}>
              Register
            </button>
            &nbsp;|&nbsp;
            <button type="button" className="forgot-password" onClick={() => setMode("forgot")}>
              Forgot Password?
            </button>
          </p>
        </form>
      )}

      {!userName && mode === "register" && (
        <form className="fboxregister" onSubmit={handleRegister}>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Name"
            value={registerForm.name}
            onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
            required
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Signup"}
          </button>
          <p>
            <button type="button" className="login" onClick={() => setMode("login")}>
              Login
            </button>
          </p>
        </form>
      )}

      {!userName && mode === "forgot" && (
        <form className="fboxforgot" onSubmit={handleForgot}>
          <h2>Reset Password</h2>
          <input
            type="email"
            placeholder="Your Email"
            value={forgotForm.email}
            onChange={e => setForgotForm({ ...forgotForm, email: e.target.value })}
            required
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Send Reset Link"}
          </button>
          <p>
            <button type="button" className="back-to-login" onClick={() => setMode("login")}>
              Back to Login
            </button>
          </p>
        </form>
      )}

      {!userName && mode === "reset" && (
        <form className="fboxreset" onSubmit={handleReset}>
          <h2>Set New Password</h2>
          <input
            type="password"
            placeholder="New Password"
            value={resetForm.password}
            onChange={e => setResetForm({ ...resetForm, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={resetForm.confirmPassword}
            onChange={e => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
            required
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </form>
      )}

      {userName && (
        <div className="pbox">
          <div className="Ava" onClick={() => {}}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="dropdown">
            <a href="#" onClick={handleLogout} className="logout">
              Logout
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
