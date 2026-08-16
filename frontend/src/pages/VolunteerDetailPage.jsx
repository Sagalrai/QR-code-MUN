import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function VolunteerDetailPage() {
    const { volunteerId } = useParams();
    const [volunteer, setVolunteer] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadVolunteer() {
            try {
                const response = await api.get(`/api/volunteers/${volunteerId}`);
                setVolunteer(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load volunteer");
            }
        }

        loadVolunteer();
    }, [volunteerId]);

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-300">{error}</div>;
    }

    if (!volunteer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
                Loading volunteer...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-8">
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Volunteer</p>
                        <h1 className="text-2xl font-bold">{volunteer.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to={`/volunteers/${volunteerId}/qr`}
                            className="rounded-xl bg-cyan-500 px-3 py-2 font-medium text-slate-950"
                        >
                            QR
                        </Link>
                        <Link to="/" className="rounded-xl border border-slate-700 px-3 py-2">
                            Dashboard
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-sm text-slate-400">Volunteer ID</p>
                        <p className="mt-1 text-lg font-semibold text-cyan-300">{volunteer.volunteerId}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-sm text-slate-400">Status</p>
                        <p className="mt-1 text-lg font-semibold">{volunteer.status}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-sm text-slate-400">Role</p>
                        <p className="mt-1 text-lg font-semibold">{volunteer.role || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-sm text-slate-400">Team</p>
                        <p className="mt-1 text-lg font-semibold">{volunteer.team || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-sm text-slate-400">Phone</p>
                        <p className="mt-1 text-lg font-semibold">{volunteer.phone || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="mt-1 text-lg font-semibold">{volunteer.email || "—"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
