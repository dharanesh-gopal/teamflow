const express = require("express");

const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Day 4 Spec routes
router.post("/project/:projectId", createTask);
router.get("/project/:projectId", getTasks);
router.get("/:id", getTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// Scoped routes used by frontend client
router.post("/:projectId/tasks", createTask);
router.get("/:projectId/tasks", getTasks);
router.get("/:projectId/tasks/:taskId", getTask);
router.put("/:projectId/tasks/:taskId", updateTask);
router.delete("/:projectId/tasks/:taskId", deleteTask);

module.exports = router;
