// src/components/AdminRoute.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
    const { currentUser, userRole } = useAuth();

    // Check if user is authenticated and has admin role
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (userRole !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access the admin panel.</p>
                </div>
            </div>
        );
    }

    return children;
}