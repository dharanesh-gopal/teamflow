import {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    FolderKanban,
    Plus,
    Users,
    CheckCircle2,
    Clock3,
    Trash2,
    ArrowUpRight,
} from "lucide-react";

import {
    motion,
} from "framer-motion";

import api from "../api";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const [projects, setProjects] =
        useState([]);

    const [form, setForm] =
        useState({
            name: "",
            description: "",
        });

    const [loading, setLoading] =
        useState(true);

    const [creating, setCreating] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadProjects =
        async () => {
            try {
                setLoading(true);

                const response =
                    await api.get(
                        "/projects"
                    );

                setProjects(
                    response.data.projects
                );
            } catch (error) {
                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to load projects"
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleChange = (
        event
    ) => {
        setForm({
            ...form,
            [event.target.name]:
                event.target.value,
        });
    };

    const createProject =
        async (event) => {
            event.preventDefault();

            try {
                setCreating(true);
                setError("");

                await api.post(
                    "/projects",
                    form
                );

                setForm({
                    name: "",
                    description: "",
                });

                await loadProjects();
            } catch (error) {
                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to create project"
                );
            } finally {
                setCreating(false);
            }
        };

    const deleteProject =
        async (id) => {
            if (
                !window.confirm(
                    "Delete this project?"
                )
            ) {
                return;
            }

            try {
                await api.delete(
                    `/projects/${id}`
                );

                await loadProjects();
            } catch (error) {
                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to delete project"
                );
            }
        };

    const activeProjects =
        projects.filter(
            (p) =>
                p.status ===
                "active"
        ).length;

    const completedProjects =
        projects.filter(
            (p) =>
                p.status ===
                "completed"
        ).length;

    const totalMembers =
        projects.reduce(
            (sum, project) =>
                sum +
                project.members.length,
            0
        );

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="mb-8"
                >
                    <p className="mb-2 text-sm font-medium text-indigo-400">
                        WORKSPACE
                    </p>

                    <h1 className="font-display text-4xl font-bold tracking-tight text-white">
                        Your team
                        <span className="gradient-text">
                            {" "}
                            dashboard
                        </span>
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Organize projects,
                        people and tasks
                        in one place.
                    </p>
                </motion.div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={
                            <FolderKanban
                                size={20}
                            />
                        }
                        label="Total Projects"
                        value={
                            projects.length
                        }
                    />

                    <StatCard
                        icon={
                            <Clock3
                                size={20}
                            />
                        }
                        label="Active Projects"
                        value={
                            activeProjects
                        }
                    />

                    <StatCard
                        icon={
                            <CheckCircle2
                                size={20}
                            />
                        }
                        label="Completed"
                        value={
                            completedProjects
                        }
                    />

                    <StatCard
                        icon={
                            <Users
                                size={20}
                            />
                        }
                        label="Team Members"
                        value={
                            totalMembers
                        }
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                    <motion.section
                        initial={{
                            opacity: 0,
                            x: -20,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        className="glass h-fit rounded-3xl p-6"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                                <Plus
                                    size={20}
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">
                                    New project
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Start something
                                    great
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={
                                createProject
                            }
                            className="space-y-4"
                        >
                            <input
                                name="name"
                                value={
                                    form.name
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Project name"
                                required
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
                            />

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="What are you building?"
                                rows="4"
                                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
                            />

                            <button
                                disabled={
                                    creating
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold shadow-lg shadow-indigo-500/10 transition hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50"
                            >
                                <Plus
                                    size={18}
                                />

                                {creating
                                    ? "Creating..."
                                    : "Create project"}
                            </button>
                        </form>
                    </motion.section>

                    <section>
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-white">
                                    Projects
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Your team's
                                    active work
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {[
                                    1, 2, 3, 4,
                                ].map(
                                    (
                                        item
                                    ) => (
                                        <div
                                            key={
                                                item
                                            }
                                            className="h-52 animate-pulse rounded-3xl bg-white/5"
                                        />
                                    )
                                )}
                            </div>
                        ) : projects.length ===
                            0 ? (
                            <div className="glass rounded-3xl p-12 text-center">
                                <FolderKanban
                                    className="mx-auto mb-4 text-slate-600"
                                    size={
                                        42
                                    }
                                />

                                <h3 className="font-semibold text-white">
                                    No projects
                                    yet
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Create your
                                    first
                                    project to
                                    get
                                    started.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {projects.map(
                                    (
                                        project,
                                        index
                                    ) => (
                                        <motion.article
                                            key={
                                                project._id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 20,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                delay:
                                                    index *
                                                    0.06,
                                            }}
                                            whileHover={{
                                                y: -4,
                                            }}
                                            className="glass group rounded-3xl p-6 transition hover:border-indigo-500/30"
                                        >
                                            <div className="mb-5 flex items-start justify-between">
                                                <div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 text-indigo-400">
                                                    <FolderKanban
                                                        size={
                                                            22
                                                        }
                                                    />
                                                </div>

                                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium capitalize text-emerald-400">
                                                    {
                                                        project.status
                                                    }
                                                </span>
                                            </div>

                                            <h3 className="mb-2 text-lg font-semibold text-white">
                                                {
                                                    project.name
                                                }
                                            </h3>

                                            <p className="mb-5 line-clamp-2 min-h-10 text-sm leading-6 text-slate-400">
                                                {project.description ||
                                                    "No description provided."}
                                            </p>

                                            <div className="mb-5 flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Users
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    {
                                                        project
                                                            .members
                                                            .length
                                                    }{" "}
                                                    members
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/projects/${project._id}`}
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                                                >
                                                    Open
                                                    project

                                                    <ArrowUpRight
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        deleteProject(
                                                            project._id
                                                        )
                                                    }
                                                    className="rounded-xl border border-red-500/10 p-2.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                                >
                                                    <Trash2
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </motion.article>
                                    )
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({
    icon,
    label,
    value,
}) => (
    <motion.div
        whileHover={{
            y: -3,
        }}
        className="glass rounded-2xl p-5"
    >
        <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                {icon}
            </div>
        </div>

        <p className="text-sm text-slate-500">
            {label}
        </p>

        <p className="mt-1 font-display text-3xl font-bold text-white">
            {value}
        </p>
    </motion.div>
);

export default Dashboard;