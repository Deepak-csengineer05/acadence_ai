import React, { useState, useEffect, useRef } from 'react';
import { Bell, Flame, Gem, ChevronRight } from 'lucide-react';
import './App.css';

// Zustand stores
import { useAuthStore } from './store/useAuthStore';
import { useSearchStore } from './store/useSearchStore';

// Router setup
import AppRoutes from './routes/AppRoutes';

// Layout and Common Components
import Sidebar from './components/Sidebar';

// Student Pages
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Explorer from './pages/Explorer';
import MyKnowledge from './pages/MyKnowledge';
import Upload from './pages/Upload';
import Interviews from './pages/Interviews';
import ProjectHub from './pages/ProjectHub';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import SettingsPage from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminResourceMgmt from './pages/admin/AdminResourceMgmt';
import AdminUserMgmt from './pages/admin/AdminUserMgmt';
import AdminAIMonitoring from './pages/admin/AdminAIMonitoring';
import AdminReports from './pages/admin/AdminReports';
import AdminSystemStatus from './pages/admin/AdminSystemStatus';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSupportInbox from './pages/admin/AdminSupportInbox';

// Info & Footer Pages
import AboutProject from './pages/info/AboutProject';
import RoadmapPage from './pages/info/RoadmapPage';
import ContactPage from './pages/info/ContactPage';
import HelpCenterPage from './pages/info/HelpCenterPage';
import FeedbackPage from './pages/info/FeedbackPage';
import TermsPage from './pages/info/TermsPage';

import { API_BASE } from './config/api';

