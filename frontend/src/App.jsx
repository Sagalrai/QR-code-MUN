import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import PublicVolunteerPage from "./pages/PublicVolunteerPage";
import VolunteerDetailPage from "./pages/VolunteerDetailPage";
import VolunteerFormPage from "./pages/VolunteerFormPage";
import VolunteerQrPage from "./pages/VolunteerQrPage";
import { getToken, isAuthenticated } from "./services/auth";

function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/volunteers/new"
                element={
                    <ProtectedRoute>
                        <VolunteerFormPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/volunteers/:volunteerId/edit"
                element={
                    <ProtectedRoute>
                        <VolunteerFormPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/volunteers/:volunteerId"
                element={
                    <ProtectedRoute>
                        <VolunteerDetailPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/volunteers/:volunteerId/qr"
                element={
                    <ProtectedRoute>
                        <VolunteerQrPage />
                    </ProtectedRoute>
                }
            />
            <Route path="/v/:volunteerId" element={<PublicVolunteerPage />} />
            <Route path="*" element={<Navigate to={getToken() ? "/" : "/login"} replace />} />
        </Routes>
    );
}
