import {
    LogOut,
    Rocket,
} from "lucide-react";

import {
    motion,
} from "framer-motion";

import {
    useAuth,
} from "../context/AuthContext";

const Navbar = () => {
    const {
        user,
        logout,
    } = useAuth();

    return (
        <motion.header
            initial={{
                y: -20,
                opacity: 0,
            }}
            animate={{
                y: 0,
                opacity: 1,
            }}
            className="sticky top-0 z-50 border-b border-white/5 bg-[#050816]/80 backdrop-blur-xl"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Rocket
                            size={20}
                        />
                    </div>

                    <div>
                        <h1 className="font-display text-lg font-bold">
                            Team
                            <span className="gradient-text">
                                Flow
                            </span>
                        </h1>

                        <p className="hidden text-xs text-slate-500 sm:block">
                            Team workspace
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-medium text-white">
                            {user?.name}
                        </p>

                        <p className="text-xs text-slate-500">
                            {user?.email}
                        </p>
                    </div>

                    <button
                        onClick={
                            logout
                        }
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <LogOut
                            size={16}
                        />

                        <span className="hidden sm:block">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;