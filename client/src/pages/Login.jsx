import {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    ArrowRight,
    LockKeyhole,
    Mail,
    Rocket,
} from "lucide-react";

import {
    motion,
} from "framer-motion";

import {
    useAuth,
} from "../context/AuthContext";

const Login = () => {
    const navigate =
        useNavigate();

    const { login } =
        useAuth();

    const [form, setForm] =
        useState({
            email: "",
            password: "",
        });

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleChange = (
        event
    ) => {
        setForm({
            ...form,
            [event.target.name]:
                event.target.value,
        });
    };

    const handleSubmit =
        async (event) => {
            event.preventDefault();

            setError("");
            setLoading(true);

            try {
                await login(
                    form.email,
                    form.password
                );

                navigate(
                    "/dashboard"
                );
            } catch (error) {
                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Unable to login"
                );
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
            <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />

            <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

            <motion.div
                initial={{
                    opacity: 0,
                    y: 30,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                }}
                className="glass relative w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                        <Rocket size={28} />
                    </div>

                    <h1 className="font-display text-3xl font-bold">
                        Team<span className="gradient-text">Flow</span>
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Manage your team.
                        Ship faster.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Email
                        </label>

                        <div className="relative">
                            <Mail
                                className="absolute left-3 top-3.5 text-slate-500"
                                size={18}
                            />

                            <input
                                type="email"
                                name="email"
                                value={
                                    form.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Password
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                className="absolute left-3 top-3.5 text-slate-500"
                                size={18}
                            />

                            <input
                                type="password"
                                name="password"
                                value={
                                    form.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="••••••••"
                                required
                                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{
                            scale: 1.01,
                        }}
                        whileTap={{
                            scale: 0.98,
                        }}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50"
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}

                        {!loading && (
                            <ArrowRight
                                size={18}
                            />
                        )}
                    </motion.button>
                </form>

                <p className="mt-7 text-center text-sm text-slate-400">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-medium text-indigo-400 hover:text-indigo-300"
                    >
                        Create account
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;