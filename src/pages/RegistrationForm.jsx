// src/pages/RegistrationForm.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
// Import from the centralized house mapping
import {
    houses,
    getHouseKeyByName,
} from "../utils/houseMapping";

// Sports Fiesta editions - Only show 1.0, 2.0, and 3.0 in the UI
const SPORTS_FIESTA_PREVIOUS_EDITIONS = [
    { value: "1.0", label: "Sports Fiesta 1.0" },
    { value: "2.0", label: "Sports Fiesta 2.0" },
    { value: "3.0", label: "Sports Fiesta 3.0" }
];

// Current edition that will be automatically recorded
const CURRENT_EDITION = "4.0";

export default function RegistrationForm({ onRegister, lastAssigned, clearLastAssigned }) {
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        sex: "",
        religion: "",
        phone: "",
        email: "",
        fiestaAttendance: []
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [errors, setErrors] = useState({});
    const [firebaseError, setFirebaseError] = useState("");
    const [houseCounts, setHouseCounts] = useState({});
    const [duplicateFound, setDuplicateFound] = useState(null);
    const [existingRegistrations, setExistingRegistrations] = useState([]);

    // Fetch current house counts from Firebase
    useEffect(() => {
        async function fetchHouseCounts() {
            try {
                const registrationsRef = collection(db, "registrations");
                const snapshot = await getDocs(registrationsRef);

                // ✅ CORRECTED: Initialize counts dynamically
                const counts = {};
                houses.forEach(house => {
                    counts[house.key] = 0;
                });

                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.house) {
                        const houseKey = getHouseKeyByName(data.house);
                        if (houseKey && counts.hasOwnProperty(houseKey)) {
                            counts[houseKey]++;
                        }
                    }
                });

                setHouseCounts(counts);
            } catch (err) {
                console.error("Error fetching house counts:", err);
            }
        }

        fetchHouseCounts();
    }, [success]);

    // Check for duplicate registrations
    const checkForDuplicates = async (name, age, sex) => {
        try {
            const registrationsRef = collection(db, "registrations");

            // Create query to find potential duplicates
            const q = query(
                registrationsRef,
                where("name", "==", name.trim()),
                where("age", "==", age),
                where("sex", "==", sex)
            );

            const querySnapshot = await getDocs(q);
            const duplicates = [];

            querySnapshot.forEach((doc) => {
                duplicates.push({ id: doc.id, ...doc.data() });
            });

            return duplicates;
        } catch (error) {
            console.error("Error checking for duplicates:", error);
            return [];
        }
    };

    // Smart house assignment algorithm - OPTIMIZED
    const assignHouse = () => {
        if (Object.keys(houseCounts).length === 0) {
            const random = Math.floor(Math.random() * houses.length);
            return houses[random];
        }

        let minCount = Infinity;
        let candidateHouses = [];

        houses.forEach(house => {
            const count = houseCounts[house.key] || 0;
            if (count < minCount) {
                minCount = count;
                candidateHouses = [house];
            } else if (count === minCount) {
                candidateHouses.push(house);
            }
        });

        const randomIndex = Math.floor(Math.random() * candidateHouses.length);
        return candidateHouses[randomIndex];
    };

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
        setFormData(prev => {
            if (prev.fiestaAttendance.includes(edition)) {
                // Remove if already selected
                return {
                    ...prev,
                    fiestaAttendance: prev.fiestaAttendance.filter(item => item !== edition)
                };
            } else {
                // Add if not selected
                return {
                    ...prev,
                    fiestaAttendance: [...prev.fiestaAttendance, edition]
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
        setFirebaseError(""); // Clear previous errors

        try {
            // Check for duplicates before proceeding
            const duplicates = await checkForDuplicates(formData.name, formData.age, formData.sex);

            if (duplicates.length > 0) {
                setExistingRegistrations(duplicates);
                setDuplicateFound({
                    name: formData.name,
                    age: formData.age,
                    sex: formData.sex,
                    count: duplicates.length
                });
                setLoading(false);
                return;
            }

            // If no duplicates, proceed with registration
            await completeRegistration();
        } catch (err) {
            console.error("Error during registration:", err);
            setFirebaseError(err.message || "Something went wrong. Please check your Firebase configuration.");
            setLoading(false);
        }
    };

    const completeRegistration = async () => {
        try {
            const registrationsRef = collection(db, "registrations");

            // ✅ Assign house using balanced algorithm
            const house = assignHouse();

            await addDoc(registrationsRef, {
                ...formData,
                house: house.name,
                color: house.color,
                createdAt: serverTimestamp(),
                // Ensure fiestaAttendance is always an array with current edition
                fiestaAttendance: Array.isArray(formData.fiestaAttendance)
                    ? [...formData.fiestaAttendance, CURRENT_EDITION]
                    : [CURRENT_EDITION]
            });

            setSuccess({ ...house, participant: formData.name });

            // Call onRegister with the formData, not the event
            onRegister && onRegister(formData);

            setFormData({
                name: "",
                age: "",
                sex: "",
                religion: "",
                phone: "",
                email: "",
                fiestaAttendance: []
            });

            setErrors({});
        } catch (err) {
            console.error("Firebase Error: ", err);
            setFirebaseError(err.message || "Something went wrong. Please check your Firebase configuration.");
        } finally {
            setLoading(false);
        }
    };

    const handleContinueRegistration = () => {
        setDuplicateFound(null);
        setExistingRegistrations([]);
        completeRegistration();
    };

    const handleCancelRegistration = () => {
        setDuplicateFound(null);
        setExistingRegistrations([]);
        setLoading(false);
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    return (
        <div className="flex items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-xl space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-indigo-700 mb-2">
                            Teen Registration
                        </h2>
                        <p className="text-gray-600">Join the exciting teen program!</p>

                        {/* Display current house counts */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            {houses.map(house => (
                                <div key={house.key} className="flex items-center justify-center p-2 rounded-md"
                                     style={{ backgroundColor: `${house.color}20`, borderLeft: `3px solid ${house.color}` }}>
                            <span className="font-medium" style={{ color: house.color }}>
                                {house.shortName}: {houseCounts.hasOwnProperty(house.key) ? houseCounts[house.key] : 0}
                            </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {firebaseError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p className="font-medium">Firebase Error:</p>
                            <p className="text-sm">{firebaseError}</p>
                            <p className="text-xs mt-2">
                                Please check your Firebase security rules and configuration.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
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
                            {errors.religion && <p className="mt-1 text-sm text-red-500">{errors.religion}</p>}
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
                            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
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
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        {/* Sports Fiesta Attendance */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Sports Fiesta Attendance
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Which previous Sports Fiesta editions have you attended? (Select all that apply)
                            </p>

                            <div className="space-y-2">
                                {SPORTS_FIESTA_PREVIOUS_EDITIONS.map(edition => (
                                    <div key={edition.value} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`fiesta-${edition.value}`}
                                            checked={formData.fiestaAttendance.includes(edition.value)}
                                            onChange={() => handleFiestaAttendanceChange(edition.value)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label
                                            htmlFor={`fiesta-${edition.value}`}
                                            className="ml-2 block text-sm text-gray-900"
                                        >
                                            {edition.label}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Note: Your attendance for Sports Fiesta 4.0 will be automatically recorded.
                            </p>
                        </div>

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

                {/* Success Modal */}
                {success && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                        <div
                            className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full animate-pop-in"
                            style={{ borderTop: `8px solid ${success.color}` }}
                        >
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: `${success.color}20` }}>
                                    <svg className="w-8 h-8" style={{ color: success.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Registration Successful!
                            </h3>
                            <p className="mt-3 text-gray-600">
                                <strong className="text-gray-800">{success.participant}</strong> has been assigned to
                            </p>
                            <div className="my-4 py-2 px-4 rounded-lg inline-block" style={{ backgroundColor: `${success.color}20` }}>
                                <span className="font-bold text-lg" style={{ color: success.color }}>
                                    {success.name}
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

                {/* Duplicate Warning Modal */}
                {duplicateFound && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full animate-pop-in">
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-yellow-100">
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Potential Duplicate Found!
                            </h3>
                            <p className="mt-3 text-gray-600">
                                We found <strong>{duplicateFound.count}</strong> existing registration(s) for:
                            </p>
                            <div className="my-4 p-4 bg-yellow-50 rounded-lg">
                                <p className="font-medium">
                                    {duplicateFound.name}, {duplicateFound.age} years, {duplicateFound.sex}
                                </p>
                            </div>

                            {existingRegistrations.length > 0 && (
                                <div className="my-4 p-4 bg-gray-50 rounded-lg text-left max-h-40 overflow-y-auto">
                                    <p className="font-medium text-sm mb-2">Existing registrations:</p>
                                    {existingRegistrations.map((reg, index) => (
                                        <div key={index} className="text-xs text-gray-600 mb-1">
                                            • {reg.house} House - {reg.createdAt ? new Date(reg.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-sm text-gray-500 mb-4">
                                Are you sure you want to register this person again?
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleCancelRegistration}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleContinueRegistration}
                                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                    Register Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}