import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function VolunteerQrPage() {
    const { volunteerId } = useParams();
    const [volunteer, setVolunteer] = useState(null);

    useEffect(() => {
        async function loadVolunteer() {
            const response = await api.get(`/api/volunteers/${volunteerId}`);
            setVolunteer(response.data);
        }
        loadVolunteer();
    }, [volunteerId]);

    if (!volunteer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
                Loading QR data...
            </div>
        );
    }

    const qrUrl =
        volunteer.qrCode ||
        `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(`${window.location.origin}/v/${volunteer.volunteerId}`)}`;

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-slate-200">
            <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">QR Code</p>
                        <h1 className="text-2xl font-bold">{volunteer.name}</h1>
                    </div>
                    <Link to="/" className="rounded-xl border border-slate-700 px-3 py-2">
                        Back
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">
                        <img
                            src={qrUrl}
                            alt="Volunteer QR code"
                            className="mx-auto w-full max-w-xs rounded-xl bg-white p-3"
                        />
                    </div>
                    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-6">
                        <div>
                            <p className="text-sm text-slate-400">Volunteer name</p>
                            <p className="text-xl font-semibold">{volunteer.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Volunteer ID</p>
                            <p className="text-xl font-semibold text-cyan-300">{volunteer.volunteerId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">QR URL</p>
                            <p className="break-all text-sm text-slate-200">
                                {window.location.origin}/v/{volunteer.volunteerId}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={qrUrl}
                                download={`${volunteer.volunteerId}-qr.png`}
                                className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-slate-950"
                            >
                                Download
                            </a>
                            <button
                                onClick={() => window.print()}
                                className="rounded-xl border border-slate-700 px-4 py-2"
                            >
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
