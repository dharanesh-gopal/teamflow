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

// All task routes are scoped under a project
router.post("/:projectId/tasks", createTask);
router.get("/:projectId/tasks", getTasks);
router.get("/:projectId/tasks/:taskId", getTask);
router.put("/:projectId/tasks/:taskId", updateTask);
router.delete("/:projectId/tasks/:taskId", deleteTask);

module.exports = router;