import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login1 = ({
    heading,
    logo = {
        url: "#",
        src: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=100&h=100&fit=crop&q=80", // Placeholder tech logo
        alt: "logo",
        title: "Ctrl C Academy",
    },
    buttonText = "Login",
    signupText = "Don't have an account?",
    signupUrl = "/register",
    onSubmit, // Added prop to handle form submission
    email,
    setEmail,
    password,
    setPassword,
    loading
}) => {
    return (
        <section className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl px-8 py-10">
                <div className="flex flex-col items-center gap-y-6 mb-8">
                    {/* Logo */}
                    <a href={logo.url} className="group">
                        <img
                            src="/logo.png"
                            alt="CTRL+C Logo"
                            className="h-16 w-16 object-contain group-hover:scale-105 transition-transform drop-shadow-lg"
                        />
                    </a>
                    {heading && <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{heading}</h1>}
                </div>
                <form onSubmit={onSubmit} className="flex w-full flex-col gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-blue-500"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rounded-xl mt-2"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : buttonText}
                        </Button>
                    </div>
                </form>
                <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 flex justify-center gap-1">
                    <p>{signupText}</p>
                    <a
                        href={signupUrl}
                        className="text-blue-600 dark:text-blue-500 font-semibold hover:underline"
                    >
                        Sign up
                    </a>
                </div>
            </div>
        </section>
    );
};

export { Login1 };
