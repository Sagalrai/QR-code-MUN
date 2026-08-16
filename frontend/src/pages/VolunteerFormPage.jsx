import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const emptyState = {
    name: "",
    photo: "",
    phone: "",
    email: "",
    role: "",
    team: "",
    status: "ACTIVE",
};

export default function VolunteerFormPage() {
    const navigate = useNavigate();
    const { volunteerId } = useParams();
    const [form, setForm] = useState(emptyState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!volunteerId) return;

        async function fetchVolunteer() {
            try {
                const response = await api.get(`/api/volunteers/${volunteerId}`);
                setForm({
                    name: response.data.name || "",
                    photo: response.data.photo || "",
                    phone: response.data.phone || "",
                    email: response.data.email || "",
                    role: response.data.role || "",
                    team: response.data.team || "",
                    status: response.data.status || "ACTIVE",
                });
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load volunteer");
            }
        }

        fetchVolunteer();
    }, [volunteerId]);

    const onChange = event => {
        setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    };

    const onSubmit = async event => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (volunteerId) {
                await api.put(`/api/volunteers/${volunteerId}`, form);
            } else {
                await api.post("/api/volunteers", form);
            }
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save volunteer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-3 text-slate-100 sm:p-4 md:p-8">
            <div className="mx-auto max-w-[430px] sm:max-w-4xl">
                <div className="glass-panel animate-rise rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-6 md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                                Volunteer
                            </p>
                            <h1 className="mt-2 text-3xl font-extrabold text-white">
                                {volunteerId ? "Edit volunteer" : "Create volunteer"}
                            </h1>
                        </div>
                        <Link
                            to="/"
                            className="action-button border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500"
                        >
                            Back to dashboard
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                required
                                placeholder="Alex Johnson"
                                className="input-shell"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">Photo URL</label>
                            <input
                                name="photo"
                                value={form.photo}
                                onChange={onChange}
                                className="input-shell"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Phone</label>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={onChange}
                                className="input-shell"
                                placeholder="+1 234 567 890"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={onChange}
                                className="input-shell"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Role</label>
                            <input
                                name="role"
                                value={form.role}
                                onChange={onChange}
                                className="input-shell"
                                placeholder="Crew Lead"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Team</label>
                            <input
                                name="team"
                                value={form.team}
                                onChange={onChange}
                                className="input-shell"
                                placeholder="Operations"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-300">Status</label>
                            <select name="status" value={form.status} onChange={onChange} className="input-shell">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 flex flex-col-reverse justify-end gap-3 pt-1 sm:pt-2 sm:flex-row">
                            <Link
                                to="/"
                                className="action-button border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="action-button bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-950 shadow-lg shadow-slate-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Saving..." : volunteerId ? "Update volunteer" : "Create volunteer"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
