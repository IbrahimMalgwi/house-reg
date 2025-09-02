// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Header />
            <main className="max-w-7xl mx-auto p-4 md:p-6">
                {children}
            </main>
            <Footer />
        </div>
    );
}