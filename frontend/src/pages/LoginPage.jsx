import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setToken } from "../services/auth";

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = event => {
        setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    };

    const onSubmit = async event => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", form);
            setToken(response.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 px-3 py-4 text-slate-100 sm:px-4 md:px-8 md:py-8">
            <div className="bg-grid absolute inset-0 opacity-40" />
            <div className="animate-float absolute -left-10 top-16 h-40 w-40 rounded-full bg-stone-300/10 blur-3xl" />
            <div className="animate-pulse-soft absolute bottom-10 right-14 h-52 w-52 rounded-full bg-slate-500/10 blur-3xl" />

            <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-[430px] items-center justify-center sm:max-w-[460px] lg:max-w-6xl">
                <div className="grid w-full overflow-hidden rounded-[1.7rem] border border-slate-800/80 bg-slate-950/60 shadow-[0_28px_70px_rgba(2,6,23,0.7)] backdrop-blur-xl lg:max-w-6xl lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[2rem]">
                    <div className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 lg:flex">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.14),_transparent_35%)]" />
                        <div className="relative">
                            <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-slate-600/70 bg-slate-800/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200">
                                Event Ops
                            </div>
                            <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                                Volunteer QR Management System
                            </h1>
                            <p className="mt-4 max-w-md text-base text-slate-300">
                                Manage volunteers, track event staff, and share access with a clean operational
                                workflow.
                            </p>
                        </div>

                        <div className="relative grid gap-4 sm:grid-cols-3">
                            {[
                                { label: "Volunteers", value: "120+" },
                                { label: "Teams", value: "08" },
                                { label: "Live", value: "24/7" },
                            ].map(item => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 backdrop-blur-sm"
                                >
                                    <div className="text-2xl font-extrabold text-slate-50">{item.value}</div>
                                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                        {item.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
                        <div className="w-full max-w-md animate-rise">
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 text-xl font-extrabold text-slate-950 shadow-lg shadow-slate-500/10">
                                    V
                                </div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
                                    Welcome back
                                </p>
                                <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">Sign in</h2>
                                <p className="mt-2 text-sm text-slate-400">Access the volunteer dashboard</p>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">Username</label>
                                    <input
                                        name="username"
                                        value={form.username}
                                        onChange={onChange}
                                        className="input-shell"
                                        placeholder="admin"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={onChange}
                                        className="input-shell"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="action-button w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 px-4 py-3.5 font-bold text-slate-950 shadow-lg shadow-slate-600/10 hover:shadow-slate-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Signing in..." : "Login to dashboard"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
