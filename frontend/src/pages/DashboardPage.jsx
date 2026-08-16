import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { removeToken } from "../services/auth";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    const fetchVolunteers = async () => {
        try {
            const response = await api.get("/api/volunteers");
            setVolunteers(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const filtered = useMemo(() => {
        return volunteers.filter(volunteer => {
            const matchesSearch =
                !search ||
                `${volunteer.name} ${volunteer.volunteerId} ${volunteer.role} ${volunteer.team}`
                    .toLowerCase()
                    .includes(search.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || volunteer.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [volunteers, search, statusFilter]);

    const summary = useMemo(
        () => ({
            total: volunteers.length,
            active: volunteers.filter(item => item.status === "ACTIVE").length,
            inactive: volunteers.filter(item => item.status === "INACTIVE").length,
            suspended: volunteers.filter(item => item.status === "SUSPENDED").length,
        }),
        [volunteers],
    );

    const handleDeactivate = async volunteerId => {
        try {
            await api.patch(`/api/volunteers/${volunteerId}/status`, { status: "INACTIVE" });
            fetchVolunteers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        removeToken();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-950 p-3 text-slate-100 sm:p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <header className="glass-panel relative overflow-hidden rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-5 md:p-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%)]" />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                                Event staff
                            </p>
                            <h1 className="mt-2 text-[1.65rem] font-extrabold text-white sm:text-3xl">
                                Volunteer Dashboard
                            </h1>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/volunteers/new"
                                className="action-button w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-950 shadow-lg shadow-slate-700/10 sm:w-auto"
                            >
                                + Add volunteer
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="action-button w-full border border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500 hover:bg-slate-800 sm:w-auto"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Total Volunteers", value: summary.total, tone: "cyan" },
                        { label: "Active", value: summary.active, tone: "emerald" },
                        { label: "Inactive", value: summary.inactive, tone: "amber" },
                        { label: "Suspended", value: summary.suspended, tone: "rose" },
                    ].map(item => (
                        <div
                            key={item.label}
                            className="glass-panel animate-rise rounded-[1.5rem] p-4 transition duration-300 hover:-translate-y-1 hover:border-slate-500/70"
                            style={{ animationDelay: `${Math.min(200, 50 * (Math.random() * 5))}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">{item.label}</p>
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                        item.tone === "cyan"
                                            ? "bg-cyan-400"
                                            : item.tone === "emerald"
                                              ? "bg-emerald-400"
                                              : item.tone === "amber"
                                                ? "bg-amber-400"
                                                : "bg-rose-400"
                                    }`}
                                />
                            </div>
                            <p className="mt-4 text-3xl font-black text-white">{item.value}</p>
                        </div>
                    ))}
                </section>

                <section className="glass-panel rounded-[1.75rem] p-4 sm:p-5">
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <input
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search volunteers..."
                            className="input-shell md:max-w-sm"
                        />
                        <select
                            value={statusFilter}
                            onChange={event => setStatusFilter(event.target.value)}
                            className="input-shell md:max-w-xs"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[220px] items-center justify-center text-slate-400">
                            Loading volunteers...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 text-slate-400">
                            No volunteers match your search.
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400">
                                            <th className="px-3 py-3 font-medium">ID</th>
                                            <th className="px-3 py-3 font-medium">Name</th>
                                            <th className="px-3 py-3 font-medium">Role</th>
                                            <th className="px-3 py-3 font-medium">Team</th>
                                            <th className="px-3 py-3 font-medium">Status</th>
                                            <th className="px-3 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(volunteer => (
                                            <tr
                                                key={volunteer.volunteerId}
                                                className="border-b border-slate-800/90 transition hover:bg-slate-900/70"
                                            >
                                                <td className="px-3 py-4 font-semibold text-slate-200">
                                                    {volunteer.volunteerId}
                                                </td>
                                                <td className="px-3 py-4 text-white">{volunteer.name}</td>
                                                <td className="px-3 py-4 text-slate-300">{volunteer.role || "—"}</td>
                                                <td className="px-3 py-4 text-slate-300">{volunteer.team || "—"}</td>
                                                <td className="px-3 py-4">
                                                    <span
                                                        className={`status-pill ${
                                                            volunteer.status === "ACTIVE"
                                                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                                                : volunteer.status === "SUSPENDED"
                                                                  ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                                                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                                        }`}
                                                    >
                                                        {volunteer.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Link
                                                            to={`/volunteers/${volunteer.volunteerId}`}
                                                            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-slate-50"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            to={`/volunteers/${volunteer.volunteerId}/edit`}
                                                            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-slate-50"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            to={`/volunteers/${volunteer.volunteerId}/qr`}
                                                            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-slate-50"
                                                        >
                                                            QR
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeactivate(volunteer.volunteerId)}
                                                            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/15"
                                                        >
                                                            Deactivate
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-3 md:hidden">
                                {filtered.map(volunteer => (
                                    <div
                                        key={volunteer.volunteerId}
                                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{volunteer.name}</div>
                                                <div className="mt-1 text-xs text-slate-400">
                                                    #{volunteer.volunteerId}
                                                </div>
                                            </div>
                                            <span
                                                className={`status-pill ${
                                                    volunteer.status === "ACTIVE"
                                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                                        : volunteer.status === "SUSPENDED"
                                                          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                                          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                                }`}
                                            >
                                                {volunteer.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                    Role
                                                </span>
                                                <span className="mt-1 block">{volunteer.role || "—"}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                                    Team
                                                </span>
                                                <span className="mt-1 block">{volunteer.team || "—"}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                            <Link
                                                to={`/volunteers/${volunteer.volunteerId}`}
                                                className="rounded-xl border border-slate-700 bg-slate-950 px-2 py-2 text-center text-[11px] font-medium text-slate-200"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/volunteers/${volunteer.volunteerId}/edit`}
                                                className="rounded-xl border border-slate-700 bg-slate-950 px-2 py-2 text-center text-[11px] font-medium text-slate-200"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeactivate(volunteer.volunteerId)}
                                                className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-2 py-2 text-center text-[11px] font-medium text-amber-300"
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
