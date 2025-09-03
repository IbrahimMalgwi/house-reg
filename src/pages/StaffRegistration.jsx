// src/pages/StaffRegistration.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // If using React Router


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

    const { currentUser } = useAuth();;
    const navigate = useNavigate();
    // Redirect if not authenticated
    React.useEffect(() => {
        if (!currentUser) {
            navigate("/login"); // Redirect to login page
        }
    }, [currentUser, navigate]);// Get current user from auth context
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        organization: "",
        designation: "",
        otherDesignation: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
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

            setSuccess(true);
            setFormData({
                name: "",
                phone: "",
                email: "",
                organization: "",
                designation: "",
                otherDesignation: ""
            });

            setErrors({});

            // Auto-hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Error submitting staff registration:", error);
            setErrors({ submit: "Failed to submit registration. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // ... rest of your component remains the same
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

                        {success && (
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                                Registration successful! Thank you for registering.
                            </div>
                        )}

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
                </div>
            </div>

    );
}