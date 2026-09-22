const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (
    req,
    res
) => {
    try {
        const {
            name,
            description,
        } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Project name is required",
            });
        }

        const project =
            await Project.create({
                name,
                description,
                owner: req.user._id,
                members: [
                    req.user._id,
                ],
            });

        const populated =
            await Project.findById(
                project._id
            )
                .populate(
                    "owner",
                    "name email"
                )
                .populate(
                    "members",
                    "name email"
                );

        res.status(201).json({
            success: true,
            message:
                "Project created successfully",
            project: populated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                "Failed to create project",
            error: error.message,
        });
    }
};

const getProjects = async (
    req,
    res
) => {
    try {
        const projects =
            await Project.find({
                $or: [
                    {
                        owner: req.user._id,
                    },
                    {
                        members:
                            req.user._id,
                    },
                ],
            })
                .populate(
                    "owner",
                    "name email"
                )
                .populate(
                    "members",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                });

        res.json({
            success: true,
            projects,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                "Failed to fetch projects",
            error: error.message,
        });
    }
};

const getProject = async (
    req,
    res
) => {
    try {
        const project =
            await Project.findById(
                req.params.id
            )
                .populate(
                    "owner",
                    "name email"
                )
                .populate(
                    "members",
                    "name email"
                );

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found",
            });
        }

        const isMember =
            project.members.some(
                (member) =>
                    member._id.toString() ===
                    req.user._id.toString()
            );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not a project member",
            });
        }

        res.json({
            success: true,
            project,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                "Failed to fetch project",
            error: error.message,
        });
    }
};

const updateProject = async (
    req,
    res
) => {
    try {
        const project =
            await Project.findById(
                req.params.id
            );

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found",
            });
        }

        if (
            project.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the owner can update this project",
            });
        }

        const {
            name,
            description,
            status,
        } = req.body;

        if (name !== undefined)
            project.name = name;

        if (
            description !== undefined
        )
            project.description =
                description;

        if (status !== undefined)
            project.status = status;

        await project.save();

        res.json({
            success: true,
            message:
                "Project updated successfully",
            project,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                "Failed to update project",
            error: error.message,
        });
    }
};

const deleteProject = async (
    req,
    res
) => {
    try {
        const project =
            await Project.findById(
                req.params.id
            );

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found",
            });
        }

        if (
            project.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the owner can delete this project",
            });
        }

        await project.deleteOne();

        res.json({
            success: true,
            message:
                "Project deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                "Failed to delete project",
            error: error.message,
        });
    }
};

const addMember = async (
    req,
    res
) => {
    try {
        const project =
            await Project.findById(
                req.params.id
            );

        if (!project) {
            return res.status(404).json({
                success: false,
                message:
                    "Project not found",
            });
        }

        if (
            project.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the project owner can add members",
            });
        }

        const { email } =
            req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Member email is required",
            });
        }

        const user =
            await User.findOne({
                email: email.toLowerCase(),
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }

        const exists =
            project.members.some(
                (member) =>
                    member.toString() ===
                    user._id.toString()
            );

        if (exists) {
            return res.status(409).json({
                success: false,
                message:
                    "User is already a member",
            });
        }

        project.members.push(
            user._id
        );

        await project.save();

        const updated =
            await Project.findById(
                project._id
            )
                .populate(
                    "owner",
                    "name email"
                )
                .populate(
                    "members",
                    "name email"
                );

        res.json({
            success: true,
            message:
                "Member added successfully",
            project: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message:
                "Failed to add member",
            error: error.message,
        });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    addMember,
};