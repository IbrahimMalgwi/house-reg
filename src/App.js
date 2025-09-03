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
import PrivateRoute from "./components/PrivateRoute";
import StaffRegistration from "./pages/StaffRegistration";
import StaffDashboard from "./pages/StaffDashboard";
import AdditionalMetricsForm from "./pages/AdditionalMetricsForm";
import ProgramMetricsDashboard from "./pages/ProgramMetricsDashboard";

function AppContent() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Navigate to="/register" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/register"
                    element={
                        <PrivateRoute>
                            <RegistrationForm />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/analysis"
                    element={
                        <PrivateRoute>
                            <AnalysisDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute>
                            <AdminPanel />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/staff-registration"
                    element={
                        <PrivateRoute>
                            <StaffRegistration />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/staff-dashboard"
                    element={
                        <PrivateRoute>
                            <StaffDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/metrics-form"
                    element={
                        <PrivateRoute>
                            <AdditionalMetricsForm />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/metrics-dashboard"
                    element={
                        <PrivateRoute>
                            <ProgramMetricsDashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/register" replace />} />
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