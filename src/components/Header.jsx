// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import logo from "../assets/images/logo.png";

export default function Header() {
    const { currentUser, logout, userRole } = useAuth();
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
                {/* Logo only - removed house badges */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/"
                        className="flex items-center space-x-2 group"
                    >
                        <div className="hidden sm:block">
                            <img src={logo} alt="All Winners" className="h-10 w-auto rounded-lg shadow-md" />
                        </div>
                    </Link>
                </div>

                {/* Desktop navigation */}
                <nav className="hidden lg:flex items-center space-x-1">
                    {currentUser ? (
                        <>
                            <NavLink to="/" currentPath={location.pathname}>
                                🏠 Home
                            </NavLink>
                            <NavLink to="/register" currentPath={location.pathname}>
                                📝 Teens
                            </NavLink>
                            <NavLink to="/staff-registration" currentPath={location.pathname}>
                                👥 Marshal
                            </NavLink>

                            {/* NEW: Replace single metrics form with two separate forms */}
                            <div className="relative group">
                                <button className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 whitespace-nowrap flex items-center">
                                    📋 Metrics
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown menu for metrics forms */}
                                <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <Link
                                        to="/spiritual-report"
                                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                                    >
                                        ✝️ Spiritual Report
                                    </Link>
                                    <Link
                                        to="/sporting-report"
                                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        ⚽ Sporting Report
                                    </Link>
                                </div>
                            </div>

                            {/* Program Metrics - Different links based on role */}
                            {userRole === "admin" ? (
                                <NavLink to="/admin/program-metrics" currentPath={location.pathname}>
                                    📊 Manage Metrics
                                </NavLink>
                            ) : (
                                <NavLink to="/program-metrics" currentPath={location.pathname}>
                                    📊 View Metrics
                                </NavLink>
                            )}

                            <NavLink to="/analysis" currentPath={location.pathname}>
                                📈 Analytics
                            </NavLink>
                            <NavLink to="/staff-dashboard" currentPath={location.pathname}>
                                👥 Marshals
                            </NavLink>
                            <NavLink to="/metrics-dashboard" currentPath={location.pathname}>
                                📉 Program
                            </NavLink>

                            {/* Admin links - Only show for admin users */}
                            {userRole === "admin" && (
                                <>
                                    <NavLink to="/admin" currentPath={location.pathname}>
                                        👑 Admin
                                    </NavLink>
                                    <NavLink to="/admin/registrations" currentPath={location.pathname}>
                                        📋 Teens
                                    </NavLink>
                                    <NavLink to="/admin/staff" currentPath={location.pathname}>
                                        👥 Staff
                                    </NavLink>
                                </>
                            )}

                            {/* Theme toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-1"
                                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDark ? '☀️' : '🌙'}
                            </button>

                            {/* User menu */}
                            <div className="relative group ml-1">
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                                        {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-medium hidden xl:block">
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
                            <NavLink to="/" currentPath={location.pathname}>
                                🏠 Home
                            </NavLink>
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
                    className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                className={`lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
                aria-hidden={!isMenuOpen}
            >
                <div className="px-4 py-3 space-y-1">
                    {currentUser ? (
                        <>
                            <MobileNavLink to="/" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                🏠 Home
                            </MobileNavLink>
                            <MobileNavLink to="/register" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                📝 Teens Registration
                            </MobileNavLink>
                            <MobileNavLink to="/staff-registration" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                👥 Marshal Registration
                            </MobileNavLink>

                            {/* NEW: Separate metrics forms for mobile */}
                            <div className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                                📋 Metrics Forms
                            </div>
                            <MobileNavLink to="/spiritual-report" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                &nbsp;&nbsp;✝️ Spiritual Report
                            </MobileNavLink>
                            <MobileNavLink to="/sporting-report" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                &nbsp;&nbsp;⚽ Sporting Report
                            </MobileNavLink>

                            {/* Program Metrics - Different links based on role */}
                            {userRole === "admin" ? (
                                <MobileNavLink to="/admin/program-metrics" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                    📊 Manage Metrics
                                </MobileNavLink>
                            ) : (
                                <MobileNavLink to="/program-metrics" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                    📊 View Metrics
                                </MobileNavLink>
                            )}

                            <MobileNavLink to="/analysis" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                📈 Teens Analytics
                            </MobileNavLink>
                            <MobileNavLink to="/staff-dashboard" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                👥 Marshal Analytics
                            </MobileNavLink>
                            <MobileNavLink to="/metrics-dashboard" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                📉 Program Analytics
                            </MobileNavLink>
                            <MobileNavLink to="/profile" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                👤 Profile
                            </MobileNavLink>

                            {/* Admin links for mobile - Only show for admin users */}
                            {userRole === "admin" && (
                                <>
                                    <MobileNavLink to="/admin" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                        👑 Admin Panel
                                    </MobileNavLink>
                                    <MobileNavLink to="/admin/registrations" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                        📋 Manage Teens
                                    </MobileNavLink>
                                    <MobileNavLink to="/admin/staff" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                        👥 Manage Staff
                                    </MobileNavLink>
                                </>
                            )}

                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
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

                                <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 break-words">
                                    Signed in as {currentUser.email}
                                </div>

                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-2"
                                >
                                    🚪 Sign out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <MobileNavLink to="/" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                🏠 Home
                            </MobileNavLink>
                            <MobileNavLink to="/login" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                Login
                            </MobileNavLink>
                            <MobileNavLink to="/signup" currentPath={location.pathname} onClick={() => setIsMenuOpen(false)}>
                                Sign Up
                            </MobileNavLink>

                            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-3">
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
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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