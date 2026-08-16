import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function PublicVolunteerPage() {
    const { volunteerId } = useParams();
    const [volunteer, setVolunteer] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get(`/api/public/volunteers/${volunteerId}`);
                setVolunteer(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Volunteer not found");
            }
        }

        loadProfile();
    }, [volunteerId]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center text-red-300">
                {error}
            </div>
        );
    }

    if (!volunteer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
                Loading volunteer profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-slate-100">
            <div className="mx-auto max-w-md overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/90 shadow-soft">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-center text-slate-950">
                    <div className="text-2xl font-black tracking-[0.22em]">EVENT</div>
                </div>
                <div className="space-y-5 p-6 text-center">
                    <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-cyan-500 bg-slate-800">
                        {volunteer.photo ? (
                            <img src={volunteer.photo} alt={volunteer.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-3xl font-bold text-cyan-300">
                                {volunteer.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white">{volunteer.name}</h1>
                        <p className="mt-1 text-lg font-medium text-cyan-300">{volunteer.volunteerId}</p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                        {volunteer.role && (
                            <p>
                                <span className="font-semibold text-slate-200">Role:</span> {volunteer.role}
                            </p>
                        )}
                        {volunteer.team && (
                            <p>
                                <span className="font-semibold text-slate-200">Team:</span> {volunteer.team}
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${volunteer.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300" : volunteer.status === "SUSPENDED" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}`}
                        >
                            {volunteer.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
