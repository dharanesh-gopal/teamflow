const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper: verify user is a member of the project
const isMember = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) return null;
    const member = project.members.some(
        (m) => m.toString() === userId.toString()
    );
    return member ? project : false;
};

const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, assignee, priority, dueDate } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Task title is required",
            });
        }

        const project = await isMember(projectId, req.user._id);
        if (project === null) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        if (project === false) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this project",
            });
        }

        const task = await Task.create({
            title,
            description,
            project: projectId,
            assignee: assignee || null,
            createdBy: req.user._id,
            priority,
            dueDate: dueDate || null,
        });

        const populated = await Task.findById(task._id)
            .populate("assignee", "name email")
            .populate("createdBy", "name email");

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: populated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message,
        });
    }
};

const getTasks = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await isMember(projectId, req.user._id);
        if (project === null) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        if (project === false) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this project",
            });
        }

        const tasks = await Task.find({ project: projectId })
            .populate("assignee", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            tasks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message,
        });
    }
};

const getTask = async (req, res) => {
    try {
        const { projectId, taskId } = req.params;

        const project = await isMember(projectId, req.user._id);
        if (project === null) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        if (project === false) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this project",
            });
        }

        const task = await Task.findOne({
            _id: taskId,
            project: projectId,
        })
            .populate("assignee", "name email")
            .populate("createdBy", "name email");

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        res.json({
            success: true,
            task,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch task",
            error: error.message,
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { projectId, taskId } = req.params;

        const project = await isMember(projectId, req.user._id);
        if (project === null) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        if (project === false) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this project",
            });
        }

        const task = await Task.findOne({
            _id: taskId,
            project: projectId,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const { title, description, assignee, status, priority, dueDate } =
            req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (assignee !== undefined) task.assignee = assignee || null;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate || null;

        await task.save();

        const updated = await Task.findById(task._id)
            .populate("assignee", "name email")
            .populate("createdBy", "name email");

        res.json({
            success: true,
            message: "Task updated successfully",
            task: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message,
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { projectId, taskId } = req.params;

        const project = await isMember(projectId, req.user._id);
        if (project === null) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        if (project === false) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this project",
            });
        }

        const task = await Task.findOne({
            _id: taskId,
            project: projectId,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await task.deleteOne();

        res.json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message,
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
};
