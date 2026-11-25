const User = require("../models/User");

const careerRequirements = {
    "Data Scientist": ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
    "Data Analyst": ["SQL", "Excel", "Data Visualization", "Python", "Statistics"],
    "Machine Learning Engineer": ["Python", "Machine Learning", "Deep Learning", "Docker", "MLOps"],
    "AI Engineer": ["Python", "Deep Learning", "NLP", "LLMs", "APIs"]
};

// POST /api/assistant/chat
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message cannot be empty." });
        }

        const user = await User.findById(req.userId).select("-password");
        const target = user?.targetCareer || "Data Scientist";
        const userSkillNames = (user?.skills || []).map((s) => s.name.toLowerCase());
        const required = careerRequirements[target] || careerRequirements["Data Scientist"];
        const missing = required.filter((reqSkill) => !userSkillNames.includes(reqSkill.toLowerCase()));

        const text = message.toLowerCase();
        let reply = "";

        if (text.includes("gap") || text.includes("missing") || text.includes("learn")) {
            reply = missing.length
                ? `For your target role (${target}), you should focus next on: ${missing.join(", ")}.`
                : `Great work! You already cover all core skills for ${target}. Focus on building 2-3 deployed portfolio projects.`;
        } else if (text.includes("roadmap") || text.includes("plan")) {
            reply = `Recommended path for ${target}: 1) Strengthen ${required[0]} & ${required[1]}, 2) Master ${required[2]}, 3) Build an end-to-end project using ${required.slice(0, 3).join(", ")}.`;
        } else if (text.includes("job") || text.includes("resume") || text.includes("interview")) {
            reply = `You currently have ${userSkillNames.length} skills listed. Highlight measurable outcomes on your resume and practice interview questions around ${required.slice(0, 3).join(", ")}.`;
        } else {
            reply = `Hi ${user?.name || "there"}! Based on your target career (${target}), you have ${userSkillNames.length} skills recorded. ${
                missing.length
                    ? `Your top skill gaps are: ${missing.slice(0, 3).join(", ")}.`
                    : "Your core skill stack looks solid!"
            } Ask me about your "skill gaps", "roadmap", or "interview" tips.`;
        }

        res.json({ reply });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
