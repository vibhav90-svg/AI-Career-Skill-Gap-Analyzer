const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner"
    },
    score: {
        type: Number,
        default: 40
    }
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        education: {
            type: String,
            default: "B.Tech CSE - Data Science & AI"
        },
        targetCareer: {
            type: String,
            default: "Data Scientist"
        },
        learningHours: {
            type: Number,
            default: 12
        },
        skills: [skillSchema]
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
