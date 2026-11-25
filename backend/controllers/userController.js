const User = require("../models/User");

const levelToScore = (level) => {
    if (level === "Advanced") return 90;
    if (level === "Intermediate") return 65;
    return 40;
};

// GET /api/user/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, education, targetCareer } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { name, email, education, targetCareer },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// POST /api/user/skills
exports.addSkill = async (req, res) => {
    try {
        const { name, level } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Skill name is required." });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const skillLevel = level || "Beginner";
        user.skills.push({
            name: name.trim(),
            level: skillLevel,
            score: levelToScore(skillLevel)
        });
        user.learningHours += 4;
        await user.save();

        res.status(201).json({
            message: "Skill added",
            skills: user.skills,
            learningHours: user.learningHours
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// DELETE /api/user/skills/:skillId
exports.deleteSkill = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.skills = user.skills.filter(
            (skill) => skill._id.toString() !== req.params.skillId
        );
        await user.save();

        res.json({
            message: "Skill removed",
            skills: user.skills,
            learningHours: user.learningHours
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
