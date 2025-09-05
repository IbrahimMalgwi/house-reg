// src/pages/StaffRegistration.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const DESIGNATION_OPTIONS = [
    "Counselor/Marshal",
    "Medic",
    "Media",
    "Sound",
    "Welfare",
    "Data",
    "Security",
    "Other"
];

export default function StaffRegistration() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
        }
    }, [currentUser, navigate]);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        organization: "",
        designation: "",
        otherDesignation: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10,15}$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.organization.trim()) {
            newErrors.organization = "Organization is required";
        }

        if (!formData.designation) {
            newErrors.designation = "Please select a designation";
        } else if (formData.designation === "Other" && !formData.otherDesignation.trim()) {
            newErrors.otherDesignation = "Please specify your designation";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // Check if user is authenticated
        if (!currentUser) {
            setErrors({ submit: "Please log in to submit a staff registration." });
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const staffRef = collection(db, "staffRegistrations");

            await addDoc(staffRef, {
                ...formData,
                finalDesignation: formData.designation === "Other" ? formData.otherDesignation : formData.designation,
                createdAt: serverTimestamp(),
                registrationType: "staff",
                // Add user tracking information
                submittedByUid: currentUser.uid,
                submittedByEmail: currentUser.email,
                submittedByName: currentUser.displayName || "Unknown"
            });

            // Set success data for the modal
            setSuccess({
                name: formData.name,
                designation: formData.designation === "Other" ? formData.otherDesignation : formData.designation
            });

            // Reset form
            setFormData({
                name: "",
                phone: "",
                email: "",
                organization: "",
                designation: "",
                otherDesignation: ""
            });

            setErrors({});
        } catch (error) {
            console.error("Error submitting staff registration:", error);
            setErrors({ submit: "Failed to submit registration. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }

        // Clear other designation when selection changes from "Other"
        if (field === "designation" && value !== "Other") {
            setFormData(prev => ({ ...prev, otherDesignation: "" }));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-4">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
                            Staff Registration
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">Register as Counselor, Marshal, or Support Staff</p>
                    </div>

                    {errors.submit && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter full name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter phone number"
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter email address"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        {/* Organization Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Organization *
                            </label>
                            <input
                                type="text"
                                value={formData.organization}
                                onChange={(e) => handleChange("organization", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    errors.organization ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter organization name"
                            />
                            {errors.organization && <p className="mt-1 text-sm text-red-500">{errors.organization}</p>}
                        </div>

                        {/* Designation Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Designation *
                            </label>
                            <select
                                value={formData.designation}
                                onChange={(e) => handleChange("designation", e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    errors.designation ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                            >
                                <option value="">Select Designation</option>
                                {DESIGNATION_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {errors.designation && <p className="mt-1 text-sm text-red-500">{errors.designation}</p>}
                        </div>

                        {/* Other Designation Field (conditionally shown) */}
                        {formData.designation === "Other" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Specify Designation *
                                </label>
                                <input
                                    type="text"
                                    value={formData.otherDesignation}
                                    onChange={(e) => handleChange("otherDesignation", e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                        errors.otherDesignation ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                    placeholder="Enter your designation"
                                />
                                {errors.otherDesignation && <p className="mt-1 text-sm text-red-500">{errors.otherDesignation}</p>}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </div>
                            ) : (
                                "Register Now"
                            )}
                        </button>
                    </form>
                </div>

                {/* Success Modal - Similar to the teen registration */}
                {success && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                        <div
                            className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full animate-pop-in"
                            style={{ borderTop: "8px solid #4f46e5" }} // Using indigo color
                        >
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "#4f46e520" }}>
                                    <svg className="w-8 h-8" style={{ color: "#4f46e5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Registration Successful!
                            </h3>
                            <p className="mt-3 text-gray-600">
                                <strong className="text-gray-800">{success.name}</strong> has been registered as
                            </p>
                            <div className="my-4 py-2 px-4 rounded-lg inline-block" style={{ backgroundColor: "#4f46e520" }}>
                                <span className="font-bold text-lg" style={{ color: "#4f46e5" }}>
                                    {success.designation}
                                </span>
                            </div>
                            <button
                                onClick={() => setSuccess(null)}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}