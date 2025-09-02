// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import RegistrationForm from "./pages/RegistrationForm";
import AnalysisDashboard from "./pages/AnalysisDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import useRegistration from "./hooks/useRegistration";

function AppContent() {
    const { registrants, lastAssigned, handleRegister, clearLastAssigned } = useRegistration();

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/register"
                element={
                    <PrivateRoute>
                        <RegistrationForm
                            onRegister={handleRegister}
                            lastAssigned={lastAssigned}
                            clearLastAssigned={clearLastAssigned}
                        />
                    </PrivateRoute>
                }
            />
            <Route
                path="/analysis"
                element={
                    <PrivateRoute>
                        <AnalysisDashboard registrants={registrants} />
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;