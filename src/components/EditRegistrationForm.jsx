import React, { useState } from "react";

// Reuse the same constants from RegistrationForm
const SPORTS_FIESTA_PREVIOUS_EDITIONS = [
    { value: "1.0", label: "Sports Fiesta 1.0" },
    { value: "2.0", label: "Sports Fiesta 2.0" },
    { value: "3.0", label: "Sports Fiesta 3.0" },
];

export default function EditRegistrationForm({
                                                 registration,
                                                 onSave,
                                                 onCancel,
                                             }) {
    // Pre-populate the form with the existing registration data
    const [formData, setFormData] = useState({
        name: registration.name || "",
        age: registration.age || "",
        sex: registration.sex || "",
        religion: registration.religion || "",
        phone: registration.phone || "",
        email: registration.email || "",
        fiestaAttendance: registration.fiestaAttendance
            ? registration.fiestaAttendance.filter((edition) => edition !== "4.0") // Filter out the current edition added automatically
            : [],
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.age) {
            newErrors.age = "Age is required";
        }

        if (!formData.sex) {
            newErrors.sex = "Please select a gender";
        }

        if (!formData.religion) {
            newErrors.religion = "Please select a religion";
        }

        if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFiestaAttendanceChange = (edition) => {
        setFormData((prev) => {
            if (prev.fiestaAttendance.includes(edition)) {
                return {
                    ...prev,
                    fiestaAttendance: prev.fiestaAttendance.filter(
                        (item) => item !== edition
                    ),
                };
            } else {
                return {
                    ...prev,
                    fiestaAttendance: [...prev.fiestaAttendance, edition],
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Prepare the data for saving, ensuring fiestaAttendance includes the current edition
            const dataToSave = {
                ...formData,
                fiestaAttendance: Array.isArray(formData.fiestaAttendance)
                    ? [...formData.fiestaAttendance, "4.0"]
                    : ["4.0"],
            };

            await onSave(dataToSave); // Call the save function passed from the parent
        } catch (err) {
            console.error("Error during update:", err);
            // Error handling should be done in the parent component
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display House Info (Read-only) */}
            <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700">Assigned House:</p>
                <div className="flex items-center mt-1">
                    <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: registration.color }}
                    ></div>
                    <span className="font-semibold" style={{ color: registration.color }}>
            {registration.house}
          </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    The house assignment cannot be changed here.
                </p>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                </label>
                <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Age */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                </label>
                <input
                    type="number"
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.age ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                />
                {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
            </div>

            {/* Sex Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sex *
                </label>
                <select
                    value={formData.sex}
                    onChange={(e) => handleChange("sex", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.sex ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                </select>
                {errors.sex && <p className="mt-1 text-sm text-red-500">{errors.sex}</p>}
            </div>

            {/* Religion Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Religion *
                </label>
                <select
                    value={formData.religion}
                    onChange={(e) => handleChange("religion", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.religion ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                >
                    <option value="">Select Religion</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Islam">Islam</option>
                    <option value="Others">Others</option>
                </select>
                {errors.religion && (
                    <p className="mt-1 text-sm text-red-500">{errors.religion}</p>
                )}
            </div>

            {/* Optional Fields */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                </label>
                <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                </label>
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
            </div>

            {/* Sports Fiesta Attendance */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Sports Fiesta Attendance
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    Which previous Sports Fiesta editions have you attended? (Select all
                    that apply)
                </p>

                <div className="space-y-2">
                    {SPORTS_FIESTA_PREVIOUS_EDITIONS.map((edition) => (
                        <div key={edition.value} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`edit-fiesta-${edition.value}`}
                                checked={formData.fiestaAttendance.includes(edition.value)}
                                onChange={() => handleFiestaAttendanceChange(edition.value)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor={`edit-fiesta-${edition.value}`}
                                className="ml-2 block text-sm text-gray-900"
                            >
                                {edition.label}
                            </label>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    Note: Attendance for Sports Fiesta 4.0 is already recorded.
                </p>
            </div>

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