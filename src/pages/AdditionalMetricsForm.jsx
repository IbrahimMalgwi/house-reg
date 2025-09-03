// src/pages/AdditionalMetricsForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Define teams with updated names
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700" },
    PURPLE: { name: "Jesus our coming King", color: "#800080" }
};

// Define updated sports categories
const SPORTS = [
    "Football",
    "Basketball",
    "Volleyball",
    "Long Jump",
    "Shot Put",
    "100m",
    "200m",
    "400m",
    "4x100m Relay",
    "4x400m Relay",
    "Table Tennis",
    "Scrabble",
    "Chess"
];

// Define positions for winners
const POSITIONS = ["1st Place", "2nd Place", "3rd Place"];

export default function AdditionalMetricsForm() {
    const [formData, setFormData] = useState({
        participantName: "",
        decisionForChrist: false,
        holyGhostBaptism: false,
        injured: false,
        injuryDetails: "",
        receiveCounseling: false,
        counselingDetails: "",
        teamWin: false,
        winningTeam: "",
        position: "",
        sportCategory: "",
        eventDate: new Date().toISOString().split('T')[0]
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addDoc(collection(db, "programMetrics"), {
                ...formData,
                createdAt: serverTimestamp()
            });

            setSuccess(true);
            // Reset form
            setFormData({
                participantName: "",
                decisionForChrist: false,
                holyGhostBaptism: false,
                injured: false,
                injuryDetails: "",
                receiveCounseling: false,
                counselingDetails: "",
                teamWin: false,
                winningTeam: "",
                position: "",
                sportCategory: "",
                eventDate: new Date().toISOString().split('T')[0]
            });

            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("There was an error submitting the form. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="text-center mb-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl">
                    <h1 className="text-3xl font-bold mb-2">Program Metrics Form</h1>
                    <p className="text-xl opacity-90">Record spiritual decisions, injuries, counseling, and team wins</p>
                </div>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        Data submitted successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Participant Information */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Participant Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Participant Name
                            </label>
                            <input
                                type="text"
                                name="participantName"
                                value={formData.participantName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                required
                                placeholder="Enter participant's full name"
                            />
                        </div>
                    </div>

                    {/* Spiritual Decisions */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Spiritual Decisions</h3>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="decisionForChrist"
                                    name="decisionForChrist"
                                    checked={formData.decisionForChrist}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="decisionForChrist" className="ml-2 block text-sm text-gray-900">
                                    Made decision for Christ
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="holyGhostBaptism"
                                    name="holyGhostBaptism"
                                    checked={formData.holyGhostBaptism}
                                    onChange= {handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="holyGhostBaptism" className="ml-2 block text-sm text-gray-900">
                                    Received Holy Ghost Baptism
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Injuries */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Injury Report</h3>

                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="injured"
                                name="injured"
                                checked={formData.injured}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="injured" className="ml-2 block text-sm text-gray-900">
                                Participant was injured
                            </label>
                        </div>

                        {formData.injured && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Injury Details
                                </label>
                                <textarea
                                    name="injuryDetails"
                                    value={formData.injuryDetails}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Describe the injury and any treatment provided"
                                />
                            </div>
                        )}
                    </div>

                    {/* Counseling */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Counseling</h3>

                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="receiveCounseling"
                                name="receiveCounseling"
                                checked={formData.receiveCounseling}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="receiveCounseling" className="ml-2 block text-sm text-gray-900">
                                Received counseling
                            </label>
                        </div>

                        {formData.receiveCounseling && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Counseling Details
                                </label>
                                <textarea
                                    name="counselingDetails"
                                    value={formData.counselingDetails}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Describe the counseling session and any follow-up needed"
                                />
                            </div>
                        )}
                    </div>

                    {/* Team Wins */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Wins & Positions</h3>

                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="teamWin"
                                name="teamWin"
                                checked={formData.teamWin}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="teamWin" className="ml-2 block text-sm text-gray-900">
                                Record team win and position
                            </label>
                        </div>

                        {formData.teamWin && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Winning Team
                                    </label>
                                    <select
                                        name="winningTeam"
                                        value={formData.winningTeam}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        required={formData.teamWin}
                                    >
                                        <option value="">Select Team</option>
                                        {Object.keys(TEAMS).map(key => (
                                            <option key={key} value={TEAMS[key].name}>
                                                {TEAMS[key].name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position
                                    </label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        required={formData.teamWin}
                                    >
                                        <option value="">Select Position</option>
                                        {POSITIONS.map(position => (
                                            <option key={position} value={position}>
                                                {position}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sport Category
                                    </label>
                                    <select
                                        name="sportCategory"
                                        value={formData.sportCategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        required={formData.teamWin}
                                    >
                                        <option value="">Select Sport</option>
                                        {SPORTS.map(sport => (
                                            <option key={sport} value={sport}>{sport}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date
                        </label>
                        <input
                            type="date"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleChange}
                            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Metrics'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}