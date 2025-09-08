import React, { useState } from "react";

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

export default function EditStaffForm({ staffMember, onSave, onCancel }) {
    // Pre-populate form with existing data
    const [formData, setFormData] = useState({
        name: staffMember.name || "",
        phone: staffMember.phone || "",
        email: staffMember.email || "",
        organization: staffMember.organization || "",
        designation: staffMember.designation || "",
        otherDesignation: staffMember.otherDesignation || ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await onSave(formData);
        } catch (err) {
            console.error("Error during update:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }

        // Clear other designation when selection changes from "Other"
        if (field === "designation" && value !== "Other") {
            setFormData(prev => ({ ...prev, otherDesignation: "" }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter full name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Phone Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
            </div>

            {/* Email Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
            </div>

            {/* Organization Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization *
                </label>
                <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleChange("organization", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.organization ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter organization name"
                />
                {errors.organization && (
                    <p className="mt-1 text-sm text-red-500">{errors.organization}</p>
                )}
            </div>

            {/* Designation Field */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation *
                </label>
                <select
                    value={formData.designation}
                    onChange={(e) => handleChange("designation", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.designation ? "border-red-500" : "border-gray-300"
                    }`}
                >
                    <option value="">Select Designation</option>
                    {DESIGNATION_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                {errors.designation && (
                    <p className="mt-1 text-sm text-red-500">{errors.designation}</p>
                )}
            </div>

            {/* Other Designation Field (conditionally shown) */}
            {formData.designation === "Other" && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specify Designation *
                    </label>
                    <input
                        type="text"
                        value={formData.otherDesignation}
                        onChange={(e) => handleChange("otherDesignation", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            errors.otherDesignation ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter your designation"
                    />
                    {errors.otherDesignation && (
                        <p className="mt-1 text-sm text-red-500">{errors.otherDesignation}</p>
                    )}
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}