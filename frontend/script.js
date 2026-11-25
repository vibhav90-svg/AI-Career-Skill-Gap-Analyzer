const API_URL = "http://localhost:5000/api";
let isRegisterMode = false;

const authScreen = document.getElementById("authScreen");
const appContainer = document.querySelector(".app-container");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const nameGroup = document.getElementById("nameGroup");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authError = document.getElementById("authError");

const fillClasses = ["purple-fill", "blue-fill", "pink-fill", "green-fill", "orange-fill"];

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function setAuthMode(registerMode) {
    isRegisterMode = registerMode;
    loginTab.classList.toggle("active", !registerMode);
    registerTab.classList.toggle("active", registerMode);
    nameGroup.classList.toggle("hidden", !registerMode);
    authName.required = registerMode;
    authSubmitBtn.textContent = registerMode ? "Create Account →" : "Login to Dashboard →";
    authError.classList.add("hidden");
}

loginTab.addEventListener("click", () => setAuthMode(false));
registerTab.addEventListener("click", () => setAuthMode(true));

function renderSkillsAndDashboard(skills = [], learningHours = 12) {
    const skillList = document.getElementById("skillList");
    const dashboardSkillBars = document.getElementById("dashboardSkillBars");
    const totalSkillsCount = document.getElementById("totalSkillsCount");
    const learningHoursCount = document.getElementById("learningHoursCount");
    const readinessStat = document.getElementById("readinessStat");
    const readinessCircleText = document.getElementById("readinessCircleText");
    const readinessCircle = document.getElementById("readinessCircle");

    skillList.innerHTML = "";
    dashboardSkillBars.innerHTML = "";

    totalSkillsCount.textContent = String(skills.length).padStart(2, "0");
    learningHoursCount.textContent = `${learningHours}h`;

    // Calculate readiness percentage from average skill score + count bonus
    let readiness = 0;
    if (skills.length > 0) {
        const avgScore = skills.reduce((sum, s) => sum + (s.score || 40), 0) / skills.length;
        const countBonus = Math.min(skills.length * 4, 20);
        readiness = Math.min(Math.round(avgScore * 0.8 + countBonus), 100);
    }

    readinessStat.textContent = `${readiness}%`;
    readinessCircleText.textContent = `${readiness}%`;
    readinessCircle.style.background = `conic-gradient(#9466ff 0% ${readiness}%, #293148 ${readiness}% 100%)`;

    if (skills.length === 0) {
        dashboardSkillBars.innerHTML = `<p style="color: var(--muted); font-size: 12px;">No skills added yet. Go to Skill Analyzer to add your skills.</p>`;
    }

    skills.forEach((skill, idx) => {
        const score = skill.score || (skill.level === "Advanced" ? 90 : skill.level === "Intermediate" ? 65 : 40);

        // 1. Skill Analyzer Tag
        const skillTag = document.createElement("div");
        skillTag.className = "skill-tag";

        const label = document.createElement("span");
        label.textContent = `${skill.name} - ${skill.level}`;
        skillTag.appendChild(label);

        if (skill._id) {
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "skill-delete-btn";
            delBtn.title = "Remove skill";
            delBtn.textContent = "×";
            delBtn.addEventListener("click", () => deleteSkill(skill._id));
            skillTag.appendChild(delBtn);
        }
        skillList.appendChild(skillTag);

        // 2. Dashboard Progress Bar (top 5 skills)
        if (idx < 5) {
            const fillClass = fillClasses[idx % fillClasses.length];
            const item = document.createElement("div");
            item.className = "skill-item";
            item.innerHTML = `
                <div class="skill-info">
                    <span>${skill.name}</span><span>${score}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill ${fillClass}" style="width:${score}%"></div>
                </div>
            `;
            dashboardSkillBars.appendChild(item);
        }
    });
}

function loadUserIntoUI(user) {
    const initials = (user.name || "U")
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    document.querySelector(".sidebar-user h4").textContent = user.name || "Student Profile";
    document.getElementById("sidebarRole").textContent = user.targetCareer || "Student";
    document.querySelectorAll(".avatar").forEach((el) => (el.textContent = initials));

    document.getElementById("studentName").value = user.name || "";
    document.getElementById("studentEmail").value = user.email || "";
    document.getElementById("studentEducation").value = user.education || "";
    if (user.targetCareer) {
        document.getElementById("targetCareer").value = user.targetCareer;
    }

    renderSkillsAndDashboard(user.skills || [], user.learningHours || 12);
}

