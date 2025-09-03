// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <Header />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}