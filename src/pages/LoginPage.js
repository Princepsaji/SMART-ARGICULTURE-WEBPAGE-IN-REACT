import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { motion } from "framer-motion";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false); // 🎉 New state for popup
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        setShowPopup(true); // 🎉 Show popup after registration
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard"); // ✅ Only redirect after login
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="login-card"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h2 className="login-title">{isRegister ? "Register" : "Login"}</h2>
        {error && <p className="error-text">{error}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="input-field" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="input-field" 
          />
          <motion.button 
            type="submit" 
            className="login-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isRegister ? "Register" : "Login"}
          </motion.button>
        </form>

        {!isRegister && (
          <p className="forgot-password" onClick={handleForgotPassword}>
            Forgot Password?
          </p>
        )}

        <p className="toggle-text">
          {isRegister ? "Already have an account?" : "Don't have an account?"} 
          <span className="toggle-link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? " Login" : " Register"}
          </span>
        </p>
      </motion.div>

      {/* 🎉 Popup Message */}
      {showPopup && (
        <div className="popup-message">
          <p>Registration Successful!</p>
          <button className="popup-button" onClick={() => setShowPopup(false)}>OK</button>
        </div>
      )}
    </motion.div>
  );
}
