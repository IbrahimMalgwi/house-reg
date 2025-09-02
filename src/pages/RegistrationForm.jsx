// src/pages/RegistrationForm.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

const houses = [
    {
        name: "Jesus Christ Our Saviour",
        color: "#FF0000",
        key: "saviour",
        shortName: "Our Saviour"
    },
    {
        name: "Jesus Christ The Holy Ghost Baptizer",
        color: "#FFD700",
        key: "holyGhost",
        shortName: "Holy Ghost Baptizer"
    },
    {
        name: "Jesus Christ Our Healer",
        color: "#0000FF",
        key: "healer",
        shortName: "Our Healer"
    },
    {
        name: "Jesus Christ Our Coming King",
        color: "#800080",
        key: "comingKing",
        shortName: "Our Coming King"
    },
];

export default function RegistrationForm({ onRegister }) {
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        sex: "",
        religion: "",
        phone: "",
        email: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [errors, setErrors] = useState({});
    const [firebaseError, setFirebaseError] = useState("");
    const [houseCounts, setHouseCounts] = useState({});

    // Fetch current house counts from Firebase
    useEffect(() => {
        // Helper function to get house key from name (moved inside useEffect)
        const getHouseKey = (houseName) => {
            const house = houses.find(h => {
                const normalizedInput = houseName.toLowerCase();
                return (
                    normalizedInput === h.name.toLowerCase() ||
                    (normalizedInput === "saviour" && h.name === "Jesus Christ Our Saviour") ||
                    (normalizedInput === "holy ghost baptizer" && h.name === "Jesus Christ The Holy Ghost Baptizer") ||
                    (normalizedInput === "healer" && h.name === "Jesus Christ Our Healer") ||
                    (normalizedInput === "coming king" && h.name === "Jesus Christ Our Coming King")
                );
            });
            return house ? house.key : null;
        };

        async function fetchHouseCounts() {
            try {
                const registrationsRef = collection(db, "registrations");
                const snapshot = await getDocs(registrationsRef);

                const counts = {
                    saviour: 0,
                    holyGhost: 0,
                    healer: 0,
                    comingKing: 0
                };

                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.house) {
                        const houseKey = getHouseKey(data.house);
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
    }, [success]); // Refetch when a new registration is successful

    // Smart house assignment algorithm
    const assignHouse = () => {
        // If we don't have counts yet, fall back to random
        if (Object.keys(houseCounts).length === 0) {
            const random = Math.floor(Math.random() * houses.length);
            return houses[random];
        }

        // Find the house with the minimum count
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

        // If multiple houses have the same minimum count, choose randomly among them
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setFirebaseError(""); // Clear previous errors

        try {
            const registrationsRef = collection(db, "registrations");

            // ✅ Assign house using balanced algorithm
            const house = assignHouse();

            await addDoc(registrationsRef, {
                ...formData,
                house: house.name,
                color: house.color,
                createdAt: serverTimestamp(),
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
            });

            setErrors({});
        } catch (err) {
            console.error("Firebase Error: ", err);
            setFirebaseError(err.message || "Something went wrong. Please check your Firebase configuration.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
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
                                        {house.name}: {houseCounts[house.key] || 0}
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
                                Gender *
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19-7"></path>
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
            </div>
        </div>
    );
}