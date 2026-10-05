import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:8080";
const USER_STORAGE_KEY = "skillmapai_user_id";
const getUserStorageKey = (name, id) => `skillmapai_${name}_${id}`;

function App() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
const [resumeAnalysis, setResumeAnalysis] = useState(null);
const [resumeLoading, setResumeLoading] = useState(false);
const [loginId, setLoginId] = useState("");
const [loginError, setLoginError] = useState("");

const [activePage, setActivePage] = useState("Resume Analyzer");
  // Always show the Login/Signup screen when the app is opened.
  // The user can log in again and their saved analysis will be restored.
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({
    name: "",
    email: "",
    education: "",
    sector: "PRIVATE",
  });
  
  const [skills, setSkills] = useState([]);
  const [skillText, setSkillText] = useState("");
  const [skillGap, setSkillGap] = useState(null);
  const [careerResult, setCareerResult] = useState(null);
  const [jobResults, setJobResults] = useState(null);
  const [futureSkills, setFutureSkills] = useState(null);
  const [linkedinProfile, setLinkedinProfile] = useState(null);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [careerLoading, setCareerLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [futureLoading, setFutureLoading] = useState(false);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [error, setError] = useState("");

  // Authentication state must stay at the top level of the component.
  const [authMode, setAuthMode] = useState("signup");
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    education: "",
    sector: "PRIVATE",
  });
  const [signupError, setSignupError] = useState("");
  const [loginUserId, setLoginUserId] = useState("");

  const authInputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    marginTop: "12px",
    fontSize: "15px",
    boxSizing: "border-box",
  };

  const currentSkills = useMemo(() => skills.join(", "), [skills]);

  // Restore analyzed data after LinkedIn redirects back to the app.
  useEffect(() => {
    if (!userId) return;

    try {
      const savedSkills = localStorage.getItem(getUserStorageKey("skills", userId));
      const savedSkillText = localStorage.getItem(getUserStorageKey("skillText", userId));
      const savedResumeAnalysis = localStorage.getItem(getUserStorageKey("resumeAnalysis", userId));
      const savedSkillGap = localStorage.getItem(getUserStorageKey("skillGap", userId));

      if (savedSkills) setSkills(JSON.parse(savedSkills));
      if (savedSkillText) setSkillText(savedSkillText);
      if (savedResumeAnalysis) setResumeAnalysis(JSON.parse(savedResumeAnalysis));
      if (savedSkillGap) setSkillGap(JSON.parse(savedSkillGap));
    } catch (err) {
      console.error("Saved analysis restore error:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    try {
      localStorage.setItem(getUserStorageKey("skills", userId), JSON.stringify(skills));
      localStorage.setItem(getUserStorageKey("skillText", userId), skillText);
      if (resumeAnalysis) {
        localStorage.setItem(getUserStorageKey("resumeAnalysis", userId), JSON.stringify(resumeAnalysis));
      }
      if (skillGap) {
        localStorage.setItem(getUserStorageKey("skillGap", userId), JSON.stringify(skillGap));
      }
    } catch (err) {
      console.error("Analysis save error:", err);
    }
  }, [userId, skills, skillText, resumeAnalysis, skillGap]);

  const loadUserProfile = async (id = userId) => {
    if (!id) return;

    try {
      const data = await requestJson(`${API}/api/users/${id}`);

      setUser({
        name: data?.name || "",
        email: data?.email || "",
        education: data?.education || "",
        sector: data?.sector || "PRIVATE",
      });
    } catch (err) {
      console.error("Profile loading error:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    loadUserProfile(userId);
    loadUserSkills(userId);
    loadLinkedInProfile(userId);

    const params = new URLSearchParams(window.location.search);
    if (params.get("linkedin") === "connected") {
      setLinkedinConnected(true);
      setActivePage("Dashboard");
      loadLinkedInProfile(userId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [userId]);

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!response.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || data?.error || `Request failed (${response.status})`;
      throw new Error(message);
    }
    return data;
  };
  const handleSignup = async (signupData) => {
  try {
    const data = await requestJson(`${API}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    alert("Account created successfully!");

    console.log("Registered user:", data);

    if (data?.id) {
      localStorage.setItem(USER_STORAGE_KEY, String(data.id));
      setUserId(data.id);

      setUser({
        name: data.name || signupData.name,
        email: data.email || signupData.email,
        education: data.education || signupData.education,
        sector: data.sector || signupData.sector || "PRIVATE",
      });
    }

    setActivePage("Resume Analyzer");
  } catch (error) {
    console.error("Signup error:", error);
    setError(error.message || "Signup failed.");
  }
};
const uploadResume = async () => {
  if (!resumeFile) {
    setError("Please select a resume first.");
    return;
  }

  setResumeLoading(true);
  setError("");
  setResumeAnalysis(null);

  try {
    const formData = new FormData();

    // This name must match @RequestParam("file") in Spring Boot
    formData.append("file", resumeFile);

    const response = await fetch(`${API}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw new Error(
        typeof data === "string"
          ? data
          : data?.error || "Resume upload failed."
      );
    }

    setResumeAnalysis(data);
    setError("");
  } catch (err) {
    console.error("Resume upload error:", err);
    setError(err.message || "Unable to analyze resume.");
  } finally {
    setResumeLoading(false);
  }
};
const uploadResumeAndAnalyze = async () => {
  if (!resumeFile) {
    setError("Please upload your resume first.");
    return;
  }

  setResumeLoading(true);
  setError("");

  try {
    // 1. Upload resume to Spring Boot
    const formData = new FormData();
    formData.append("file", resumeFile);

    const uploadResponse = await fetch(
      `${API}/api/resume/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(
        uploadData.error || "Resume upload failed."
      );
    }

    // 2. Save complete AI resume analysis
    setResumeAnalysis(uploadData);

    const aiAnalysis = uploadData.aiAnalysis || {};

    // 3. Extract skills automatically
    const extractedSkills = Array.isArray(
      aiAnalysis.technicalSkills
    )
      ? aiAnalysis.technicalSkills
          .map((skill) =>
            typeof skill === "string"
              ? skill
              : skill.name || skill.skill || ""
          )
          .filter(Boolean)
      : [];

    if (extractedSkills.length === 0) {
      throw new Error(
        "No technical skills were extracted from the resume."
      );
    }

    // 4. Update React state automatically
    setSkills(extractedSkills);
    setSkillText(extractedSkills.join(", "));

    // Keep the skill text synchronized with the extracted skills.
    // 5. Start automatic skill-gap analysis
    await analyzeExtractedSkillGap(
      extractedSkills,
      aiAnalysis.education || ""
    );

    // 6. Load available job opportunities
    await findJobsUsingSkills(extractedSkills);

  } catch (err) {
    console.error("Automatic resume analysis error:", err);
    setError(err.message || "Resume analysis failed.");
  } finally {
    setResumeLoading(false);
  }
};
const renderSkillObject = (item) => {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    return (
      <div className="skill-recommendation">
        <h3>{item.skillName || item.name || "Recommended Skill"}</h3>

        {item.description && (
          <p>{displayValue(item.description)}</p>
        )}

        {item.duration && (
          <p>
            <strong>Duration:</strong> {displayValue(item.duration)}
          </p>
        )}
      </div>
    );
  }

  return String(item ?? "");
};
const parseJsonString = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const displayValue = (value) => {
  if (value === null || value === undefined) return "";

  const parsed = parseJsonString(value);
  if (parsed !== value) return displayValue(parsed);

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(displayValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
        return `${label}: ${displayValue(item)}`;
      })
      .filter((line) => line.split(": ").slice(1).join(": ").trim())
      .join(" | ");
  }

  return String(value);
};

const toText = (value) => {
  const parsed = parseJsonString(value);

  if (Array.isArray(parsed)) {
    return parsed.map((item) => toText(item)).filter(Boolean).join(", ");
  }

  if (typeof parsed === "object" && parsed !== null) {
    const title = parsed.title || parsed.name || parsed.skill || parsed.skillName;
    const description = parsed.description || parsed.reason || parsed.details;
    const resources = parsed.resources || parsed.resource || parsed.links;

    return [
      title ? `Title: ${toText(title)}` : "",
      description ? `Description: ${toText(description)}` : "",
      resources ? `Resources: ${toText(resources)}` : "",
    ].filter(Boolean).join("\n");
  }

  return String(parsed ?? "");
};

const analyzeExtractedSkillGap = async (skillsFromResume, education) => {
  // Convert all resume skills into one plain string for the Spring Boot API.
  const skillsString = toText(skillsFromResume);

  setSkillGapLoading(true);

  try {
    // Get baseline skill requirements.
    const baseline = await requestJson(
      `${API}/api/skill-gap/${userId}?currentSkills=${encodeURIComponent(
        skillsString
      )}`,
      {
        method: "POST",
      }
    );

    // Send only strings to the AI endpoint.
    const aiData = await requestJson(`${API}/api/ai/analyze-skill-gap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        education: toText(education),
        sector: toText(user.sector || "PRIVATE"),
        currentSkills: skillsString,
        matchedSkills: toText(baseline?.matchedSkills || []),
        missingSkills: toText(baseline?.missingSkills || []),
      }),
    });

    const parsed = typeof aiData === "string" ? safeParseAI(aiData) : aiData;

    setSkillGap({
      ...(parsed || {}),
      baselineMatchPercentage: baseline?.matchPercentage ?? 0,
    });

    setActivePage("Skill Gap");
  } catch (err) {
    console.error("Automatic skill-gap analysis error:", err);
    setError(`Unable to analyze skill gap: ${err.message}`);
  } finally {
    setSkillGapLoading(false);
  }
};
const findJobsUsingSkills = async (extractedSkills) => {
  const skillsString = extractedSkills.join(", ");

  setJobLoading(true);

  try {
    const data = await requestJson(
      `${API}/api/job-matching/${userId}?currentSkills=${encodeURIComponent(
        skillsString
      )}`
    );

    setJobResults(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error("Automatic job matching error:", err);

    setError(
      `Unable to load job opportunities: ${err.message}`
    );
  } finally {
    setJobLoading(false);
  }
};

const renderResumeAnalyzer = () => (
  <div className="page-content">
    <div className="page-header">
      <p className="page-label">
        AUTOMATIC AI ANALYSIS
      </p>

      <h1>Resume to Career Intelligence</h1>

      <p className="page-description">
        Upload your resume. SkillMapAI will automatically
        extract your skills, analyze skill gaps, and find
        related job opportunities.
      </p>
    </div>

    <div className="skill-input-card">
      <h2>Upload Your Resume</h2>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          setResumeFile(e.target.files[0] || null);
          setError("");
        }}
      />

      {resumeFile && (
        <p>
          Selected: <strong>{resumeFile.name}</strong>
        </p>
      )}

      <button
        className="primary-action"
        onClick={uploadResumeAndAnalyze}
        disabled={resumeLoading || !resumeFile}
      >
        {resumeLoading
          ? "Extracting Skills and Analyzing..."
          : "Analyze My Resume →"}
      </button>
    </div>

    {resumeAnalysis?.aiAnalysis && (
      <div className="ai-section-card">
        <h3>Automatically Extracted Skills</h3>

        <div className="skill-list">
          {(
            resumeAnalysis.aiAnalysis.technicalSkills || []
          ).map((skill, index) => (
            <span
              className="skill-tag matched-tag"
              key={index}
            >
              {typeof skill === "string"
                ? skill
                : skill.name || skill.skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {renderError()}
  </div>
);
  const loadUserSkills = async (id = userId) => {
    if (!id) return;
    try {
      const savedSkills = await requestJson(`${API}/api/users/${id}/skills`);
      const list = Array.isArray(savedSkills) ? savedSkills : [];
      const unique = list.filter((skill, index, arr) =>
        arr.findIndex((x) => String(x).toLowerCase() === String(skill).toLowerCase()) === index
      );
      if (unique.length > 0) {
        setSkills(unique);
        setSkillText(unique.join(", "));
      }
    } catch (err) {
      console.error("Load skills error:", err);
      setSkills([]);
      setSkillText("");
    }
  };

  const loadLinkedInProfile = async (id = userId) => {
    if (!id) return;
    try {
      const data = await requestJson(`${API}/api/linkedin/profile/user/${id}`);
      setLinkedinProfile(data);
      setLinkedinConnected(true);
    } catch {
      setLinkedinProfile(null);
      setLinkedinConnected(false);
    }
  };

  const resetUserState = () => {
    setUser({ name: "", email: "", education: "", sector: "PRIVATE" });
    setSkills([]);
    setSkillText("");
    setSkillGap(null);
    setCareerResult(null);
    setJobResults(null);
    setFutureSkills(null);
    setLinkedinProfile(null);
    setLinkedinConnected(false);
    setError("");
    setShowUserMenu(false);
  };

  const loginAsUser = async (value) => {
    const id = Number(String(value).trim());
    if (!Number.isInteger(id) || id <= 0) {
      setError("Please enter a valid numeric User ID.");
      return;
    }

    setError("");
    try {
      const data = await requestJson(`${API}/api/users/${id}`);
      localStorage.setItem(USER_STORAGE_KEY, String(id));
      setUserId(id);
      setUser({
        name: data?.name || "",
        email: data?.email || "",
        education: data?.education || "",
        sector: data?.sector || "PRIVATE",
      });
      setActivePage("Resume Analyzer");
      setShowUserMenu(false);
      await loadUserSkills(id);
      await loadLinkedInProfile(id);
    } catch (err) {
      console.error("User switch error:", err);
      setError("User not found. Please enter an existing User ID.");
    }
  };

  const switchUser = async () => {
    const value = window.prompt("Enter the User ID you want to switch to:", userId ? String(userId) : "");
    if (value === null) return;
    await loginAsUser(value);
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    resetUserState();
    setUserId(null);
    setActivePage("Dashboard");
  };

  const navigateTo = (page) => {
    setError("");
    setActivePage(page);
  };

  const parseSkillText = (value) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((skill, index, list) =>
        list.findIndex((x) => x.toLowerCase() === skill.toLowerCase()) === index
      );

  const updateSkillText = (value) => {
    setSkillText(value);
    setSkills(parseSkillText(value));
  };

  const addSkill = () => {
    const cleaned = skillText.trim();
    if (!cleaned) {
      setError("Type a skill in the skill box first.");
      return;
    }

    const parts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...skills];

    parts.forEach((part) => {
      if (!next.some((s) => s.toLowerCase() === part.toLowerCase())) {
        next.push(part);
      }
    });

    setSkills(next);
    setSkillText("");
    setError("");
  };

  const removeSkill = (skillToRemove) => {
    const next = skills.filter(
      (skill) => skill.toLowerCase() !== skillToRemove.toLowerCase()
    );
    setSkills(next);
    setSkillText(next.join(", "));
    setError("");
  };

  const connectLinkedIn = () => {
    // Save the current analysis before leaving the React page for LinkedIn.
    if (userId) {
      try {
        localStorage.setItem(getUserStorageKey("skills", userId), JSON.stringify(skills));
        localStorage.setItem(getUserStorageKey("skillText", userId), skillText);
        if (resumeAnalysis) {
          localStorage.setItem(getUserStorageKey("resumeAnalysis", userId), JSON.stringify(resumeAnalysis));
        }
        if (skillGap) {
          localStorage.setItem(getUserStorageKey("skillGap", userId), JSON.stringify(skillGap));
        }
      } catch (err) {
        console.error("Could not save analysis before LinkedIn redirect:", err);
      }
    }

    // Open the LinkedIn authorization flow in a new browser tab.
    // Keep the SkillMapAI tab ready on the Dashboard when the user returns.
    setActivePage("Dashboard");
    const linkedinLoginUrl = `${API}/api/linkedin/login?userId=${userId}`;
    const newWindow = window.open(linkedinLoginUrl, "_blank");

    if (!newWindow) {
      console.warn("The browser blocked the LinkedIn popup. Please allow popups for this site.");
    }
  };

  const saveProfile = async () => {
    if (!user.name.trim() || !user.email.trim() || !user.education.trim()) {
      setError("Please complete name, email and education before saving.");
      return;
    }
    if (skills.length === 0) {
      setError("Please add at least one skill.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await requestJson(`${API}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const saved = await requestJson(`${API}/api/users/${userId}/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skills),
      });

      const savedList = Array.isArray(saved) ? saved : skills;
      setSkills(savedList);
      setSkillText(savedList.join(", "));
      await analyzeSkillGap();
      setError("Profile saved and AI analysis completed.");
    } catch (err) {
      console.error("Profile save error:", err);
      setError(err.message || "Unable to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGap = async () => {
    const enteredSkills = Array.isArray(skills)
      ? skills.join(", ")
      : String(skills || "");

    if (!enteredSkills.trim()) {
      setError("Please add at least one skill.");
      return;
    }

    setError("");
    setSkillGapLoading(true);

    try {
      // Get the structured sector requirements only as context.
      const baseline = await requestJson(
        `${API}/api/skill-gap/${userId}?currentSkills=${encodeURIComponent(enteredSkills)}`,
        { method: "POST" }
      );

      // Send the profile + baseline context to Ollama.
      // The page below displays the AI response, not the raw DB response.
      const aiData = await requestJson(`${API}/api/ai/analyze-skill-gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  education: user.education || "",
  sector: user.sector || "PRIVATE",

  currentSkills: Array.isArray(enteredSkills)
    ? enteredSkills.join(", ")
    : enteredSkills || "",

  matchedSkills: (baseline?.matchedSkills || []).join(", "),

  missingSkills: (baseline?.missingSkills || []).join(", "),
}),
      });

      const parsed = typeof aiData === "string" ? safeParseAI(aiData) : aiData;
      console.log("AI SKILL GAP RESPONSE:", parsed);

      setSkillGap({
        ...(parsed || {}),
        baselineMatchPercentage: baseline?.matchPercentage ?? 0,
      });
      setActivePage("Skill Gap");
    } catch (err) {
      console.error("AI skill gap error:", err);
      setError(`Unable to generate AI skill gap analysis: ${err.message}`);
    } finally {
      setSkillGapLoading(false);
    }
  };

  const analyzeCareerRecommendations = async () => {
    if (!currentSkills.trim()) {
      setError("Please enter your skills first.");
      return;
    }
    setCareerLoading(true);
    setError("");
    try {
      const data = await requestJson(
        `${API}/api/ai/career-recommendation/${userId}?currentSkills=${encodeURIComponent(currentSkills)}`,
        { method: "POST" }
      );
      const parsed = typeof data === "string" ? safeParseAI(data) : data;
      setCareerResult(parsed);
      setActivePage("Career Recommendations");
    } catch (err) {
      console.error(err);
      setError(`Unable to generate career recommendations: ${err.message}`);
    } finally {
      setCareerLoading(false);
    }
  };

  const findJobs = async () => {
    if (!currentSkills.trim()) {
      setError("Please enter your skills first.");
      return;
    }
    setJobLoading(true);
    setError("");
    try {
      const data = await requestJson(
        `${API}/api/job-matching/${userId}?currentSkills=${encodeURIComponent(currentSkills)}`
      );
      setJobResults(Array.isArray(data) ? data : []);
      setActivePage("Job Matching");
    } catch (err) {
      console.error(err);
      setError(`Unable to load jobs: ${err.message}`);
    } finally {
      setJobLoading(false);
    }
  };

 const findLinkedInJobs = () => {
  const enteredSkills = Array.isArray(skills)
    ? skills.map((skill) => String(skill).trim()).filter(Boolean)
    : [];

  if (enteredSkills.length === 0) {
    setError("Please add your skills first.");
    return;
  }

  setError("");

  const keywords = enteredSkills.join(" ");
  const linkedinUrl =
    `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}`;

  // Open LinkedIn directly from the button click.
  // If the browser blocks the new tab, use the current tab instead.
  const newWindow = window.open(linkedinUrl, "_blank", "noopener,noreferrer");

  if (!newWindow) {
    window.location.href = linkedinUrl;
  }
};
const analyzeFutureSkills = async () => {
  if (!skills || skills.length === 0) {
    setError("Please enter your current skills.");
    return;
  }

  setError("");
  setFutureLoading(true);

  try {
    const response = await fetch(
      "http://localhost:8080/api/ai/future-skills",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentSkills: Array.isArray(skills)
            ? skills.join(", ")
            : skills,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      throw new Error(text || "Future skill analysis failed.");
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        futureSkills: [],
        reasoning: text,
      };
    }

    setFutureSkills(data);
    setActivePage("Future Skills");

  } catch (err) {
    console.error("Future Skills error:", err);

    setError(
      err.message ||
      "Unable to generate future skills. Make sure Ollama is running."
    );

  } finally {
    setFutureLoading(false);
  }
};

  const generateAIGuidance = async () => {
    if (!currentSkills.trim()) {
      setError("Please enter your skills first.");
      return;
    }
    setGuidanceLoading(true);
    setError("");
    try {
      // The current backend exposes career recommendation as the AI guidance endpoint.
      const data = await requestJson(
        `${API}/api/ai/career-recommendation/${userId}?currentSkills=${encodeURIComponent(currentSkills)}`,
        { method: "POST" }
      );
      setCareerResult(typeof data === "string" ? safeParseAI(data) : data);
      setActivePage("AI Guidance");
    } catch (err) {
      console.error(err);
      setError(`Unable to generate AI guidance: ${err.message}`);
    } finally {
      setGuidanceLoading(false);
    }
  };

  const safeParseAI = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return {
        careerSummary: text,
        careerRecommendations: [],
        recommendedSkills: [],
        learningPlan: [],
        projectIdeas: [],
      };
    }
  };

  const renderError = () =>
    error ? <div className="error-message">{error}</div> : null;

  const renderDashboard = () => (
    <div className="page-content">
      <div className="hero-section">
        <div className="hero-content">
          <p className="page-label">AI-POWERED CAREER INTELLIGENCE</p>
          <h1>
            Build the career
            <br />
            <span>you're meant for.</span>
          </h1>
          <p>
            SkillMapAI analyzes your skills, identifies gaps, recommends careers,
            matches jobs, and predicts the skills you should learn next.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => navigateTo("Profile")}>
              Build My Profile →
            </button>
            <button className="secondary-action" onClick={() => navigateTo("AI Guidance")}>
              Ask AI ✦
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="ai-orb">✦</div>
          <div className="orb-label">AI CAREER ENGINE</div>
        </div>
      </div>

      <div className="dashboard-stats">
        {[
          ["01", "Skill Gap", "Identify what you're missing"],
          ["02", "Career Match", "Discover suitable roles"],
          ["03", "Job Match", "Find relevant opportunities"],
          ["04", "Future Skills", "Prepare for what's next"],
        ].map(([num, title, text]) => (
          <div className="stat-card" key={num}>
            <span>{num}</span>
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card linkedin-card">
          <div className="card-icon linkedin-card-icon">in</div>
          <div>
            <p className="page-label">LINKEDIN INTEGRATION</p>
            <h2>{linkedinConnected ? "LinkedIn Connected" : "Connect your LinkedIn"}</h2>
            <p>
              {linkedinConnected
                ? "Your LinkedIn account is connected to SkillMapAI."
                : "Connect your LinkedIn profile to improve career and job recommendations."}
            </p>
            <button
              className={linkedinConnected ? "linkedin-button connected-btn" : "linkedin-button"}
              onClick={connectLinkedIn}
              disabled={linkedinConnected}
            >
              {linkedinConnected ? "✓ Connected" : "Connect LinkedIn →"}
            </button>
          </div>
        </div>

        <div className="dashboard-card ai-status-card">
          <div className="ai-status-top">
            <div className="card-icon">✦</div>
            <div className="status-live"><span />AI ENGINE ONLINE</div>
          </div>
          <h2>Your career copilot</h2>
          <p>Powered by Ollama AI to provide personalized career intelligence based on your skills.</p>
          <div className="ai-mini-stats">
            <div><strong>6</strong><span>AI modules</span></div>
            <div><strong>24/7</strong><span>Guidance</span></div>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <div className="section-heading">
          <p className="page-label">QUICK ACTIONS</p>
          <h2>Start your career journey</h2>
        </div>
        <div className="quick-actions">
          <button onClick={() => navigateTo("Skill Gap")}><span>◎</span><div><strong>Analyze Skill Gap</strong><small>See what skills you need</small></div>→</button>
          <button onClick={() => navigateTo("Career Recommendations")}><span>◈</span><div><strong>Find My Career</strong><small>Discover suitable careers</small></div>→</button>
          <button onClick={() => navigateTo("Job Matching")}><span>⌕</span><div><strong>Match Jobs</strong><small>Find jobs matching your skills</small></div>→</button>
        </div>
      </div>

      <div className="career-journey-card">
        <div>
          <p className="page-label">YOUR CAREER JOURNEY</p>
          <h2>From skills to your future.</h2>
          <p>Complete each step to unlock personalized career intelligence.</p>
        </div>
        <div className="journey-steps">
          {["Profile", "Skill Gap", "Careers", "Jobs", "Future"].map((step, i) => (
            <div key={step} className="journey-step"><span>{String(i + 1).padStart(2, "0")}</span>{step}</div>
          ))}
        </div>
      </div>
      {renderError()}
    </div>
  );

  const renderProfile = () => (
    <div className="page-content">
      <div className="page-header">
        <p className="page-label">YOUR CAREER PROFILE</p>
        <h1>Profile</h1>
        <p className="page-description">Build your profile so SkillMapAI can personalize your career recommendations.</p>
      </div>

      <div className="interactive-profile">
        <div className="profile-header-card">
          <div className="profile-avatar-large">👤</div>
          <div className="profile-header-info">
            <p className="page-label">CAREER EXPLORER</p>
            <h2>{user.name || "My Career Profile"}</h2>
            <p>User ID: {userId}</p>
          </div>
          <div className="profile-connection">
            <span className={linkedinConnected ? "connection-status connected" : "connection-status"}>
              {linkedinConnected ? "● LinkedIn Connected" : "○ LinkedIn Not Connected"}
            </span>
            {!linkedinConnected && <button className="linkedin-profile-button" onClick={connectLinkedIn}>Connect LinkedIn</button>}
          </div>
        </div>

        <div className="profile-section-card">
          <div className="profile-section-title"><div className="section-title-icon">👤</div><div><h2>Basic Information</h2><p>Your profile information used for career analysis.</p></div></div>
          <div className="profile-fields">
            <div className="profile-field"><label>Name</label><input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} placeholder="Your name" /></div>
            <div className="profile-field"><label>Email</label><input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="you@example.com" /></div>
            <div className="profile-field"><label>Education</label><input value={user.education} onChange={(e) => setUser({ ...user, education: e.target.value })} placeholder="B.Tech Computer Science" /></div>
            <div className="profile-field"><label>Career Sector</label><select value={user.sector} onChange={(e) => setUser({ ...user, sector: e.target.value })}><option value="PRIVATE">IT / Private Sector</option><option value="PUBLIC">Government / Public Sector</option></select></div>
          </div>
        </div>

        <div className="profile-section-card">
          <div className="profile-section-title"><div className="section-title-icon">🧩</div><div><h2>Your Skills</h2><p>Add the technical skills you currently have.</p></div></div>
          <div className="interactive-skill-box">
            <div className="skill-chip-container">
              {skills.length ? skills.map((skill) => <div className="interactive-skill-chip" key={skill}><span>{skill}</span><button onClick={() => removeSkill(skill)}>×</button></div>) : <p className="no-skills">No skills added yet.</p>}
            </div>

            <div className="add-skill-area">
              <input
                type="text"
                className="skill-input"
                value={skillText}
                onChange={(e) => setSkillText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Enter a skill e.g. Java"
              />
              <button
                type="button"
                className="add-skill-button"
                onClick={addSkill}
              >
                + Add Skill
              </button>
            </div>
          </div>
          <div className="skill-input-area">
            <label>Edit all skills at once</label>
            <textarea className="skills-textarea" value={skillText} onChange={(e) => updateSkillText(e.target.value)} placeholder="Java, Spring Boot, SQL, Git" />
          </div>
        </div>

        <div className="profile-section-card">
          <div className="profile-section-title"><div className="section-title-icon linkedin-icon">in</div><div><h2>LinkedIn Integration</h2><p>Use your LinkedIn profile to improve job matching.</p></div></div>
          <div className="linkedin-profile-box">
            <div><strong>{linkedinConnected ? "LinkedIn profile connected" : "Connect your LinkedIn profile"}</strong><p>{linkedinConnected ? `${linkedinProfile?.name || "Your account"} is connected to SkillMapAI.` : "Connect LinkedIn to use the authorized profile integration."}</p></div>
            <button className={linkedinConnected ? "linkedin-profile-button connected-btn" : "linkedin-profile-button"} onClick={connectLinkedIn} disabled={linkedinConnected}>{linkedinConnected ? "✓ Connected" : "Connect →"}</button>
          </div>
        </div>

        <div className="profile-save-area">
          <div><strong>Ready to analyze your profile?</strong><p>Save your profile and run the Skill Gap analysis.</p></div>
          <button className="primary-action save-profile-button" onClick={saveProfile} disabled={loading}>{loading ? "Saving..." : "Save & Analyze Profile →"}</button>
        </div>
        {renderError()}
      </div>
    </div>
  );

  const renderSkillGap = () => {
    const matched =
      skillGap?.matchedSkills ||
      skillGap?.aiMatchedSkills ||
      skillGap?.matched ||
      [];

    const missing =
      skillGap?.prioritySkills ||
      skillGap?.missingSkills ||
      skillGap?.skillsToDevelop ||
      [];

    const future = skillGap?.futureSkills || [];
    const roadmap = skillGap?.learningRoadmap || [];
    const projects = skillGap?.projectIdeas || [];

    const score =
      skillGap?.matchPercentage ??
      skillGap?.aiMatchPercentage ??
      skillGap?.baselineMatchPercentage ??
      0;

    return (
      <div className="page-content">
        <div className="page-header">
          <p className="page-label">AI SKILL INTELLIGENCE</p>
          <h1>AI Skill Gap Analysis</h1>
          <p className="page-description">
            Ollama analyzes your profile and explains your strengths, missing
            skills and what you should learn next.
          </p>
        </div>

        <div className="skill-input-card">
          <h2>Analyze my skills with AI</h2>
          <p>Your saved profile skills will be sent to Ollama.</p>
          <textarea
            className="skills-textarea"
            value={skillText || currentSkills}
            onChange={(e) => updateSkillText(e.target.value)}
            placeholder="Java, Spring Boot, SQL, Git"
          />
          <button
            className="primary-action"
            onClick={analyzeSkillGap}
            disabled={skillGapLoading}
          >
            {skillGapLoading ? "AI is analyzing..." : "Analyze with AI →"}
          </button>
        </div>

        {skillGap && (
          <div className="results-container">
            <div className="match-overview">
              <div>
                <p className="page-label">AI ASSESSMENT</p>
                <h2>{score}%</h2>
                <p>
                  AI has analyzed your current skills against the career
                  requirements for your selected sector.
                </p>
              </div>
              <div className="match-circle">{score}%</div>
            </div>

            {skillGap.skillGapSummary && (
              <div className="ai-section-card">
                <div className="ai-section-header">
                  <span>✦</span>
                  <div>
                    <h3>AI Analysis</h3>
                    <p>Personalized explanation from Ollama</p>
                  </div>
                </div>
                <p className="guidance-result-text">
                  {skillGap.skillGapSummary}
                </p>
              </div>
            )}

            <div className="skill-result-grid">
              <div className="result-card">
                <h3>✓ Skills AI Recognized</h3>
                <div className="skill-list">
                  {matched.length ? matched.map((s, i) => (
                    <span className="skill-tag matched-tag" key={i}>
                      {displayValue(s)}
                    </span>
                  )) : <p>No matched skills returned by AI.</p>}
                </div>
              </div>

              <div className="result-card">
                <h3>+ Skills AI Says You Need</h3>
                <div className="skill-list">
                  {missing.length ? missing.map((s, i) => (
                    <span className="skill-tag missing-tag" key={i}>
                      {displayValue(s)}
                    </span>
                  )) : <p>No additional skills returned by AI.</p>}
                </div>
              </div>
            </div>

            {future.length > 0 && (
              <div className="ai-section-card">
                <div className="ai-section-header">
                  <span>🚀</span>
                  <div>
                    <h3>Future Skills Suggested by AI</h3>
                    <p>Skills that can improve your long-term readiness</p>
                  </div>
                </div>
                <div className="skill-list">
                  {future.map((s, i) => (
                    <span className="skill-tag recommended-tag" key={i}>
                      {displayValue(s)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {roadmap.length > 0 && (
              <div className="ai-section-card">
                <div className="ai-section-header">
                  <span>🧭</span>
                  <div>
                    <h3>AI Learning Roadmap</h3>
                    <p>What the AI recommends you learn next</p>
                  </div>
                </div>
                <div className="learning-plan">
                  {roadmap.map((step, i) => (
                    <div className="learning-step" key={i}>
                      <div className="step-number">{i + 1}</div>
                      <p>{toText(step)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="ai-section-card">
                <div className="ai-section-header">
                  <span>💡</span>
                  <div>
                    <h3>AI Project Ideas</h3>
                    <p>Projects selected for your skill development</p>
                  </div>
                </div>
                <div className="project-grid">
                  {projects.map((project, i) => (
                    <div className="project-card" key={i}>
                      <span>PROJECT {i + 1}</span>
                      <p>{toText(project)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {renderError()}
      </div>
    );
  };

  const renderCareerRecommendations = () => {
    const topCareer = careerResult?.topCareer;
    const recommendations = careerResult?.careerRecommendations || [];
    const learningPlan = careerResult?.learningPlan || [];
    const recommendedSkills = careerResult?.recommendedSkills || [];
    const projectIdeas = careerResult?.projectIdeas || [];
    return <div className="page-content">
      <div className="page-header"><p className="page-label">AI CAREER INTELLIGENCE</p><h1>Career Recommendations</h1><p className="page-description">AI-powered career recommendations based on your skills and profile.</p></div>
      {!careerResult && <div className="skill-input-card"><h2>Find your best career</h2><p>SkillMapAI will compare your skills against suitable career paths.</p><textarea className="skills-textarea" value={skillText} onChange={(e) => updateSkillText(e.target.value)} /><button className="primary-action" onClick={analyzeCareerRecommendations} disabled={careerLoading}>{careerLoading ? "AI is analyzing..." : "Find My Career →"}</button></div>}
      {careerResult && <div className="career-results">
        <div className="ai-summary-card"><p className="page-label">AI SUMMARY</p><h2>Your Career Direction</h2><p>{displayValue(careerResult.careerSummary || "AI analyzed your profile and generated career recommendations.")}</p></div>
        {topCareer && <div className="top-career-card"><div><p className="page-label">TOP CAREER</p><h2>{displayValue(topCareer.careerName)}</h2><p>{displayValue(topCareer.reason)}</p></div><div className="career-score"><strong>{topCareer.matchPercentage ?? 0}%</strong><span>MATCH</span></div></div>}
        {recommendations.length > 0 && <div className="ai-section-card"><div className="ai-section-header"><span>◈</span><div><h3>Career Matches</h3><p>Careers ranked by AI compatibility</p></div></div><div className="career-list">{recommendations.map((career, i) => <div className="career-item" key={i}><div><h3>{displayValue(career.careerName)}</h3><p>{displayValue(career.reason)}</p>{career.missingSkills?.length > 0 && <div className="skill-list">{career.missingSkills.map((s) => <span className="skill-tag missing-tag" key={s}>{displayValue(s)}</span>)}</div>}</div><div className="career-match">{career.matchPercentage ?? 0}%</div></div>)}</div></div>}
        {recommendedSkills.length > 0 && <div className="ai-section-card"><div className="ai-section-header"><span>🧩</span><div><h3>Recommended Skills</h3><p>Skills that can improve your career opportunities</p></div></div><div className="skill-list">{recommendedSkills.map((s, i) => (
  <div className="skill-recommendation" key={i}>
    <span className="skill-tag recommended-tag">
      {displayValue(s)}
    </span>

    {s.description && (
      <p>{displayValue(s.description)}</p>
    )}

    {s.duration && (
      <p>
        <strong>Duration:</strong> {displayValue(s.duration)}
      </p>
    )}
  </div>
))}</div></div>}
        {learningPlan.length > 0 && <div className="ai-section-card"><div className="ai-section-header"><span>🚀</span><div><h3>Learning Roadmap</h3><p>A practical path to improve your skills</p></div></div><div className="learning-plan">{learningPlan.map((s, i) => <div className="learning-step" key={i}><div className="step-number">{i + 1}</div><p>{displayValue(s)}</p></div>)}</div></div>}
        {projectIdeas.length > 0 && <div className="ai-section-card"><div className="ai-section-header"><span>💡</span><div><h3>Project Ideas</h3><p>Build these projects to strengthen your profile</p></div></div><div className="project-grid">{projectIdeas.map((p, i) => <div className="project-card" key={i}><span>PROJECT {i + 1}</span><p>{displayValue(p)}</p></div>)}</div></div>}
      </div>}
      {renderError()}
    </div>;
  };
const renderJobMatching = () => {
  const jobs = Array.isArray(jobResults) ? jobResults : [];

  return (
    <div className="page-content">
      <div className="page-header">
        <p className="page-label">AI JOB INTELLIGENCE</p>

        <h1>Job Matching</h1>

        <p className="page-description">
          Find job opportunities based on your skills and career interests.
        </p>
      </div>

      <div className="profile-section-card">
        <div className="profile-section-title">
          <div className="section-title-icon">💼</div>

          <div>
            <h2>Find Jobs Matching Your Skills</h2>

            <p>
              Use your current skills to find relevant job opportunities.
            </p>
          </div>
        </div>

        <button
          className="primary-action"
          onClick={findJobs}
          disabled={jobLoading}
        >
          {jobLoading ? "Finding Jobs..." : "Find Matching Jobs →"}
        </button>

        <button
          className="linkedin-profile-button"
          onClick={findLinkedInJobs}
        >
          Search Jobs on LinkedIn →
        </button>
      </div>

      {jobs.length > 0 && (
        <div className="ai-section-card">
          <div className="ai-section-header">
            <span>🎯</span>

            <div>
              <h3>Recommended Jobs</h3>
              <p>Job opportunities returned by SkillMapAI</p>
            </div>
          </div>

          <div className="career-list">
            {jobs.map((job, index) => (
              <div className="career-item" key={index}>
                <h3>
                  {job.jobTitle ||
                    job.title ||
                    job.position ||
                    "Job Opportunity"}
                </h3>

                <p>
                  <strong>Company: </strong>
                  {job.companyName ||
                    job.company ||
                    job.organization ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Location: </strong>
                  {job.location || "Not specified"}
                </p>

                {job.description && (
                  <p>{job.description}</p>
                )}

                {(job.applyUrl || job.url || job.link) && (
                  <a
                    href={job.applyUrl || job.url || job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-action"
                  >
                    Apply Now →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {jobs.length === 0 && !jobLoading && (
        <div className="ai-summary-card">
          <h2>No Job Recommendations Yet</h2>

          <p>
            Enter your skills and click "Find Matching Jobs" to load
            job recommendations.
          </p>
        </div>
      )}

      {renderError()}
    </div>
  );
};


  const renderFutureSkills = () => {
    const result = futureSkills || {};
    const recommendations = Array.isArray(result)
      ? result
      : result.futureSkills || result.recommendedSkills || result.skills || [];
    const reasoning =
      result.reasoning ||
      result.explanation ||
      result.summary ||
      result.message ||
      "AI-generated skills that may be useful for your future career growth.";

    return (
      <div className="page-content">
        <div className="page-header">
          <p className="page-label">AI FUTURE SKILLS</p>
          <h1>Future Skills</h1>
          <p className="page-description">
            Discover skills that may help you prepare for upcoming career opportunities.
          </p>
        </div>

        <div className="profile-section-card">
          <div className="profile-section-title">
            <div className="section-title-icon">✦</div>
            <div>
              <h2>Analyze Future Skills</h2>
              <p>Use your current skills to generate AI-based recommendations.</p>
            </div>
          </div>

          <button
            className="primary-action"
            onClick={analyzeFutureSkills}
            disabled={futureLoading}
          >
            {futureLoading ? "Analyzing..." : "Find Future Skills →"}
          </button>
        </div>

        {futureSkills && (
          <div className="ai-section-card">
            <div className="ai-section-header">
              <span>🚀</span>
              <div>
                <h3>Recommended Future Skills</h3>
                <p>AI recommendations based on your current skills</p>
              </div>
            </div>

            <p>{displayValue(reasoning)}</p>

            {recommendations.length > 0 ? (
              <div className="skill-list">
                {recommendations.map((item, index) => {
                  const skill = displayValue(item) || `Future Skill ${index + 1}`;
                  const description =
                    typeof item === "object" ? item.description || item.reason : "";

                  return (
                    <div className="skill-recommendation" key={index}>
                      <span className="skill-tag recommended-tag">{displayValue(skill)}</span>
                      {description && <p>{displayValue(description)}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No future skill recommendations were returned. Try again after checking that Ollama is running.</p>
            )}
          </div>
        )}

        {renderError()}
      </div>
    );
  };


  const practiceResources = (skill) => {
    const value = String(skill || "").toLowerCase();

    if (value.includes("python")) {
      return [
        { name: "HackerRank Python", url: "https://www.hackerrank.com/domains/python" },
        { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
        { name: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/" },
      ];
    }

    if (value.includes("java") || value.includes("c++") || value.includes("c#") || value.includes("javascript") || value.includes("typescript") || value.includes("programming")) {
      return [
        { name: "HackerRank Practice", url: "https://www.hackerrank.com/domains" },
        { name: "LeetCode", url: "https://leetcode.com/problemset/" },
        { name: "Codewars", url: "https://www.codewars.com/" },
      ];
    }

    if (value.includes("sql") || value.includes("database") || value.includes("mysql") || value.includes("postgres")) {
      return [
        { name: "HackerRank SQL", url: "https://www.hackerrank.com/domains/sql" },
        { name: "SQLBolt", url: "https://sqlbolt.com/" },
        { name: "W3Schools SQL", url: "https://www.w3schools.com/sql/" },
      ];
    }

    if (value.includes("html") || value.includes("css") || value.includes("react") || value.includes("web") || value.includes("frontend")) {
      return [
        { name: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/" },
        { name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn" },
        { name: "Frontend Mentor", url: "https://www.frontendmentor.io/" },
      ];
    }

    if (value.includes("cloud") || value.includes("aws") || value.includes("azure") || value.includes("devops") || value.includes("docker") || value.includes("kubernetes")) {
      return [
        { name: "Microsoft Learn", url: "https://learn.microsoft.com/training/" },
        { name: "AWS Skill Builder", url: "https://skillbuilder.aws/" },
        { name: "KodeKloud Practice", url: "https://kodekloud.com/" },
      ];
    }

    if (value.includes("machine learning") || value.includes("data science") || value.includes("artificial intelligence") || value.includes("deep learning")) {
      return [
        { name: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
        { name: "Google Machine Learning", url: "https://developers.google.com/machine-learning" },
        { name: "DataCamp", url: "https://www.datacamp.com/" },
      ];
    }

    if (value.includes("cyber") || value.includes("security") || value.includes("network")) {
      return [
        { name: "TryHackMe", url: "https://tryhackme.com/" },
        { name: "Cisco Skills for All", url: "https://skillsforall.com/" },
        { name: "HackerRank Practice", url: "https://www.hackerrank.com/domains" },
      ];
    }

    if (value.includes("git") || value.includes("github")) {
      return [
        { name: "GitHub Skills", url: "https://skills.github.com/" },
        { name: "Learn Git Branching", url: "https://learngitbranching.js.org/" },
        { name: "Atlassian Git Tutorials", url: "https://www.atlassian.com/git/tutorials" },
      ];
    }

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${skill} practice exercises online`)}`;
    return [
      { name: `Search ${skill} practice`, url: searchUrl },
      { name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/" },
      { name: "W3Schools", url: "https://www.w3schools.com/" },
    ];
  };

  const renderPracticePlatform = () => {
    const missingSkills =
      skillGap?.prioritySkills ||
      skillGap?.missingSkills ||
      skillGap?.skillsToDevelop ||
      [];

    const future = skillGap?.futureSkills || [];
    const rawRequiredSkills = missingSkills.length > 0 ? missingSkills : future;
    const requiredSkills = rawRequiredSkills
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.skillName || item?.skill || item?.name || ""
      )
      .filter(Boolean)
      .filter((skill, index, array) => array.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index);

    return (
      <div className="page-content">
        <div className="page-header">
          <p className="page-label">PRACTICE & DEVELOPMENT</p>
          <h1>Practice Platform</h1>
          <p className="page-description">
            Practice the skills identified by your AI Skill Gap analysis using external learning and coding platforms.
          </p>
        </div>

        {!skillGap && (
          <div className="ai-summary-card">
            <h2>Analyze your skill gap first</h2>
            <p>
              Upload your resume and run Skill Gap Analysis. Your required skills will appear here automatically.
            </p>
            <button className="primary-action" onClick={() => navigateTo("Skill Gap")}>
              Go to Skill Gap Analysis →
            </button>
          </div>
        )}

        {skillGap && requiredSkills.length === 0 && (
          <div className="ai-summary-card">
            <h2>No required skills found yet</h2>
            <p>Run the Skill Gap analysis again or check the AI response for missing skills.</p>
            <button className="primary-action" onClick={() => navigateTo("Skill Gap")}>
              Recheck Skill Gap →
            </button>
          </div>
        )}

        {requiredSkills.length > 0 && (
          <>
            <div className="ai-summary-card">
              <p className="page-label">YOUR LEARNING TARGETS</p>
              <h2>Required Skills to Practice</h2>
              <p>
                These skills were taken from the AI-recommended missing or future skills list.
              </p>
            </div>

            <div className="project-grid">
              {requiredSkills.map((skill, index) => (
                <div className="project-card" key={`${skill}-${index}`} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span>SKILL {index + 1}</span>
                  <h3 style={{ margin: 0 }}>{skill}</h3>
                  <p>Practice exercises, tutorials and challenges for {skill}.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {practiceResources(skill).map((resource) => (
                      <a
                        key={resource.name}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-action"
                        style={{ textDecoration: "none", textAlign: "center" }}
                      >
                        {resource.name} ↗
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {renderError()}
      </div>
    );
  };

 const renderPage = () => {
  switch (activePage) {
    case "Resume Analyzer":
      return renderResumeAnalyzer();

    case "Dashboard":
      return renderDashboard();

    case "Profile":
      return renderProfile();

    case "Skill Gap":
      return renderSkillGap();

    case "Career Recommendations":
      return renderCareerRecommendations();

    case "Job Matching":
      return renderJobMatching();

    case "Future Skills":
      return renderFutureSkills();

    case "Practice Platform":
      return renderPracticePlatform();

    default:
      return renderResumeAnalyzer();
  }
};

  const nav = [
  ["Dashboard", "◉"],
  ["Profile", "◎"],
  ["Resume Analyzer", "📄"],
  ["Skill Gap", "◇"],
  ["Career Recommendations", "◈"],
  ["Job Matching", "⌕"],
  ["Future Skills", "✦"],
  ["Practice Platform", "🧠"],
];

  
if (!userId) {
  const submitSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (
      !signupForm.name.trim() ||
      !signupForm.email.trim() ||
      !signupForm.password ||
      !signupForm.education.trim()
    ) {
      setSignupError("Please fill in all fields.");
      return;
    }

    if (signupForm.password.length < 6) {
      setSignupError("Password must contain at least 6 characters.");
      return;
    }

    await handleSignup(signupForm);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5fa",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#fff",
          borderRadius: "20px",
          padding: "38px",
          boxShadow: "0 18px 50px rgba(20,20,60,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#7046e8",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: "800",
              fontSize: "22px",
            }}
          >
            S
          </div>

          <div>
            <strong style={{ fontSize: "22px" }}>
              SkillMap<span style={{ color: "#7046e8" }}>AI</span>
            </strong>

            <div style={{ color: "#8b8fa3", fontSize: "13px" }}>
              AI Career Intelligence
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setSignupError("");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: authMode === "login" ? "#7046e8" : "#eeeef5",
              color: authMode === "login" ? "#fff" : "#555",
            }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setSignupError("");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: authMode === "signup" ? "#7046e8" : "#eeeef5",
              color: authMode === "signup" ? "#fff" : "#555",
            }}
          >
            Signup
          </button>
        </div>

        {authMode === "login" ? (
          <>
            <p className="page-label">WELCOME BACK</p>

            <h1>Open your career profile</h1>

            <p style={{ color: "#7c8195", lineHeight: 1.6 }}>
              Enter an existing User ID to load your profile.
            </p>

            <input
              id="login-user-id"
              placeholder="Enter User ID e.g. 1"
              inputMode="numeric"
              value={loginUserId}
              onChange={(e) => setLoginUserId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loginAsUser(loginUserId);
                }
              }}
              style={authInputStyle}
            />

            <button
              className="primary-action"
              onClick={() => loginAsUser(loginUserId)}
              style={{
                width: "100%",
                marginTop: "14px",
              }}
            >
              Continue →
            </button>

            {renderError()}

            <p
              style={{
                marginTop: "20px",
                fontSize: "12px",
                color: "#9699aa",
              }}
            >
              Current login uses an existing User ID.
            </p>
          </>
        ) : (
          <>
            <p className="page-label">NEW USER</p>

            <h1>Create your career profile</h1>

            <p style={{ color: "#7c8195", lineHeight: 1.6 }}>
              Create an account to start your personalized career journey.
            </p>

            <form onSubmit={submitSignup}>
              <input
                type="text"
                placeholder="Full Name"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    name: e.target.value,
                  })
                }
                style={authInputStyle}
              />

              <input
                type="email"
                placeholder="Email Address"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    email: e.target.value,
                  })
                }
                style={authInputStyle}
              />

              <input
                type="password"
                placeholder="Password (minimum 6 characters)"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    password: e.target.value,
                  })
                }
                style={authInputStyle}
              />

              <input
                type="text"
                placeholder="Education e.g. B.Tech Computer Science"
                value={signupForm.education}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    education: e.target.value,
                  })
                }
                style={authInputStyle}
              />

              <select
                value={signupForm.sector}
                onChange={(e) =>
                  setSignupForm({
                    ...signupForm,
                    sector: e.target.value,
                  })
                }
                style={authInputStyle}
              >
                <option value="PRIVATE">IT / Private Sector</option>
                <option value="PUBLIC">Government / Public Sector</option>
              </select>

              <button
                type="submit"
                className="primary-action"
                style={{
                  width: "100%",
                  marginTop: "14px",
                }}
              >
                Create Account →
              </button>
            </form>

            {signupError && (
              <div className="error-message">{signupError}</div>
            )}

            {renderError()}
          </>
        )}
      </div>
    </div>
  );
}
  return <div className="app-layout">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">S</div><div><strong>SkillMap</strong><span>AI</span></div></div>
      <div className="sidebar-label">CAREER</div>
      <nav className="sidebar-nav">{nav.map(([name, icon]) => <button key={name} className={activePage === name ? "nav-item active" : "nav-item"} onClick={() => navigateTo(name)}><span>{icon}</span>{name === "Career Recommendations" ? "Careers" : name}</button>)}</nav>
      <div className="sidebar-label">AI TOOLS</div>
      <nav className="sidebar-nav"><button className={activePage === "AI Guidance" ? "nav-item active" : "nav-item"} onClick={() => navigateTo("AI Guidance")}><span>✧</span>AI Guidance</button></nav>
      <div className="sidebar-bottom"><div className="sidebar-ai-status"><span className="status-dot"></span><div><strong>AI Engine</strong><small>Ollama · Online</small></div></div><p>SkillMapAI v1.0</p></div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div><span className="topbar-title">{activePage}</span></div>
        <div className="topbar-right">
          <div className="ai-online"><span></span>AI Online</div>
          <div style={{ position: "relative" }}>
            <button className="user-mini" onClick={() => setShowUserMenu(!showUserMenu)} style={{ border: "none", cursor: "pointer" }} title="Account menu">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </button>
            {showUserMenu && (
              <div style={{ position: "absolute", right: 0, top: "48px", width: "230px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 15px 40px rgba(0,0,0,0.15)", padding: "10px", zIndex: 1000 }}>
                <div style={{ padding: "10px", borderBottom: "1px solid #eee", marginBottom: "5px" }}>
                  <strong>{user.name || `User ${userId}`}</strong>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>User ID: {userId}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
                </div>
                <button onClick={switchUser} style={{ width: "100%", border: "none", background: "transparent", padding: "11px 10px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>👤 Switch User</button>
                <button onClick={logout} style={{ width: "100%", border: "none", background: "transparent", padding: "11px 10px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "#dc2626" }}>🚪 Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>
      {renderPage()}
    </main>
  </div>;
}

export default App;
