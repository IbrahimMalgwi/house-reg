// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import RegistrationForm from "./pages/RegistrationForm";
import AnalysisDashboard from "./pages/AnalysisDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import { HOUSES, HOUSE_KEYS, getHouseByKey } from "./utils/houseMapping";

// Navigation component
function Navigation() {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    return (
        <header className="bg-white shadow-lg border-b border-indigo-100">
            <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        🏠 House Registration System
                    </h1>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center mt-2 gap-2">
                        <span className="text-xs px-2 py-1 rounded-full text-white bg-red-500">Saviour</span>
                        <span className="text-xs px-2 py-1 rounded-full text-black bg-yellow-400">Holy Ghost Baptizer</span>
                        <span className="text-xs px-2 py-1 rounded-full text-white bg-blue-500">Healer</span>
                        <span className="text-xs px-2 py-1 rounded-full text-white bg-purple-500">Coming King</span>
                    </div>
                </div>

                <nav className="flex items-center space-x-4">
                    {currentUser ? (
                        <>
                            <Link
                                to="/register"
                                className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                                    location.pathname === '/register'
                                        ? "text-white bg-indigo-600 shadow-md"
                                        : "text-indigo-700 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                                📝 Registration
                            </Link>
                            <Link
                                to="/analysis"
                                className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                                    location.pathname === '/analysis'
                                        ? "text-white bg-indigo-600 shadow-md"
                                        : "text-indigo-700 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                                📊 Analytics
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-indigo-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-all duration-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                                    location.pathname === '/login'
                                        ? "text-white bg-indigo-600 shadow-md"
                                        : "text-indigo-700 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                                    location.pathname === '/signup'
                                        ? "text-white bg-indigo-600 shadow-md"
                                        : "text-indigo-700 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

function AppContent() {
    const [registrants, setRegistrants] = useState([]);
    const [lastAssigned, setLastAssigned] = useState(null);

    // Load saved registrants (if any) and normalize house info
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("registrants") || "[]");
            const normalized = saved.map((r) => {
                // if old entries used houseName or house, try to map to a key
                const copy = { ...r };
                if (!copy.houseKey) {
                    const foundKey = HOUSE_KEYS.find(
                        (k) =>
                            (r.house && String(r.house).toLowerCase() === String(HOUSES[k].name).toLowerCase()) ||
                            (r.houseName && String(r.houseName).toLowerCase() === String(HOUSES[k].name).toLowerCase())
                    );
                    if (foundKey) {
                        copy.houseKey = foundKey;
                        copy.houseName = HOUSES[foundKey].name;
                        copy.houseColor = HOUSES[foundKey].color;
                    }
                } else {
                    const h = getHouseByKey(copy.houseKey);
                    if (h) {
                        copy.houseName = h.name;
                        copy.houseColor = h.color;
                    }
                }
                return copy;
            });
            setRegistrants(normalized);
        } catch (e) {
            setRegistrants([]);
        }
    }, []);

    // persist
    useEffect(() => {
        localStorage.setItem("registrants", JSON.stringify(registrants));
    }, [registrants]);

    // Balanced assignment: choose randomly among the min-count houses
    function handleRegister(form) {
        // compute current counts
        const counts = { RED: 0, YELLOW: 0, BLUE: 0, PURPLE: 0 };
        registrants.forEach((r) => {
            if (r.houseKey && Object.prototype.hasOwnProperty.call(counts, r.houseKey)) {
                counts[r.houseKey] = counts[r.houseKey] + 1;
            }
        });

        const min = Math.min(...Object.values(counts));
        const eligible = Object.keys(counts).filter((k) => counts[k] === min);
        const chosenKey = eligible[Math.floor(Math.random() * eligible.length)];
        const house = HOUSES[chosenKey];

        const newRegistrant = {
            id: Date.now(),
            fullName: form.name || "",
            sex: form.sex || "",
            age: form.age ? Number(form.age) : null,
            religion: form.religion || "",
            email: form.email || "",
            phone: form.phone || "",
            houseKey: chosenKey,
            houseName: house.name,
            houseColor: house.color,
            createdAt: new Date().toISOString(),
        };

        setRegistrants((prev) => [...prev, newRegistrant]);
        setLastAssigned(newRegistrant);
    }

    function clearLastAssigned() {
        setLastAssigned(null);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Navigation />

            <main className="max-w-7xl mx-auto p-4 md:p-6">
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
            </main>

            {/* Footer */}
            <footer className="mt-12 py-6 bg-white border-t border-indigo-100">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
                    <p>House Registration System • Built with React & Firebase</p>
                </div>
            </footer>
        </div>
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