// Login & Register Submit
document.getElementById("authForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    authError.classList.add("hidden");

    const endpoint = isRegisterMode ? "/auth/register" : "/auth/login";
    const payload = isRegisterMode
        ? {
              name: authName.value.trim(),
              email: authEmail.value.trim(),
              password: authPassword.value
          }
        : {
              email: authEmail.value.trim(),
              password: authPassword.value
          };

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
            authError.textContent = data.message || "Authentication failed.";
            authError.classList.remove("hidden");
            return;
        }

        localStorage.setItem("token", data.token);
        loadUserIntoUI(data.user);
        authScreen.classList.add("hidden");
        appContainer.classList.remove("hidden");
        this.reset();
    } catch (err) {
        authError.textContent = "Cannot connect to server. Start Express with 'npm start' inside backend/.";
        authError.classList.remove("hidden");
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    appContainer.classList.add("hidden");
    authScreen.classList.remove("hidden");
    setAuthMode(false);
});

// Check JWT session on load
async function checkAuthSession() {
    const token = localStorage.getItem("token");
    if (!token) {
        appContainer.classList.add("hidden");
        authScreen.classList.remove("hidden");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Session expired");

        const user = await res.json();
        loadUserIntoUI(user);
        authScreen.classList.add("hidden");
        appContainer.classList.remove("hidden");
    } catch (err) {
        localStorage.removeItem("token");
        appContainer.classList.add("hidden");
        authScreen.classList.remove("hidden");
    }
}

checkAuthSession();

// ---------------- NAVIGATION ----------------

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-section");

const pageTitles = {
    dashboard: "Dashboard",
    profile: "My Profile",
    skills: "Skill Analyzer",
    jobs: "Job Matches",
    roadmap: "Learning Roadmap",
    assistant: "AI Assistant"
};

function showPage(pageId) {
    pages.forEach((page) => {
        page.classList.toggle("hidden", page.id !== pageId);
    });

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.page === pageId);
    });

    const title = pageTitles[pageId] || "Dashboard";
    document.getElementById("breadcrumbText").textContent = `Pages / ${title}`;
    document.getElementById("topbarTitle").textContent = title;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        showPage(this.dataset.page);
    });
});

document.querySelectorAll("[data-goto]").forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.goto));
});

document.getElementById("analyzeBtn").addEventListener("click", () => showPage("skills"));
document.getElementById("helpBtn").addEventListener("click", () => showPage("assistant"));

// ---------------- PROFILE & SKILLS API ----------------

document.getElementById("profileForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const education = document.getElementById("studentEducation").value.trim();
    const targetCareer = document.getElementById("targetCareer").value;

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/user/profile`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, email, education, targetCareer })
        });

        const data = await res.json();
        if (res.ok) {
            loadUserIntoUI(data.user);
            alert("Profile updated and saved to MongoDB!");
        } else {
            alert(data.message || "Failed to update profile.");
        }
    } catch (err) {
        alert("Server error while updating profile.");
    }
});

document.getElementById("skillForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("skillName").value.trim();
    const level = document.getElementById("skillLevel").value;

    if (!name) return;

    try {
        const res = await fetch(`${API_URL}/user/skills`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, level })
        });

        const data = await res.json();
        if (res.ok) {
            renderSkillsAndDashboard(data.skills, data.learningHours);
            this.reset();
        } else {
            alert(data.message || "Failed to add skill.");
        }
    } catch (err) {
        alert("Server error while adding skill.");
    }
});

async function deleteSkill(skillId) {
    try {
        const res = await fetch(`${API_URL}/user/skills/${skillId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        const data = await res.json();
        if (res.ok) {
            renderSkillsAndDashboard(data.skills, data.learningHours);
        } else {
            alert(data.message || "Failed to remove skill.");
        }
    } catch (err) {
        alert("Server error while removing skill.");
    }
}

// ---------------- AI ASSISTANT API ----------------

document.getElementById("chatForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const input = document.getElementById("chatInput");
    const message = input.value.trim();
    if (!message) return;

    const chatMessages = document.getElementById("chatMessages");

    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);

    input.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const res = await fetch(`${API_URL}/assistant/chat`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ message })
        });

        const data = await res.json();
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.textContent = res.ok ? data.reply : (data.message || "Unable to respond right now.");
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (err) {
        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.textContent = "Server error. Make sure the Express backend is running.";
        chatMessages.appendChild(botMessage);
    }
});
