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
    User,
} from "lucide-react";

import {
    motion,
} from "framer-motion";

import {
    useAuth,
} from "../context/AuthContext";

const Register = () => {
    const navigate =
        useNavigate();

    const { register } =
        useAuth();

    const [form, setForm] =
        useState({
            name: "",
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
                await register(
                    form.name,
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
                    "Registration failed"
                );
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
            <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

            <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />

            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.96,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                className="glass relative w-full max-w-md rounded-3xl p-8"
            >
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600">
                        <Rocket size={28} />
                    </div>

                    <h1 className="font-display text-3xl font-bold">
                        Join Team
                        <span className="gradient-text">
                            Flow
                        </span>
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Start collaborating
                        with your team.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-4"
                >
                    <div className="relative">
                        <User
                            className="absolute left-3 top-3.5 text-slate-500"
                            size={18}
                        />

                        <input
                            name="name"
                            placeholder="Full name"
                            value={
                                form.name
                            }
                            onChange={
                                handleChange
                            }
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-400"
                        />
                    </div>

                    <div className="relative">
                        <Mail
                            className="absolute left-3 top-3.5 text-slate-500"
                            size={18}
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={
                                form.email
                            }
                            onChange={
                                handleChange
                            }
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-400"
                        />
                    </div>

                    <div className="relative">
                        <LockKeyhole
                            className="absolute left-3 top-3.5 text-slate-500"
                            size={18}
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Create password"
                            value={
                                form.password
                            }
                            onChange={
                                handleChange
                            }
                            minLength={6}
                            required
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none focus:border-indigo-400"
                        />
                    </div>

                    <motion.button
                        whileHover={{
                            scale: 1.01,
                        }}
                        whileTap={{
                            scale: 0.98,
                        }}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold shadow-lg disabled:opacity-50"
                    >
                        {loading
                            ? "Creating..."
                            : "Create account"}

                        {!loading && (
                            <ArrowRight
                                size={18}
                            />
                        )}
                    </motion.button>
                </form>

                <p className="mt-7 text-center text-sm text-slate-400">
                    Already registered?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-400 hover:text-indigo-300"
                    >
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;