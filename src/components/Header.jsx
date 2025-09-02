// src/components/Header.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { HOUSES } from "../utils/houseMapping";

export default function Header() {
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
                        {Object.entries(HOUSES).map(([key, house]) => (
                            <span
                                key={key}
                                className="text-xs px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: house.color }}
                            >
                                {house.name}
                            </span>
                        ))}
                    </div>
                </div>

                <nav className="flex items-center space-x-4">
                    {currentUser ? (
                        <>
                            <NavLink to="/register" currentPath={location.pathname}>
                                📝 Registration
                            </NavLink>
                            <NavLink to="/analysis" currentPath={location.pathname}>
                                📊 Analytics
                            </NavLink>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-indigo-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-all duration-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" currentPath={location.pathname}>
                                Login
                            </NavLink>
                            <NavLink to="/signup" currentPath={location.pathname}>
                                Sign Up
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

// Helper component for navigation links
function NavLink({ to, currentPath, children }) {
    const isActive = currentPath === to;

    return (
        <Link
            to={to}
            className={`px-4 py-2 font-medium rounded-lg transition-all duration-300 ${
                isActive
                    ? "text-white bg-indigo-600 shadow-md"
                    : "text-indigo-700 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
        >
            {children}
        </Link>
    );
}