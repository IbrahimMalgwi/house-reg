import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

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
    const { isDark } = useTheme();
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
    const [touched, setTouched] = useState({});

    // Load draft from localStorage on component mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('staffRegistrationDraft');
        if (savedDraft) {
            setFormData(JSON.parse(savedDraft));
        }
    }, []);

    // Auto-save draft to localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(formData).some(key => formData[key] !== '' && formData[key] !== [])) {
                localStorage.setItem('staffRegistrationDraft', JSON.stringify(formData));
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [formData]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading) {
                const submitEvent = new Event('submit', { cancelable: true });
                e.preventDefault();
                // Find the form and submit it directly
                const form = document.querySelector('form');
                if (form) {
                    form.dispatchEvent(submitEvent);
                }
            }
            if (e.key === 'Escape' && success) {
                setSuccess(null);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [success, loading]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10,15}$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number (10-15 digits)";
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
            // Mark all fields as touched to show errors
            setTouched({
                name: true,
                phone: true,
                email: true,
                organization: true,
                designation: true,
                otherDesignation: true
            });
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
                submittedByUid: currentUser.uid,
                submittedByEmail: currentUser.email,
                submittedByName: currentUser.displayName || "Unknown"
            });

            // Set success data for the modal
            setSuccess({
                name: formData.name,
                designation: formData.designation === "Other" ? formData.otherDesignation : formData.designation
            });

            // Reset form and clear draft
            handleReset();
            setErrors({});
        } catch (error) {
            console.error("Error submitting staff registration:", error);
            let errorMessage = "Failed to submit registration. Please try again.";

            if (error.code === 'permission-denied') {
                errorMessage = "Permission denied. Please contact an administrator.";
            } else if (error.code === 'unavailable') {
                errorMessage = "Network error. Please check your connection.";
            }

            setErrors({ submit: errorMessage });
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

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleReset = () => {
        setFormData({
            name: "",
            phone: "",
            email: "",
            organization: "",
            designation: "",
            otherDesignation: ""
        });
        setErrors({});
        setTouched({});
        localStorage.removeItem('staffRegistrationDraft');
    };

    // Calculate form progress
    const calculateProgress = () => {
        const requiredFields = ['name', 'phone', 'email', 'organization', 'designation'];
        const completed = requiredFields.filter(field => {
            if (field === 'designation' && formData.designation === "Other") {
                return formData.otherDesignation.trim();
            }
            return formData[field];
        }).length;
        return (completed / requiredFields.length) * 100;
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-4 ${isDark ? 'ring-1 ring-gray-700' : ''}`}>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
                            Staff Registration
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">Register as Counselor, Marshal, or Support Staff</p>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    Form Progress
                                </span>
                                <span className="text-sm text-gray-500">
                                    {Math.round(calculateProgress())}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${calculateProgress()}%` }}
                                ></div>
                            </div>
                        </div>
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
                                onBlur={() => handleBlur("name")}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    touched.name && errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter full name"
                                aria-label="Full Name"
                                aria-required="true"
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && touched.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
                                onBlur={() => handleBlur("phone")}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    touched.phone && errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter phone number"
                                aria-label="Phone Number"
                                aria-required="true"
                                aria-invalid={!!errors.phone}
                            />
                            {errors.phone && touched.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
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
                                onBlur={() => handleBlur("email")}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    touched.email && errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter email address"
                                aria-label="Email Address"
                                aria-required="true"
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && touched.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
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
                                onBlur={() => handleBlur("organization")}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    touched.organization && errors.organization ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="Enter organization name"
                                aria-label="Organization"
                                aria-required="true"
                                aria-invalid={!!errors.organization}
                            />
                            {errors.organization && touched.organization && <p className="mt-1 text-sm text-red-500">{errors.organization}</p>}
                        </div>

                        {/* Designation Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Designation *
                            </label>
                            <select
                                value={formData.designation}
                                onChange={(e) => handleChange("designation", e.target.value)}
                                onBlur={() => handleBlur("designation")}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                    touched.designation && errors.designation ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                aria-label="Designation"
                                aria-required="true"
                                aria-invalid={!!errors.designation}
                            >
                                <option value="">Select Designation</option>
                                {DESIGNATION_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {errors.designation && touched.designation && <p className="mt-1 text-sm text-red-500">{errors.designation}</p>}
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
                                    onBlur={() => handleBlur("otherDesignation")}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white ${
                                        touched.otherDesignation && errors.otherDesignation ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                    }`}
                                    placeholder="Enter your designation"
                                    aria-label="Specify Designation"
                                    aria-required="true"
                                    aria-invalid={!!errors.otherDesignation}
                                />
                                {errors.otherDesignation && touched.otherDesignation && <p className="mt-1 text-sm text-red-500">{errors.otherDesignation}</p>}
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                disabled={loading}
                            >
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-3 rounded-lg text-white font-semibold transition-all ${
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
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Pro tip: Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to submit
                        </p>
                    </form>
                </div>

                {/* Success Modal */}
                {success && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                        <div
                            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm w-full animate-pop-in"
                            style={{ borderTop: "8px solid #4f46e5" }}
                        >
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: "#4f46e520" }}>
                                    <svg className="w-8 h-8" style={{ color: "#4f46e5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                Registration Successful!
                            </h3>
                            <p className="mt-3 text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-white">{success.name}</strong> has been registered as
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