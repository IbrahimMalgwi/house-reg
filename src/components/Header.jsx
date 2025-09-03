// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { HOUSES } from "../utils/houseMapping";

export default function Header() {
    const { currentUser, logout, userRole } = useAuth(); // Added userRole here
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close mobile menu when route changes
    React.useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-indigo-100 dark:border-gray-700">
            {/* Skip navigation link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only absolute top-2 left-2 bg-indigo-600 text-white p-2 z-50 rounded text-sm transition-transform transform focus:translate-y-0 -translate-y-16"
            >
                Skip to main content
            </a>

            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo and house badges */}
                <div className="flex items-center space-x-4">
                    <Link
                        to={currentUser ? "/profile" : "/login"}
                        className="flex items-center space-x-2 group"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
                            🏠
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all">
                                House Registration
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                Teen Program System
                            </p>
                        </div>
                    </Link>

                    {/* Desktop house badges */}
                    <div className="hidden md:flex flex-wrap items-center space-x-2">
                        {Object.entries(HOUSES).map(([key, house]) => (
                            <span
                                key={key}
                                className="text-xs px-2 py-1 rounded-full text-white font-medium shadow-sm"
                                style={{ backgroundColor: house.color }}
                                title={house.name}
                            >
                                {house.name.split(" ").pop()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Desktop navigation */}
                <nav className="hidden md:flex items-center space-x-2">
                    {currentUser ? (
                        <>
                            <NavLink to="/register" currentPath={location.pathname}>
                                📝 Registration
                            </NavLink>
                            <NavLink to="/analysis" currentPath={location.pathname}>
                                📊 Analytics
                            </NavLink>
                            <NavLink to="/profile" currentPath={location.pathname}>
                                👤 Profile
                            </NavLink>

                            {/* Admin link - Only show for admin users */}
                            {userRole === "admin" && (
                                <NavLink to="/admin" currentPath={location.pathname}>
                                    👑 Admin
                                </NavLink>
                            )}

                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>

                            {/* User menu */}
                            <div className="relative group ml-2">
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                                        {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-medium hidden lg:block">
                                        {currentUser.email?.split('@')[0]}
                                    </span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Link>

                                {/* Dropdown menu */}
                                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                            {currentUser.email}
                                        </p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        👤 View Profile
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        🚪 Sign out
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" currentPath={location.pathname}>
                                Login
                            </NavLink>
                            <NavLink to="/signup" currentPath={location.pathname}>
                                Sign Up
                            </NavLink>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>
                        </>
                    )}
                </nav>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile navigation */}
            <nav
                className={`md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
                aria-hidden={!isMenuOpen}
            >
                <div className="px-4 py-3 space-y-2">
                    {currentUser ? (
                        <>
                            <MobileNavLink to="/register" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                📝 Registration
                            </MobileNavLink>
                            <MobileNavLink to="/analysis" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                📊 Analytics
                            </MobileNavLink>
                            <MobileNavLink to="/profile" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                👤 Profile
                            </MobileNavLink>

                            {/* Admin link for mobile - Only show for admin users */}
                            {userRole === "admin" && (
                                <MobileNavLink to="/admin" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                    👑 Admin
                                </MobileNavLink>
                            )}

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                                    >
                                        {isDark ? '☀️ Light' : '🌙 Dark'}
                                    </button>
                                </div>

                                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                    Signed in as {currentUser.email}
                                </div>

                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    🚪 Sign out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <MobileNavLink to="/login" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                Login
                            </MobileNavLink>
                            <MobileNavLink to="/signup" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                Sign Up
                            </MobileNavLink>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                                    >
                                        {isDark ? '☀️ Light' : '🌙 Dark'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile house badges */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-center space-x-2">
                        {Object.entries(HOUSES).map(([key, house]) => (
                            <span
                                key={key}
                                className="text-xs px-2 py-1 rounded-full text-white font-medium"
                                style={{ backgroundColor: house.color }}
                                title={house.name}
                            >
                                {house.name.split(" ").pop()}
                            </span>
                        ))}
                    </div>
                </div>
            </nav>
        </header>
    );
}

// Desktop NavLink component
function NavLink({ to, currentPath, children }) {
    const isActive = currentPath === to;

    return (
        <Link
            to={to}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                    ? "text-white bg-indigo-600 shadow-md"
                    : "text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
            {children}
        </Link>
    );
}

// Mobile NavLink component
function MobileNavLink({ to, currentPath, onClick, children }) {
    const isActive = currentPath === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive
                    ? "text-white bg-indigo-600"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
        >
            {children}
        </Link>
    );
}