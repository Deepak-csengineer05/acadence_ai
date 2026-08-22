import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClaySelect from '../components/ClaySelect';
import { API_BASE } from '../config/api';
import { 
  ArrowLeft, ArrowRight, Check, Eye, EyeOff, ShieldCheck, Mail, Key, Sparkles, 
  BookOpen, User as UserIcon, BookMarked, Brain, HelpCircle, Building, Calendar, Lock, BarChart2, Users, 
  ArrowRightIcon
} from 'lucide-react';

function Auth({ 
  authMode, setAuthMode, 
  authForm, setAuthForm, 
  authError, handleAuthSubmit, 
  handleGoogleMockLogin,
  onBackToHome,
  handleOnboardSubmit
}) {
  // Local Screen States: "login" | "register" | "forgot" | "verify" | "onboarding"
  const [currentView, setCurrentView] = useState(authMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Verification & Reset states
  const [emailForReset, setEmailForReset] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code & pass
  
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Onboarding local state
  const [onboardSlide, setOnboardSlide] = useState(1); // 1: intro tours, 2: year/dept, 3: interests
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("I");
  const [selectedInterests, setSelectedInterests] = useState([]);
  
  // Carousel tour index (inside Slide 1)
  const [tourIndex, setTourIndex] = useState(0);

  // Reactive Password validation variables (for sign up page)
  const passwordVal = authForm.password || "";
  const hasMinLength = passwordVal.length >= 8;
  const hasCaseMatch = /[a-z]/.test(passwordVal) && /[A-Z]/.test(passwordVal);
  const hasNumberOrSymbol = /[0-9]/.test(passwordVal) || /[^a-zA-Z0-9]/.test(passwordVal);

  // Keep internal view updated if parent changes authMode
  useEffect(() => {
    setCurrentView(authMode);
  }, [authMode]);

  // Reset errors and messages when view changes
  useEffect(() => {
    setLocalError("");
    setSuccessMessage("");
  }, [currentView]);

  // Real Google OAuth GIS Client setup
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!googleClientId) return;
    
    const initGsi = () => {
      if (window.google?.accounts?.id && !window.__google_gsi_initialized) {
        window.__google_gsi_initialized = true;
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            auto_select: false,
            callback: (response) => {
              if (response.credential) {
                handleGoogleMockLogin(response.credential);
              }
            }
          });
        } catch (e) {
          console.warn("GSI init error:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    }
  }, [googleClientId]);

  const triggerRealGoogleLogin = () => {
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.warn("Google One-Tap not displayed:", notification.getNotDisplayedReason?.());
            // Fallback to local sign in if Google Cloud origin is not authorized (403 Forbidden)
            handleGoogleMockLogin();
          }
        });
      } catch (err) {
        handleGoogleMockLogin();
      }
    } else {
      handleGoogleMockLogin();
    }
  };

  // Visual onboarding tour slides
  const tourSlides = [
    {
      title: "Discover Campus Knowledge",
      desc: "Instantly search notes, labs, and previous years question papers (PYQs) uploaded by senior students and faculty members.",
      img: "/ui_assets/pic15.png",
      icon: <BookOpen className="tour-icon text-ocean" />
    },
    {
      title: "AI Subject Companion",
      desc: "Get summaries, quick answers, and explanations of complex engineering topics directly using our local LLM study assistant.",
      img: "/ui_assets/pic1.png",
      icon: <Brain className="tour-icon text-emerald" />
    },
    {
      title: "Placement Preparation",
      desc: "Explore actual company interview experiences, coding round questions, aptitude resources, and selection results.",
      img: "/ui_assets/pic11.png",
      icon: <Sparkles className="tour-icon text-pink" />
    },
    {
      title: "Upload & Earn Badges",
      desc: "Contribute to the vault. Earn contribution points, unlock prestige badges, and maintain your campus login streak!",
      img: "/ui_assets/pic20.png",
      icon: <BookMarked className="tour-icon text-crimson" />
    }
  ];

  // Interest options for Onboarding Slide 3
  const interestOptions = [
    "Subject Notes", "Lab Exercises", "Exam Preparation", 
    "Coding & Projects", "Aptitude Tests", "Placement Interviews", 
    "Verified Answer Keys", "System Architecture", "Faculty Guides"
  ];

  const handleInterestToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // 1. Submit Registration & move to Email Verification
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    // Validate confirmation password
    if (authForm.password !== authForm.confirm_password) {
      setLocalError("Passwords do not match.");
      return;
    }

    // Validate password constraints
    if (!hasMinLength || !hasCaseMatch || !hasNumberOrSymbol) {
      setLocalError("Please make sure your password matches all validation conditions.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
          full_name: authForm.full_name,
          academic_year: authForm.academic_year,
          department: authForm.department
        })
      });

      if (res.ok) {
        setRegisteredEmail(authForm.email);
        // Automatically request verification code sending
        await fetch(`${API_BASE}/auth/verify-email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authForm.email })
        });

        setSuccessMessage("Account created! A verification code has been sent to your email.");
        setCurrentView("verify");
      } else {
        const err = await res.json();
        setLocalError(err.detail || "Registration failed. Check inputs.");
      }
    } catch (err) {
      setLocalError("Failed to communicate with authorization server.");
    }
  };

  // 2. Submit Verification Code and proceed to login/onboarding
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    try {
      const res = await fetch(`${API_BASE}/auth/verify-email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail || authForm.email,
          code: verificationCode
        })
      });

      if (res.ok) {
        // Authenticate the user now
        const contentType = "application/x-www-form-urlencoded";
        const bodyData = new URLSearchParams({
          username: registeredEmail || authForm.email,
          password: authForm.password
        });
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": contentType },
          body: bodyData
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          handleAuthSubmit(null, data.access_token);
        } else {
          setSuccessMessage("");
          setLocalError("Email verified! Please log in with your credentials.");
          setCurrentView("login");
        }
      } else {
        const err = await res.json();
        setLocalError(err.detail || "Invalid code. Please try again.");
      }
    } catch (err) {
      setLocalError("Verification failed. Check network connection.");
    }
  };

  // 3. Request Password Reset code
  const handleForgotPasswordSend = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForReset })
      });

      if (res.ok) {
        setForgotStep(2);
        setSuccessMessage("A 6-digit verification code has been sent to your email.");
      } else {
        const err = await res.json();
        setLocalError(err.detail || "Failed to send reset code.");
      }
    } catch (err) {
      setLocalError("Network error. Please try again.");
    }
  };

  // 4. Verify password reset
  const handleForgotPasswordVerify = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (newPassword !== confirmNewPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForReset,
          code: resetCode,
          new_password: newPassword
        })
      });

      if (res.ok) {
        setSuccessMessage("Password reset successful! You can now log in.");
        setForgotStep(1);
        setCurrentView("login");
      } else {
        const err = await res.json();
        setLocalError(err.detail || "Password reset failed. Check code.");
      }
    } catch (err) {
      setLocalError("Network error. Please try again.");
    }
  };

  // 5. Submit Onboarding Preferences
  const handleOnboardDone = () => {
    if (!selectedDept) {
      setLocalError("Please select your academic department to continue.");
      return;
    }
    setLocalError("");
    
    handleOnboardSubmit({
      department: selectedDept,
      academic_year: selectedYear,
      interests: selectedInterests.length > 0 ? selectedInterests : ["Subject Notes"]
    });
  };

  const isFullImageLeftMode = currentView === "login" || currentView === "register" || currentView === "forgot" || currentView === "verify";

  const getLeftContentTitle = () => {
    switch (currentView) {
      case "login":
        return (
          <>
            Powering Smarter<br />
            <span className="highlight">Academic Futures</span>
          </>
        );
      case "register":
        return (
          <>
            Empowering Peer<br />
            <span className="highlight">Campus Knowledge</span>
          </>
        );
      case "forgot":
        return (
          <>
            Securing Student<br />
            <span className="highlight">Resource Vaults</span>
          </>
        );
      case "verify":
        return (
          <>
            Authenticating User<br />
            <span className="highlight">Credentials</span>
          </>
        );
      default:
        return (
          <>
            Powering Smarter<br />
            <span className="highlight">Academic Futures</span>
          </>
        );
    }
  };

  const getLeftContentDesc = () => {
    switch (currentView) {
      case "login":
        return "Access curated knowledge, get AI-powered assistance, and collaborate beyond boundaries.";
      case "register":
        return "Upload notes, study resources, and earn contribution prestige badges in our local network.";
      case "forgot":
        return "Quick password reset to get you back inside to access all engineering class repositories.";
      case "verify":
        return "Verifying your student identity to maintain campus peer contributions security.";
      default:
        return "Access curated knowledge, get AI-powered assistance, and collaborate beyond boundaries.";
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container-grid">
        
        {/* 60% Left Column: Full visual illustration with header text overlay */}
        <div className="auth-left-visual">
          <img 
            src={currentView === "login" || currentView === "forgot" ? "/ui_assets/pic33.png" : "/ui_assets/pic21.png"}
            alt="Visual Showcase" 
            className="auth-left-bg-img"
          />
          <div className="auth-left-overlay-mask"></div>

          {/* Top Logo branding */}
          <div className="auth-left-logo-row" onClick={onBackToHome}>
            <img src="/ui_assets/acadence_ai_logo.png" alt="Logo" />
            <div className="auth-left-logo-info">
              <h2>Acadence AI</h2>
              <span>Knowledge Never Graduates.</span>
            </div>
          </div>

          {/* Center Headline and taglines */}
          <div className="auth-left-content">
            <h1>{getLeftContentTitle()}</h1>
            <p className="desc">{getLeftContentDesc()}</p>
          </div>

          {/* Copyright Footer */}
          <div className="auth-left-footer">
            <span>© 2026 Acadence AI. Academic P2P System.</span>
          </div>
        </div>

      {/* 40% Right Column: Full-height aligned Forms details panel */}
      <div className="auth-right-forms">
        
        {/* Floating Top Right Back Button */}
        {currentView !== "onboarding" && (
          <button className="auth-back-btn" onClick={onBackToHome} style={{ position: 'absolute', top: '24px', right: '32px' }}>
            <ArrowLeft size={16} /> Back to Home
          </button>
        )}

        <div className="auth-right-forms-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              
              {/* ---------------- WELCOME BACK (SIGN IN) VIEW ---------------- */}
              {currentView === "login" && (
                <div className="auth-form-card">
                  <h2 className="mockup-form-title">Welcome Back</h2>
                  <p className="mockup-form-subtitle">Log in to continue your academic journey</p>

                  {authError && <div className="auth-alert error">{authError}</div>}
                  {successMessage && <div className="auth-alert success">{successMessage}</div>}

                  <form onSubmit={(e) => handleAuthSubmit(e)}>
                    
                    <div className="form-group">
                      <label className="form-label">College Email / Username</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input 
                          className="form-input" 
                          type="text" 
                          required 
                          placeholder="your.email@college.edu" 
                          value={authForm.email} 
                          onChange={e => setAuthForm({...authForm, email: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="label-row">
                        <label className="form-label">Password</label>
                        <span className="forgot-password-link" onClick={() => setCurrentView("forgot")}>
                          Forgot Password?
                        </span>
                      </div>
                      <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input 
                          className="form-input" 
                          type={showPassword ? "text" : "password"} 
                          required 
                          placeholder="••••••••••••" 
                          value={authForm.password} 
                          onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                        />
                        <button 
                          type="button" 
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button className="btn btn-gradient-get-started w-full" type="submit">
                      Sign In <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                  </form>

                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>

                  <button className="google-btn-signin" type="button" onClick={triggerRealGoogleLogin}>
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '6px' }}>
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.995 8.995 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.579c1.32 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.428 0 9 0 5.482 0 2.438 2.017.957 4.962l3.007 2.332C4.672 5.163 6.656 3.579 9 3.579z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </button>

                  <div className="auth-toggle">
                    New here? <span className="auth-toggle-link" onClick={() => setCurrentView("register")}>Create an account</span>
                  </div>
                </div>
              )}


              {/* ---------------- CREATE YOUR ACCOUNT (SIGN UP) VIEW ---------------- */}
              {currentView === "register" && (
                <div className="auth-form-card">
                  <h2 className="mockup-form-title">Create Your Account</h2>
                  <p className="mockup-form-subtitle">Sign up to get started with Acadence AI</p>

                  {localError && <div className="auth-alert error">{localError}</div>}

                  <form onSubmit={handleRegisterSubmit}>
                    
                    <div className="register-fields-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-with-icon">
                          <UserIcon size={18} className="input-icon" />
                          <input 
                            className="form-input" 
                            type="text" 
                            required 
                            placeholder="Enter your full name" 
                            value={authForm.full_name} 
                            onChange={e => setAuthForm({...authForm, full_name: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">College Email Address</label>
                        <div className="input-with-icon">
                          <Mail size={18} className="input-icon" />
                          <input 
                            className="form-input" 
                            type="email" 
                            required 
                            placeholder="name@college.edu" 
                            value={authForm.email} 
                            onChange={e => setAuthForm({...authForm, email: e.target.value})} 
                          />
                        </div>
                      </div>

                      {/* Department Select Option */}
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <ClaySelect
                          value={authForm.department}
                          onChange={val => setAuthForm({...authForm, department: val})}
                          placeholder="Select Department"
                          required
                          options={[
                            { value: 'CSE', label: 'CSE (Computer Science)' },
                            { value: 'ECE', label: 'ECE (Electronics)' },
                            { value: 'IT', label: 'IT (Information Tech)' },
                            { value: 'MECH', label: 'MECH (Mechanical)' },
                            { value: 'EEE', label: 'EEE (Electrical)' },
                            { value: 'CIVIL', label: 'CIVIL (Civil)' },
                          ]}
                        />
                      </div>

                      {/* Academic Year Select Option */}
                      <div className="form-group">
                        <label className="form-label">Academic Year</label>
                        <ClaySelect
                          value={authForm.academic_year}
                          onChange={val => setAuthForm({...authForm, academic_year: val})}
                          placeholder="Select Year"
                          required
                          options={[
                            { value: 'I', label: 'I Year' },
                            { value: 'II', label: 'II Year' },
                            { value: 'III', label: 'III Year' },
                            { value: 'IV', label: 'IV Year' },
                          ]}
                        />
                      </div>

                      {/* Password */}
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon" />
                          <input 
                            className="form-input" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="Create a password" 
                            value={authForm.password} 
                            onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                          />
                          <button 
                            type="button" 
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon" />
                          <input 
                            className="form-input" 
                            type={showConfirmPassword ? "text" : "password"} 
                            required 
                            placeholder="Confirm your password" 
                            value={authForm.confirm_password} 
                            onChange={e => setAuthForm({...authForm, confirm_password: e.target.value})} 
                          />
                          <button 
                            type="button" 
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Passwords requirements checks */}
                    <div className="pass-requirements-list">
                      <div className={`req-item ${hasMinLength ? 'met' : ''}`}>
                        <Check size={14} className="req-chk-icon" />
                        <span>Minimum 8 characters</span>
                      </div>
                      <div className={`req-item ${hasCaseMatch ? 'met' : ''}`}>
                        <Check size={14} className="req-chk-icon" />
                        <span>Include uppercase & lowercase</span>
                      </div>
                      <div className={`req-item ${hasNumberOrSymbol ? 'met' : ''}`}>
                        <Check size={14} className="req-chk-icon" />
                        <span>Include a number or symbol</span>
                      </div>
                    </div>

                    <button className="btn btn-gradient-get-started w-full" type="submit" style={{ marginTop: '20px' }}>
                      Create Account <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                  </form>

                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>

                  <button className="google-btn-signup" type="button" onClick={triggerRealGoogleLogin}>
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '6px' }}>
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.995 8.995 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.579c1.32 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.428 0 9 0 5.482 0 2.438 2.017.957 4.962l3.007 2.332C4.672 5.163 6.656 3.579 9 3.579z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                  </button>

                  <div className="auth-toggle">
                    Already have an account? <span className="auth-toggle-link" onClick={() => setCurrentView("login")}>Sign in</span>
                  </div>
                </div>
              )}


              {/* ---------------- EMAIL VERIFICATION VIEW ---------------- */}
              {currentView === "verify" && (
                <div className="auth-form-card">
                  <div className="success-icon-badge">
                    <ShieldCheck size={38} className="text-emerald" />
                  </div>
                  <h2 className="mockup-form-title">Email Verification</h2>
                  <p className="mockup-form-subtitle">We sent a 6-digit code to <strong>{registeredEmail || authForm.email}</strong></p>

                  {successMessage && <div className="auth-alert success">{successMessage}</div>}
                  {localError && <div className="auth-alert error">{localError}</div>}

                  <form onSubmit={handleVerificationSubmit}>
                    <div className="form-group">
                      <label className="form-label">Verification OTP Code</label>
                      <input 
                        className="form-input otp-input" 
                        type="text" 
                        maxLength="6" 
                        required 
                        placeholder="123456" 
                        value={verificationCode} 
                        onChange={e => setVerificationCode(e.target.value)} 
                      />
                      <small className="form-helper">Offline Tip: Enter <strong>123456</strong> or check debug logs.</small>
                    </div>

                    <button className="btn btn-gradient-get-started w-full" type="submit">
                      Verify & Continue <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                  </form>

                  <div className="auth-toggle">
                    Didn't receive code? <span className="auth-toggle-link" onClick={() => {
                      setVerificationCode("");
                      setSuccessMessage("Code re-sent successfully!");
                    }}>Resend Code</span>
                  </div>
                </div>
              )}


              {/* ---------------- FORGOT PASSWORD VIEW ---------------- */}
              {currentView === "forgot" && (
                <div className="auth-form-card">
                  <h2 className="mockup-form-title">Reset Password</h2>
                  <p className="mockup-form-subtitle">Recover access to your knowledge vault</p>

                  {localError && <div className="auth-alert error">{localError}</div>}
                  {successMessage && <div className="auth-alert success">{successMessage}</div>}

                  {forgotStep === 1 ? (
                    <form onSubmit={handleForgotPasswordSend}>
                      <div className="form-group">
                        <label className="form-label">College Email Address</label>
                        <div className="input-with-icon">
                          <Mail size={18} className="input-icon" />
                          <input 
                            className="form-input" 
                            type="email" 
                            required 
                            placeholder="student@college.edu" 
                            value={emailForReset} 
                            onChange={e => setEmailForReset(e.target.value)} 
                          />
                        </div>
                      </div>

                      <button className="btn btn-gradient-get-started w-full" type="submit">
                        Send Reset OTP <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotPasswordVerify}>
                      <div className="form-group">
                        <label className="form-label">6-Digit Verification Code</label>
                        <input 
                          className="form-input otp-input" 
                          type="text" 
                          maxLength="6" 
                          required 
                          placeholder="654321" 
                          value={resetCode} 
                          onChange={e => setResetCode(e.target.value)} 
                        />
                        <small className="form-helper">Offline Tip: Enter <strong>654321</strong>.</small>
                      </div>

                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon" />
                          <input 
                            className="form-input" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="Min. 8 characters" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon" />
                          <input 
                            className="form-input" 
                            type={showPassword ? "text" : "password"} 
                            required 
                            placeholder="Re-enter password" 
                            value={confirmNewPassword} 
                            onChange={e => setConfirmNewPassword(e.target.value)} 
                          />
                        </div>
                      </div>

                      <button className="btn btn-gradient-get-started w-full" type="submit">
                        Reset Password <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                      </button>
                    </form>
                  )}

                  <div className="auth-toggle">
                    Remember password? <span className="auth-toggle-link" onClick={() => setCurrentView("login")}>Back to login</span>
                  </div>
                </div>
              )}


              {/* ---------------- ONBOARDING FLOW ---------------- */}
              {currentView === "onboarding" && (
                <div className="auth-form-card onboarding-card">
                  
                  {/* Onboarding Headers */}
                  <div className="onboard-header-progress">
                    <div className="progress-bars">
                      {[1, 2, 3].map(step => (
                        <span 
                          key={step} 
                          className={`progress-bar ${step <= onboardSlide ? 'active' : ''}`}
                        ></span>
                      ))}
                    </div>
                    <span className="onboard-step-num">Step {onboardSlide} of 3</span>
                  </div>

                  {localError && <div className="auth-alert error" style={{ marginTop: 10 }}>{localError}</div>}

                  {/* ONBOARD SLIDE 1: VISUAL HOW-IT-WORKS CAROUSEL */}
                  {onboardSlide === 1 && (
                    <div className="onboard-slide-content">
                      <div className="onboard-logo-intro">
                        <BookOpen className="intro-glow-icon animate-pulse" />
                        <h2>Let's Get Started!</h2>
                        <p className="intro-text">
                          Acadence AI is your offline-friendly campus vault. Take a quick look at how you'll use the platform:
                        </p>
                      </div>

                      {/* Miniature visual carousel inside onboarding form pane */}
                      <div className="onboard-mini-carousel">
                        <div className="onboard-mini-slide">
                          <div className="mini-icon-row">
                            {tourSlides[tourIndex].icon}
                            <h4>{tourSlides[tourIndex].title}</h4>
                          </div>
                          <p className="mini-desc">{tourSlides[tourIndex].desc}</p>
                        </div>

                        <div className="onboard-mini-controls">
                          <button 
                            className="btn-arrow" 
                            disabled={tourIndex === 0}
                            onClick={() => setTourIndex(prev => prev - 1)}
                          >
                            ←
                          </button>
                          <span className="carousel-index">{tourIndex + 1} / {tourSlides.length}</span>
                          <button 
                            className="btn-arrow" 
                            disabled={tourIndex === tourSlides.length - 1}
                            onClick={() => setTourIndex(prev => prev + 1)}
                          >
                            →
                          </button>
                        </div>
                      </div>

                      <button 
                        className="btn btn-gradient-get-started w-full" 
                        onClick={() => setOnboardSlide(2)}
                        style={{ marginTop: 24 }}
                      >
                        Configure Profile <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                      </button>
                    </div>
                  )}

                  {/* ONBOARD SLIDE 2: ACADEMIC DETAILS */}
                  {onboardSlide === 2 && (
                    <div className="onboard-slide-content">
                      <h2>Academic Background</h2>
                      <p className="onboard-sub">Configure your stream to filter notes & curriculum</p>

                      <div className="form-group" style={{ marginTop: 20 }}>
                        <label className="form-label">Select Department / Branch</label>
                        <div className="dept-grid">
                          {["CSE", "ECE", "IT", "MECH", "EEE", "CIVIL"].map(dept => (
                            <button
                              key={dept}
                              type="button"
                              className={`dept-card-btn ${selectedDept === dept ? 'active' : ''}`}
                              onClick={() => setSelectedDept(dept)}
                            >
                              <strong>{dept}</strong>
                              <span>{dept === "CSE" ? "Computer Science" : dept === "ECE" ? "Electronics" : dept === "IT" ? "Information Tech" : "Engineering"}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Academic Year</label>
                        <div className="year-selector-grid">
                          {["I", "II", "III", "IV"].map(yr => (
                            <button
                              key={yr}
                              type="button"
                              className={`year-btn ${selectedYear === yr ? 'active' : ''}`}
                              onClick={() => setSelectedYear(yr)}
                            >
                              {yr} Year
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="onboard-btn-row">
                        <button className="btn-secondary" onClick={() => setOnboardSlide(1)}>
                          Back
                        </button>
                        <button 
                          className="btn btn-gradient-get-started" 
                          onClick={() => {
                            if (!selectedDept) {
                              setLocalError("Please select a department to proceed.");
                            } else {
                              setLocalError("");
                              setOnboardSlide(3);
                            }
                          }}
                        >
                          Set Learning Goals <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ONBOARD SLIDE 3: GOALS & INTERESTS */}
                  {onboardSlide === 3 && (
                    <div className="onboard-slide-content">
                      <h2>Customize Your Feed</h2>
                      <p className="onboard-sub">Select your goals to personalize search queries & resources</p>

                      <div className="form-group" style={{ marginTop: 20 }}>
                        <label className="form-label">What are you studying for? (Select all that apply)</label>
                        <div className="interests-flex">
                          {interestOptions.map(option => {
                            const isSelected = selectedInterests.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                className={`interest-chip-btn ${isSelected ? 'active' : ''}`}
                                onClick={() => handleInterestToggle(option)}
                              >
                                {isSelected && <Check size={14} style={{ marginRight: 6 }} />}
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="onboard-btn-row">
                        <button className="btn-secondary" onClick={() => setOnboardSlide(2)}>
                          Back
                        </button>
                        <button 
                          className="btn btn-gradient-get-started" 
                          onClick={handleOnboardDone}
                        >
                          Enter Acadence Vault <ArrowRightIcon size={16} style={{ marginLeft: '8px' }} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      </div>
    </div>
  );
}

export default Auth;
