const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    getProfile,
    updateProfile,
    addSkill,
    deleteSkill
} = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/skills", protect, addSkill);
router.delete("/skills/:skillId", protect, deleteSkill);

module.exports = router;
