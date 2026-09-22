const Task = require("../models/Task");
const Project = require("../models/Project");

// Helper: verify user is a member of the project
const isMember = async (projectId, userId) => {
    try {
        const project = await Project.findById(projectId);
        if (!project) return null;
        const member = project.members.some(
            (m) => m.toString() === userId.toString()
        );
        return member ? project : false;
    } catch (err) {
        return null;
    }
};

const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, assignee, assignedTo, priority, dueDate } = req.body;

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

        const targetAssignee = assignedTo || assignee || null;
        if (targetAssignee) {
            const isAssigneeMember = project.members.some(
                (m) => m.toString() === targetAssignee.toString()
            );
            if (!isAssigneeMember) {
                return res.status(400).json({
                    success: false,
                    message: "Assigned user must belong to the project",
                });
            }
        }

        const task = await Task.create({
            title,
            description,
            project: projectId,
            assignee: targetAssignee,
            assignedTo: targetAssignee,
            createdBy: req.user._id,
            priority: priority || "medium",
            dueDate: dueDate || null,
        });

        const populated = await Task.findById(task._id)
            .populate("assignee", "name email")
            .populate("assignedTo", "name email")
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
            .populate("assignedTo", "name email")
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
        const taskId = req.params.taskId || req.params.id;
        const { projectId } = req.params;

        let task;
        if (projectId) {
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
            task = await Task.findOne({
                _id: taskId,
                project: projectId,
            });
        } else {
            task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found",
                });
            }
            const project = await isMember(task.project, req.user._id);
            if (!project) {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this project",
                });
            }
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const populated = await Task.findById(task._id)
            .populate("assignee", "name email")
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        res.json({
            success: true,
            task: populated,
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
        const taskId = req.params.taskId || req.params.id;
        const { projectId } = req.params;

        let task;
        let project;
        if (projectId) {
            project = await isMember(projectId, req.user._id);
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
            task = await Task.findOne({
                _id: taskId,
                project: projectId,
            });
        } else {
            task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found",
                });
            }
            project = await isMember(task.project, req.user._id);
            if (!project) {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this project",
                });
            }
        }

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const { title, description, assignee, assignedTo, status, priority, dueDate } =
            req.body;

        const targetAssignee = assignedTo !== undefined ? assignedTo : assignee;
        if (targetAssignee) {
            const isAssigneeMember = project.members.some(
                (m) => m.toString() === targetAssignee.toString()
            );
            if (!isAssigneeMember) {
                return res.status(400).json({
                    success: false,
                    message: "Assigned user must belong to the project",
                });
            }
        }

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (targetAssignee !== undefined) {
            task.assignee = targetAssignee || null;
            task.assignedTo = targetAssignee || null;
        }
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate || null;

        await task.save();

        const updated = await Task.findById(task._id)
            .populate("assignee", "name email")
            .populate("assignedTo", "name email")
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
        const taskId = req.params.taskId || req.params.id;
        const { projectId } = req.params;

        let task;
        if (projectId) {
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
            task = await Task.findOne({
                _id: taskId,
                project: projectId,
            });
        } else {
            task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found",
                });
            }
            const project = await isMember(task.project, req.user._id);
            if (!project) {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this project",
                });
            }
        }

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
