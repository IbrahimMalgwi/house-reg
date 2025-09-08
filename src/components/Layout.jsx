// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
    const location = useLocation();

    // List of pages that should have full width (no container)
    const fullWidthPages = [
        "/", // Welcome page
        "/admin",
        "/admin/registrations",
        "/admin/staff",
        "/admin/program-metrics",
        "/analysis",
        "/staff-dashboard",
        "/metrics-dashboard",
        "/program-metrics",
        "/dashboard" // If you have a user dashboard
    ];

    const shouldUseContainer = !fullWidthPages.includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <Header />
            <main className="flex-grow">
                {shouldUseContainer ? (
                    // Standard container for form pages (Login, Signup, Registration forms, etc.)
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                ) : (
                    // Full width for dashboard and admin pages
                    <div className="w-full">
                        {children}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}