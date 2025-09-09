// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import RegistrationForm from "./pages/RegistrationForm";
import AnalysisDashboard from "./pages/AnalysisDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import StaffRegistration from "./pages/StaffRegistration";
import StaffDashboard from "./pages/StaffDashboard";
import ProgramMetricsDashboard from "./pages/ProgramMetricsDashboard";
import WelcomePage from "./pages/WelcomePage";
import RoleRoute from "./components/RoleRoute";
import StaffManager from "./pages/admin/StaffManager";
import RegistrationsManager from "./pages/admin/RegistrationsManager";
import ProgramMetricsManager from "./pages/admin/ProgramMetricsManager";
import ProgramMetricsView from "./pages/ProgramMetricsView";
// Import the new forms
import SpiritualReportForm from "./pages/SpiritualReportForm";
import SportingReportForm from "./pages/SportingReportForm";

function AppContent() {
    return (
        <Layout>
            <Routes>
                {/* Public pages */}
                <Route path="/" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Admin-only pages */}
                <Route
                    path="/register"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <RegistrationForm />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <AdminPanel />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/staff-registration"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <StaffRegistration />
                        </RoleRoute>
                    }
                />
                {/* NEW: Separate forms for spiritual and sporting reports */}
                <Route
                    path="/spiritual-report"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <SpiritualReportForm />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/sporting-report"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <SportingReportForm />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/registrations"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <RegistrationsManager />
                        </RoleRoute>
                    }
                />

                {/* Accessible by staff + user (admin always has access too) */}
                <Route
                    path="/analysis"
                    element={
                        <RoleRoute allowedRoles={["staff", "user"]}>
                            <AnalysisDashboard />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <RoleRoute allowedRoles={["staff", "user"]}>
                            <Profile />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/staff-dashboard"
                    element={
                        <RoleRoute allowedRoles={["staff", "user"]}>
                            <StaffDashboard />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/metrics-dashboard"
                    element={
                        <RoleRoute allowedRoles={["staff", "user"]}>
                            <ProgramMetricsDashboard />
                        </RoleRoute>
                    }
                />
                <Route
                    path="/admin/staff"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <StaffManager />
                        </RoleRoute>
                    }
                />
                {/* Admin-only program metrics management */}
                <Route
                    path="/admin/program-metrics"
                    element={
                        <RoleRoute allowedRoles={["admin"]}>
                            <ProgramMetricsManager />
                        </RoleRoute>
                    }
                />

                {/* Read-only program metrics for staff/users */}
                <Route
                    path="/program-metrics"
                    element={
                        <RoleRoute allowedRoles={["staff", "user"]}>
                            <ProgramMetricsView />
                        </RoleRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;