const getErrorMessage = (detail) => {
  if (!detail) return "";
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(err => {
      const field = err.loc ? err.loc.slice(1).join('.') : '';
      return `${field ? field + ': ' : ''}${err.msg}`;
    }).join(', ');
  }
  if (typeof detail === 'object') {
    return JSON.stringify(detail);
  }
  return String(detail);
};

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authForm, setAuthForm] = useState({ email: "", password: "", full_name: "", academic_year: "", department: "", confirm_password: "" });
  const [authError, setAuthError] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  // UI Tab Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dashboard Data
  const [announcements, setAnnouncements] = useState([]);
  const [trendingFiles, setTrendingFiles] = useState([]);

  // Search / Explorer State
  const [searchQuery, setSearchQuery] = useState("");
  const [exploreBy, setExploreBy] = useState(""); // Subjects, Technologies, etc.
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("date");
  const [searchResults, setSearchResults] = useState([]);
  
  // Advanced Search Filters
  const [advFilters, setAdvFilters] = useState({
    department: "",
    year: "",
    semester: "",
    branch: "",
    tags: "",
    difficulty: "",
    trending: false
  });
  const [showAdvFilters, setShowAdvFilters] = useState(false);

  // Chat State
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeSources, setActiveSources] = useState([]);
  const chatEndRef = useRef(null);

  // Upload state
  const [uploadData, setUploadData] = useState({ title: "", category_id: "", course_id: "", is_project: false, tags: "" });
  const [customCategory, setCustomCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [aiTaggingActive, setAiTaggingActive] = useState(false);
  const [landingInfoTab, setLandingInfoTab] = useState(null);

  // Interview state
  const [interviewForm, setInterviewForm] = useState({
    company_name: "Zoho",
    role: "",
    aptitude_questions: "",
    coding_questions: "",
    technical_questions: "",
    hr_questions: "",
    timeline: "",
    student_experience: "",
    prep_resources: "",
    selected: false
  });
  const [interviewsList, setInterviewsList] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Leaderboard & Badges State
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  // Admin state
  const [pendingResources, setPendingResources] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [aiMonitoring, setAiMonitoring] = useState(null);
  const [reports, setReports] = useState(null);
  const [sysStatus, setSysStatus] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

  // Database helper values
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);

  // Load Initial Session & Dynamic dropdown lists on startup
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchInitialDropdowns();
      fetchNotifications();
    }
  }, [token]);

  // Load Tab Specific data
  useEffect(() => {
    if (!token) return;
    if (activeTab === "dashboard") {
      fetchDashboardData();
    } else if (activeTab === "explorer") {
      executeSearch();
    } else if (activeTab === "my-knowledge") {
      fetchMyKnowledge();
    } else if (activeTab === "leaderboard") {
      fetchLeaderboard();
    } else if (activeTab === "interviews") {
      fetchInterviews();
    } else if (activeTab === "admin-dashboard") {
      fetchAdminStats();
    } else if (activeTab === "resource-mgmt") {
      fetchPendingResources();
    } else if (activeTab === "user-mgmt") {
      fetchAdminUsers();
    } else if (activeTab === "ai-monitoring") {
      fetchAiMonitoring();
    } else if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "system-status") {
      fetchSystemStatus();
    }
  }, [activeTab, token]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.role === "admin") {
          setActiveTab("admin-dashboard");
        }
      } else {
        handleLogout();
      }
    } catch (e) {
      handleLogout();
    }
  };

  const fetchInitialDropdowns = async () => {
    try {
      const [catsRes, coursesRes] = await Promise.all([
        fetch(`${API_BASE}/categories`, { headers: getHeaders() }),
        fetch(`${API_BASE}/courses`, { headers: getHeaders() })
      ]);
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(cats);
        if (cats.length > 0) {
          setUploadData(prev => ({ ...prev, category_id: cats[0].id }));
        }
      }
      
      if (coursesRes && coursesRes.ok) {
        const fetchedCourses = await coursesRes.json();
        if (fetchedCourses && fetchedCourses.length > 0) {
          setCourses(fetchedCourses);
        }
      }
    } catch (e) {
      console.log("Error fetching dropdowns:", e);
    }
  };

  // Real-time tab visit tracking for Recently Visited dashboard widget
  useEffect(() => {
    if (!activeTab || activeTab === 'dashboard') return;
    try {
      const saved = JSON.parse(localStorage.getItem('recently_visited_tabs') || '[]');
      const filtered = saved.filter(t => t !== activeTab);
      const updated = [activeTab, ...filtered].slice(0, 4);
      localStorage.setItem('recently_visited_tabs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      // Announcements
      const annRes = await fetch(`${API_BASE}/announcements`);
      if (annRes.ok) {
        setAnnouncements(await annRes.json());
      }
      // Load recent documents
      const docsRes = await fetch(`${API_BASE}/documents?status_filter=APPROVED`, { headers: getHeaders() });
      if (docsRes.ok) {
        const docs = await docsRes.json();
        setTrendingFiles(docs.slice(0, 4));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/`, { headers: getHeaders() });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {}
  };

  const markNotificationsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, { method: "POST", headers: getHeaders() });
      fetchNotifications();
    } catch (e) {}
  };

  const executeSearch = async () => {
    try {
      const payload = {
        query: searchQuery,
        category_id: selectedCategory ? parseInt(selectedCategory) : null,
        course_id: selectedCourse ? parseInt(selectedCourse) : null,
        explore_by: exploreBy || null,
        advanced_filters: showAdvFilters ? {
          department: advFilters.department || null,
          year: advFilters.year || null,
          semester: advFilters.semester || null,
          branch: advFilters.branch || null,
          tags: advFilters.tags ? advFilters.tags.split(",").map(t => t.trim()) : null,
          difficulty: advFilters.difficulty || null,
          trending: advFilters.trending
        } : null,
        sort_by: sortOrder
      };
      
      const res = await fetch(`${API_BASE}/search/query`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMessage = { role: "user", content: chatQuery };
    setChatHistory(prev => [...prev, userMessage]);
    setChatQuery("");
    setChatLoading(true);

    const assistantMessagePlaceholder = { role: "assistant", content: "" };
    setChatHistory(prev => [...prev, assistantMessagePlaceholder]);
    setActiveSources([]); // Clear previous sources for new search

    // Fetch active sources for grounding context layout
    try {
      fetch(`${API_BASE}/search/query`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ query: userMessage.content, category_id: null, course_id: null, explore_by: null, advanced_filters: null, sort_by: "relevance" })
      })
      .then(res => res.json())
      .then(data => {
        setActiveSources(data || []);
      })
      .catch(() => {});
    } catch (e) {}

    try {
      const res = await fetch(`${API_BASE}/search/chat`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          query: userMessage.content,
          history: chatHistory.filter(m => m.content !== "")
        })
      });

      if (!res.ok) {
        throw new Error("Failed chatbot request");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const decodedToken = decoder.decode(value, { stream: true });
        assistantText += decodedToken;
        
        // Update the last assistant response with streamed text
        setChatHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch (err) {
      setChatHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { 
          role: "assistant", 
          content: "❌ Failed to connect to Senior AI. Please verify the local server is active." 
        };
        return updated;
      });
    } finally {
      setChatLoading(false);
      fetchProfile(); // Refresh points/streak in case badge was unlocked
      fetchNotifications();
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus("Please choose a file to upload");
      return;
    }

    setUploadStatus("Uploading resource...");
    setAiTaggingActive(true);

    const formData = new FormData();
    formData.append("title", uploadData.title);
    formData.append("is_project", uploadData.is_project);
    formData.append("file", selectedFile);
    
    // Check if category is dynamic custom input
    let targetCatId = uploadData.category_id;
    if (customCategory.trim()) {
      try {
        const catRes = await fetch(`${API_BASE}/categories/`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ name: customCategory })
        });
        if (catRes.ok) {
          const newCat = await catRes.json();
          targetCatId = newCat.id;
          // Refresh list
          fetchInitialDropdowns();
        }
      } catch (e) {
        console.log(e);
      }
    }
    
    formData.append("category_id", targetCatId);
    if (uploadData.course_id) {
      formData.append("course_id", uploadData.course_id);
    }
    if (uploadData.tags) {
      formData.append("tags", uploadData.tags);
    }

    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setUploadStatus("✅ Resource submitted successfully! Awaiting admin moderation.");
        setUploadData({ title: "", category_id: categories[0]?.id || "", course_id: "", is_project: false, tags: "" });
        setCustomCategory("");
        setSelectedFile(null);
        fetchProfile();
        fetchNotifications();
      } else {
        const err = await res.json();
        setUploadStatus(`❌ Upload failed: ${getErrorMessage(err.detail) || "Error occurred"}`);
      }
    } catch (e) {
      setUploadStatus("❌ Network error during upload");
    } finally {
      setAiTaggingActive(false);
    }
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/interviews/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(interviewForm)
      });
      if (res.ok) {
        alert("✅ Interview experience submitted! Awaiting admin moderation.");
        setInterviewForm({
          company_name: "Zoho", role: "", aptitude_questions: "", coding_questions: "",
          technical_questions: "", hr_questions: "", timeline: "", student_experience: "",
          prep_resources: "", selected: false
        });
        fetchInterviews();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchInterviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/interviews/?status_filter=APPROVED`, { headers: getHeaders() });
      if (res.ok) {
        setInterviewsList(await res.json());
      }
    } catch (e) {}
  };

  const handleCitationClick = async (type, id) => {
    if (type === "interview") {
      try {
        const res = await fetch(`${API_BASE}/interviews/?status_filter=APPROVED`, { headers: getHeaders() });
        if (res.ok) {
          const list = await res.json();
          const found = list.find(item => item.id === parseInt(id));
          if (found) {
            setSelectedInterview(found);
            setActiveTab("interviews");
          } else {
            alert("This interview experience is pending moderation or does not exist.");
          }
        }
      } catch (e) {
        alert("Failed to retrieve interview experience.");
      }
    } else if (type === "document") {
      try {
        const res = await fetch(`${API_BASE}/documents/?status_filter=APPROVED`, { headers: getHeaders() });
        if (res.ok) {
          const list = await res.json();
          const found = list.find(item => item.id === parseInt(id));
          if (found) {
            fetch(`${API_BASE}/documents/view/${id}`, { method: "POST" });
            alert(`Selected Document: "${found.title}"\nUploaded by: ${found.uploader_name || "Senior"}\n\nInitiating file download reference.`);
          } else {
            alert("This document is pending moderation or does not exist.");
          }
        }
      } catch (e) {
        alert("Failed to retrieve document details.");
      }
    }
  };

  const fetchMyKnowledge = async () => {
    try {
      const [docsRes, intsRes] = await Promise.all([
        fetch(`${API_BASE}/documents/my`, { headers: getHeaders() }),
        fetch(`${API_BASE}/interviews/my`, { headers: getHeaders() })
      ]);
      const docs = docsRes.ok ? await docsRes.json() : [];
      const ints = intsRes.ok ? await intsRes.json() : [];
      
      const merged = [
        ...docs.map(d => ({ ...d, type: "document" })),
        ...ints.map(i => ({ ...i, type: "interview", title: `Interview Experience at ${i.company_name} (${i.role})` }))
      ];
      setSearchResults(merged);
    } catch (e) {}
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaderboard/rankings`, { headers: getHeaders() });
      if (res.ok) {
        setLeaderboard(await res.json());
      }
      const achRes = await fetch(`${API_BASE}/leaderboard/achievements/my`, { headers: getHeaders() });
      if (achRes.ok) {
        setAchievements(await achRes.json());
      }
    } catch (e) {}
  };

  const handleUpvote = async (type, id) => {
    const endpoint = type === "document" ? `documents/upvote/${id}` : `interviews/upvote/${id}`;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: getHeaders()
      });
      if (res.ok) {
        if (activeTab === "explorer") executeSearch();
        else if (activeTab === "interviews") fetchInterviews();
      }
    } catch (e) {}
  };

  // --- Admin Moderation & Management Functions ---
  const fetchPendingResources = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/resources/pending`, { headers: getHeaders() });
      if (res.ok) {
        setPendingResources(await res.json());
      }
    } catch (e) {}
  };

  const handleModeration = async (type, id, action) => {
    const endpoint = type === "document" ? `documents/${action}/${id}` : `interviews/${action}/${id}`;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: getHeaders()
      });
      if (res.ok) {
        fetchPendingResources();
        alert(`Resource ${action}d successfully`);
      }
    } catch (e) {}
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, { headers: getHeaders() });
      if (res.ok) {
        setAdminUsers(await res.json());
      }
    } catch (e) {}
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const targetRole = currentRole === "admin" ? "student" : "admin";
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role?role=${targetRole}`, {
        method: "PUT",
        headers: getHeaders()
      });
      if (res.ok) {
        fetchAdminUsers();
      }
    } catch (e) {}
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this student profile?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        fetchAdminUsers();
      }
    } catch (e) {}
  };

  const fetchAiMonitoring = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/ai-monitoring/stats`, { headers: getHeaders() });
      if (res.ok) {
        setAiMonitoring(await res.json());
      }
    } catch (e) {}
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/generate`, { headers: getHeaders() });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (e) {}
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/generate`, { headers: getHeaders() });
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (e) {}
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/system-status`, { headers: getHeaders() });
      if (res.ok) {
        setSysStatus(await res.json());
      }
    } catch (e) {}
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      const res = await fetch(`${API_BASE}/admin/announcements?title=${encodeURIComponent(newAnnouncement.title)}&content=${encodeURIComponent(newAnnouncement.content)}`, {
        method: "POST",
        headers: getHeaders()
      });
      if (res.ok) {
        alert("Announcement banner posted to students board!");
        setNewAnnouncement({ title: "", content: "" });
      }
    } catch (e) {}
  };

  // --- Auth Handlers ---
  const handleAuthSubmit = async (e, directToken = null) => {
    if (e) e.preventDefault();
    setAuthError("");

    if (directToken) {
      localStorage.setItem("token", directToken);
      setToken(directToken);
      setAuthForm({ email: "", password: "", full_name: "", academic_year: "", department: "", confirm_password: "" });
      return;
    }

    const endpoint = authMode === "login" ? "login" : "register";
    
    // Convert register options or login details to formUrlEncoded / json
    let bodyData;
    let contentType = "application/json";

    if (authMode === "login") {
      contentType = "application/x-www-form-urlencoded";
      bodyData = new URLSearchParams({
        username: authForm.email, // oauth expects 'username' field
        password: authForm.password
      });
    } else {
      bodyData = JSON.stringify({
        email: authForm.email,
        password: authForm.password,
        full_name: authForm.full_name,
        academic_year: authForm.academic_year,
        department: authForm.department
      });
    }

    try {
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: bodyData
      });

      if (res.ok) {
        const data = await res.json();
        const incomingToken = data.access_token;
        localStorage.setItem("token", incomingToken);
        setToken(incomingToken);
        setAuthForm({ email: "", password: "", full_name: "", academic_year: "", department: "", confirm_password: "" });
      } else {
        const err = await res.json();
        setAuthError(getErrorMessage(err.detail) || "Authentication failed. Check your inputs.");
      }
    } catch (err) {
      setAuthError("Failed to communicate with authorization server.");
    }
  };

  const handleGoogleMockLogin = async (realGoogleIdToken = null) => {
    setAuthError("");
    try {
      const tokenToUse = typeof realGoogleIdToken === 'string' && realGoogleIdToken ? realGoogleIdToken : "mock_google_token_oauth_flow_12345";
      const res = await fetch(`${API_BASE}/auth/google?id_token=${encodeURIComponent(tokenToUse)}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        const incomingToken = data.access_token;
        localStorage.setItem("token", incomingToken);
        setToken(incomingToken);
      } else {
        setAuthError("Google single sign-on failed.");
      }
    } catch (e) {
      setAuthError("Failed to communicate with authorization server.");
    }
  };

  const handleOnboardSubmit = async (onboardData) => {
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/onboard`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(onboardData)
      });
      if (res.ok) {
        // Fetch user profile to reload preferences and redirect to main tab
        fetchProfile();
      } else {
        const err = await res.json();
        setAuthError(getErrorMessage(err.detail) || "Onboarding failed.");
      }
    } catch (err) {
      setAuthError("Failed to submit onboarding selection.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setActiveTab("dashboard");
  };

  // --- Auth View Shield ---
  if (!token || !user) {
    if (showAuth) {
      return (
        <Auth 
          authMode={authMode} 
          setAuthMode={setAuthMode}
          authForm={authForm} 
          setAuthForm={setAuthForm}
          authError={authError} 
          handleAuthSubmit={handleAuthSubmit}
          handleGoogleMockLogin={handleGoogleMockLogin}
          onBackToHome={() => setShowAuth(false)}
        />
      );
    }

    if (landingInfoTab) {
      return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', padding: '24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setLandingInfoTab(null)}>
              ← Back to Home
            </button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost-silver btn-sm" onClick={() => { setLandingInfoTab(null); setAuthMode('login'); setShowAuth(true); }}>Login</button>
              <button className="btn btn-gradient-get-started btn-sm" onClick={() => { setLandingInfoTab(null); setAuthMode('register'); setShowAuth(true); }}>Get Started</button>
            </div>
          </div>
          {landingInfoTab === "about" && <AboutProject isPublic={true} setActiveTab={() => setLandingInfoTab(null)} />}
          {landingInfoTab === "roadmap" && <RoadmapPage isPublic={true} setActiveTab={() => setLandingInfoTab(null)} />}
          {landingInfoTab === "contact" && <ContactPage isPublic={true} setActiveTab={() => setLandingInfoTab(null)} user={null} />}
          {landingInfoTab === "help" && <HelpCenterPage isPublic={true} setActiveTab={() => setLandingInfoTab(null)} />}
          {landingInfoTab === "feedback" && <FeedbackPage isPublic={true} setActiveTab={() => setLandingInfoTab(null)} user={null} />}
          {landingInfoTab === "terms" && <TermsPage isPublic={true} setActiveTab={() => setLandingInfoTab(null)} />}
        </div>
      );
    }

    return (
      <LandingPage 
        onNavigate={(mode) => {
          if (mode === "login" || mode === "register") {
            setAuthMode(mode);
            setShowAuth(true);
          } else {
            setLandingInfoTab(mode);
          }
        }}
      />
    );
  }

  // --- Onboarding Force Shield ---
  if (user && user.role === "student" && !user.onboarded) {
    return (
      <Auth 
        authMode="onboarding"
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        handleAuthSubmit={handleAuthSubmit}
        handleGoogleMockLogin={handleGoogleMockLogin}
        onBackToHome={handleLogout}
        handleOnboardSubmit={handleOnboardSubmit}
      />
    );
  }

  // --- Main Render Portal ---
  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setExploreBy={setExploreBy}
        handleLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Workspace Panels */}
      <div className="workspace">
        {/* Header Bar */}
        <div className="header">
          <div className="header-title">
            {activeTab === 'ai-chat' ? 'Senior AI Chat' : activeTab.replace(/-/g, ' ')}
          </div>

          <div className="header-actions">
            {user.role === "student" && (
              <>
                <div className="streak-badge" title="Daily login streak">
                  <Flame size={13} />
                  {user.streak_count} day streak
                </div>
                <div className="points-badge">
                  <Gem size={13} />
                  {user.contribution_points} pts
                </div>
              </>
            )}

            <div
              className="notif-btn"
              onClick={() => { setActiveTab("notifications"); markNotificationsRead(); }}
            >
              <Bell size={18} />
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="notif-dot" />
              )}
            </div>
          </div>
        </div>

        <div className="content-body">
          {/* Student Tabs */}
          {activeTab === "dashboard" && (
            <Dashboard 
              user={user} 
              announcements={announcements} 
              trendingFiles={trendingFiles} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === "ai-chat" && (
            <AIChat 
              chatHistory={chatHistory} 
              chatQuery={chatQuery} 
              setChatQuery={setChatQuery} 
              chatLoading={chatLoading} 
              handleChatSend={handleChatSend} 
              chatEndRef={chatEndRef} 
              activeSources={activeSources}
              onCitationClick={handleCitationClick}
            />
          )}

          {activeTab === "explorer" && (
            <Explorer 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              exploreBy={exploreBy} 
              setExploreBy={setExploreBy}
              selectedCourse={selectedCourse} 
              setSelectedCourse={setSelectedCourse}
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory}
              sortOrder={sortOrder} 
              setSortOrder={setSortOrder}
              searchResults={searchResults}
              advFilters={advFilters} 
              setAdvFilters={setAdvFilters}
              showAdvFilters={showAdvFilters} 
              setShowAdvFilters={setShowAdvFilters}
              executeSearch={executeSearch}
              courses={courses}
              categories={categories}
              handleUpvote={handleUpvote}
              API_BASE={API_BASE}
            />
          )}

          {activeTab === "my-knowledge" && (
            <MyKnowledge searchResults={searchResults} setActiveTab={setActiveTab} />
          )}

          {activeTab === "upload" && (
            <Upload
              uploadData={uploadData}
              setUploadData={setUploadData}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              uploadStatus={uploadStatus}
              aiTaggingActive={aiTaggingActive}
              handleUploadSubmit={handleUploadSubmit}
              categories={categories}
              courses={courses}
              user={user}
              achievements={achievements}

            />
          )}

          {activeTab === "interviews" && (
            <Interviews 
              interviewForm={interviewForm} 
              setInterviewForm={setInterviewForm}
              interviewsList={interviewsList}
              selectedInterview={selectedInterview} 
              setSelectedInterview={setSelectedInterview}
              handleInterviewSubmit={handleInterviewSubmit}
              handleUpvote={handleUpvote}
              setActiveTab={setActiveTab}
              setSearchQuery={setSearchQuery}
              executeSearch={executeSearch}
            />
          )}

          {activeTab === "leaderboard" && (
            <Leaderboard 
              leaderboard={leaderboard} 
              achievements={achievements} 
              user={user} 
            />
          )}

          {activeTab === "profile" && (
            <Profile user={user} achievements={achievements} token={token} setUser={setUser} API_BASE={API_BASE} />
          )}

          {activeTab === "project-hub" && (
            <ProjectHub user={user} setActiveTab={setActiveTab} />
          )}

          {activeTab === "notifications" && (
            <Notifications 
              notifications={notifications} 
              markNotificationsRead={markNotificationsRead} 
            />
          )}

          {activeTab === "settings" && (
            <SettingsPage token={token} user={user} setUser={setUser} API_BASE={API_BASE} />
          )}

          {/* Admin Tabs - Protected by Role Guard */}
          {["admin-dashboard", "resource-mgmt", "support-inbox", "user-mgmt", "ai-monitoring", "reports", "system-status", "announcements"].includes(activeTab) && user?.role !== 'admin' && (
            <div className="panel" style={{ textAlign: 'center', padding: '48px 24px', margin: '40px auto', maxWidth: 520, border: '1px solid var(--color-red-dim)' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🛡️</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-red)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                Access Denied (403 Forbidden)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 24, lineHeight: 1.6 }}>
                The page you are trying to access requires <strong>Administrator</strong> privileges.
                Your account (<strong>{user?.email}</strong>) is registered as a <strong>{user?.role || 'Student'}</strong>.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('dashboard')}>
                Return to Student Dashboard
              </button>
            </div>
          )}

          {user?.role === 'admin' && activeTab === "admin-dashboard" && (
            <AdminDashboard 
              reports={reports} 
              token={token} 
              API_BASE={API_BASE} 
              setActiveTab={setActiveTab} 
              fetchDashboardData={fetchDashboardData}
              pendingResources={pendingResources}
            />
          )}

          {user?.role === 'admin' && activeTab === "resource-mgmt" && (
            <AdminResourceMgmt 
              pendingResources={pendingResources} 
              handleModeration={handleModeration} 
              token={token}
              API_BASE={API_BASE}
              categories={categories}
              courses={courses}
              fetchDashboardData={fetchDashboardData}
            />
          )}

          {user?.role === 'admin' && activeTab === "support-inbox" && (
            <AdminSupportInbox token={token} API_BASE={API_BASE} />
          )}

          {user?.role === 'admin' && activeTab === "user-mgmt" && (
            <AdminUserMgmt 
              adminUsers={adminUsers} 
              handleRoleToggle={handleRoleToggle} 
              handleDeleteUser={handleDeleteUser} 
              currentUser={user} 
            />
          )}

          {user?.role === 'admin' && activeTab === "ai-monitoring" && (
            <AdminAIMonitoring aiMonitoring={aiMonitoring} />
          )}

          {user?.role === 'admin' && activeTab === "reports" && (
            <AdminReports reports={reports} />
          )}

          {user?.role === 'admin' && activeTab === "system-status" && (
            <AdminSystemStatus sysStatus={sysStatus} />
          )}

          {user?.role === 'admin' && activeTab === "announcements" && (
            <AdminAnnouncements 
              newAnnouncement={newAnnouncement} 
              setNewAnnouncement={setNewAnnouncement}
              handlePostAnnouncement={handlePostAnnouncement}
            />
          )}

          {/* Info & Support Pages */}
          {activeTab === "about" && (
            <AboutProject setActiveTab={setActiveTab} />
          )}

          {activeTab === "roadmap" && (
            <RoadmapPage setActiveTab={setActiveTab} />
          )}

          {activeTab === "contact" && (
            <ContactPage setActiveTab={setActiveTab} user={user} />
          )}

          {activeTab === "help" && (
            <HelpCenterPage setActiveTab={setActiveTab} />
          )}

          {activeTab === "feedback" && (
            <FeedbackPage setActiveTab={setActiveTab} user={user} />
          )}

          {activeTab === "terms" && (
            <TermsPage setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
