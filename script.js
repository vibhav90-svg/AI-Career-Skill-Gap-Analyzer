
// Handle sidebar navigation
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-section");

function showPage(pageId) {
    pages.forEach(page => {
        page.classList.toggle("hidden", page.id !== pageId);
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageId
        );
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        showPage(this.dataset.page);
    });
});

// Handle buttons that navigate to another page
document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.goto);
    });
});

document.getElementById("analyzeBtn").addEventListener("click", () => {
    showPage("skills");
});

document.getElementById("helpBtn").addEventListener("click", () => {
    showPage("assistant");
});

// Handle profile form
document.getElementById("profileForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value;

    if (name.trim() === "") {
        alert("Please enter your name.");
        return;
    }

    document.querySelector(".sidebar-user h4").textContent = name;

    alert("Profile updated successfully!");
});

// Handle skill form
document.getElementById("skillForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const skillName = document.getElementById("skillName").value.trim();
    const skillLevel = document.getElementById("skillLevel").value;

    if (skillName === "") return;

    const skillTag = document.createElement("div");
    skillTag.className = "skill-tag";
    skillTag.textContent = skillName + " - " + skillLevel;

    document.getElementById("skillList").appendChild(skillTag);

    this.reset();
});

// Handle AI assistant demo chat
document.getElementById("chatForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (!message) return;

    const chatMessages = document.getElementById("chatMessages");

    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;

    chatMessages.appendChild(userMessage);

    const botMessage = document.createElement("div");
    botMessage.className = "bot-message";
    botMessage.textContent =
        "This is a frontend demo. Connect an AI API through your backend to generate personalized career guidance.";

    chatMessages.appendChild(botMessage);

    input.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

