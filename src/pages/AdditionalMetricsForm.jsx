// src/pages/AdditionalMetricsForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Define teams with updated names and colors
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700" },
    PURPLE: { name: "Jesus our coming King", color: "#800080" }
};

// Define updated sports categories with gender and age group requirements
const SPORTS = [
    { name: "Basketball", hasGender: true, hasAgeGroup: false },
    { name: "Volleyball", hasGender: true, hasAgeGroup: false },
    { name: "Football", hasGender: true, hasAgeGroup: true },
    { name: "Relay", hasGender: false, hasAgeGroup: false },
    { name: "50 Meters", hasGender: true, hasAgeGroup: false },
    { name: "70 Meters", hasGender: true, hasAgeGroup: false },
    { name: "100 Meters", hasGender: true, hasAgeGroup: false },
    { name: "100 Meters Under 15", hasGender: true, hasAgeGroup: true },
    { name: "100 Meters Under 17 Boys", hasGender: true, hasAgeGroup: true },
    { name: "800 Meters", hasGender: true, hasAgeGroup: false },
    { name: "4 x 100 Meters Relay", hasGender: true, hasAgeGroup: false },
    { name: "4 x 400 Meters Relay", hasGender: true, hasAgeGroup: false },
    { name: "Long Jump", hasGender: true, hasAgeGroup: false },
    { name: "Shot Put", hasGender: true, hasAgeGroup: false }
];

// Define positions for winners
const POSITIONS = ["1st Place", "2nd Place", "3rd Place"];
const GENDERS = ["Male", "Female"];
const AGE_GROUPS = ["Under 13", "Under 15", "Under 16", "Under 17", "Open"];

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
        sportGender: "",
        ageGroup: "",
        eventDate: new Date().toISOString().split('T')[0]
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);

    // Helper function to find team by name
    const findTeamByName = (teamName) => {
        return Object.values(TEAMS).find(team => team.name === teamName);
    };

    // Get the currently selected team's color
    const selectedTeam = findTeamByName(formData.winningTeam);
    const selectedTeamColor = selectedTeam ? selectedTeam.color : '#4f46e5';

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

            // Set success data for the modal
            setSuccess({
                participantName: formData.participantName,
                decisionForChrist: formData.decisionForChrist,
                holyGhostBaptism: formData.holyGhostBaptism,
                teamWin: formData.teamWin,
                winningTeam: formData.winningTeam,
                position: formData.position,
                sportCategory: formData.sportCategory,
                sportGender: formData.sportGender,
                ageGroup: formData.ageGroup
            });

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
                sportGender: "",
                ageGroup: "",
                eventDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("There was an error submitting the form. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Get selected sport to determine if we need gender/age group fields
    const selectedSport = SPORTS.find(sport => sport.name === formData.sportCategory);
    const showGenderField = selectedSport && selectedSport.hasGender;
    const showAgeGroupField = selectedSport && selectedSport.hasAgeGroup;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="text-center mb-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl">
                    <h1 className="text-3xl font-bold mb-2">Program Metrics Form</h1>
                    <p className="text-xl opacity-90">Record spiritual decisions, injuries, counseling, and team wins</p>
                </div>

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
                                    onChange={handleChange}
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                        style={{
                                            boxShadow: formData.winningTeam ? `0 0 0 3px ${selectedTeamColor}40` : 'none',
                                            borderColor: formData.winningTeam ? selectedTeamColor : '#d1d5db'
                                        }}
                                        required={formData.teamWin}
                                    >
                                        <option value="">Select Team</option>
                                        {Object.values(TEAMS).map(team => (
                                            <option key={team.name} value={team.name}>
                                                {team.name}
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
                                            <option key={sport.name} value={sport.name}>{sport.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Gender Selection - Only show for sports that require it */}
                                {showGenderField && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender Category
                                        </label>
                                        <select
                                            name="sportGender"
                                            value={formData.sportGender}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                            required={formData.teamWin}
                                        >
                                            <option value="">Select Gender</option>
                                            {GENDERS.map(gender => (
                                                <option key={gender} value={gender}>{gender}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Age Group Selection - Only show for sports that require it */}
                                {showAgeGroupField && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Age Group
                                        </label>
                                        <select
                                            name="ageGroup"
                                            value={formData.ageGroup}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                            required={formData.teamWin}
                                        >
                                            <option value="">Select Age Group</option>
                                            {AGE_GROUPS.map(group => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
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

            {/* Success Modal */}
            {success && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    {/* Get the team color for the success modal */}
                    {(() => {
                        const successTeam = findTeamByName(success.winningTeam);
                        const successTeamColor = successTeam ? successTeam.color : '#4f46e5';

                        return (
                            <div
                                className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full animate-pop-in"
                                style={{ borderTop: `8px solid ${successTeamColor}` }}
                            >
                                <div className="mb-4">
                                    <div
                                        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${successTeamColor}20` }}
                                    >
                                        <svg
                                            className="w-8 h-8"
                                            style={{ color: successTeamColor }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    Metrics Recorded Successfully!
                                </h3>

                                <p className="mt-3 text-gray-600">
                                    Data for <strong className="text-gray-800">{success.participantName}</strong> has been recorded.
                                </p>

                                {success.decisionForChrist && (
                                    <div className="my-2 p-2 bg-green-100 rounded-lg">
                                        <span className="text-green-700 font-medium">✓ Decision for Christ</span>
                                    </div>
                                )}

                                {success.holyGhostBaptism && (
                                    <div className="my-2 p-2 bg-blue-100 rounded-lg">
                                        <span className="text-blue-700 font-medium">✓ Holy Ghost Baptism</span>
                                    </div>
                                )}

                                {success.teamWin && success.winningTeam && (
                                    <div
                                        className="my-2 p-2 rounded-lg"
                                        style={{ backgroundColor: `${successTeamColor}20` }}
                                    >
                                        <span className="font-medium" style={{ color: successTeamColor }}>
                                            {success.winningTeam} - {success.position} in {success.sportCategory}
                                            {success.sportGender && ` (${success.sportGender})`}
                                            {success.ageGroup && ` - ${success.ageGroup}`}
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSuccess(null)}
                                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}