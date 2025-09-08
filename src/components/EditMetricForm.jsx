import React, { useState } from "react";

// Reuse the same constants from the form
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700" },
    PURPLE: { name: "Jesus our coming King", color: "#800080" }
};

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

const POSITIONS = ["1st Place", "2nd Place", "3rd Place"];
const GENDERS = ["Male", "Female"];
const AGE_GROUPS = ["Under 13", "Under 15", "Under 16", "Under 17", "Open"];

export default function EditMetricForm({ metric, onSave, onCancel }) {
    // Pre-populate form with existing data
    const [formData, setFormData] = useState({
        participantName: metric.participantName || "",
        decisionForChrist: metric.decisionForChrist || false,
        holyGhostBaptism: metric.holyGhostBaptism || false,
        injured: metric.injured || false,
        injuryDetails: metric.injuryDetails || "",
        receiveCounseling: metric.receiveCounseling || false,
        counselingDetails: metric.counselingDetails || "",
        teamWin: metric.teamWin || false,
        winningTeam: metric.winningTeam || "",
        position: metric.position || "",
        sportCategory: metric.sportCategory || "",
        sportGender: metric.sportGender || "",
        ageGroup: metric.ageGroup || "",
        eventDate: metric.eventDate || new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.participantName.trim()) {
            newErrors.participantName = "Participant name is required";
        }

        if (!formData.eventDate) {
            newErrors.eventDate = "Event date is required";
        }

        if (formData.teamWin) {
            if (!formData.winningTeam) {
                newErrors.winningTeam = "Winning team is required";
            }
            if (!formData.position) {
                newErrors.position = "Position is required";
            }
            if (!formData.sportCategory) {
                newErrors.sportCategory = "Sport category is required";
            }
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

    // Get selected sport to determine if we need gender/age group fields
    const selectedSport = SPORTS.find(sport => sport.name === formData.sportCategory);
    const showGenderField = selectedSport && selectedSport.hasGender;
    const showAgeGroupField = selectedSport && selectedSport.hasAgeGroup;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Participant Information */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participant Name *
                </label>
                <input
                    type="text"
                    name="participantName"
                    value={formData.participantName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.participantName ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                />
                {errors.participantName && (
                    <p className="mt-1 text-sm text-red-500">{errors.participantName}</p>
                )}
            </div>

            {/* Spiritual Decisions */}
            <div className="space-y-2">
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

            {/* Injuries */}
            <div className="flex items-center">
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
                    />
                </div>
            )}

            {/* Counseling */}
            <div className="flex items-center">
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
                    />
                </div>
            )}

            {/* Team Wins */}
            <div className="flex items-center">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Winning Team *
                        </label>
                        <select
                            name="winningTeam"
                            value={formData.winningTeam}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                errors.winningTeam ? "border-red-500" : "border-gray-300"
                            }`}
                            style={{
                                borderColor: formData.winningTeam ? selectedTeamColor : '#d1d5db'
                            }}
                        >
                            <option value="">Select Team</option>
                            {Object.values(TEAMS).map(team => (
                                <option key={team.name} value={team.name}>{team.name}</option>
                            ))}
                        </select>
                        {errors.winningTeam && (
                            <p className="mt-1 text-sm text-red-500">{errors.winningTeam}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position *
                        </label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                errors.position ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <option value="">Select Position</option>
                            {POSITIONS.map(position => (
                                <option key={position} value={position}>{position}</option>
                            ))}
                        </select>
                        {errors.position && (
                            <p className="mt-1 text-sm text-red-500">{errors.position}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sport Category *
                        </label>
                        <select
                            name="sportCategory"
                            value={formData.sportCategory}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                errors.sportCategory ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <option value="">Select Sport</option>
                            {SPORTS.map(sport => (
                                <option key={sport.name} value={sport.name}>{sport.name}</option>
                            ))}
                        </select>
                        {errors.sportCategory && (
                            <p className="mt-1 text-sm text-red-500">{errors.sportCategory}</p>
                        )}
                    </div>

                    {/* Gender Selection */}
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
                            >
                                <option value="">Select Gender</option>
                                {GENDERS.map(gender => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Age Group Selection */}
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

            {/* Event Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                </label>
                <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className={`w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        errors.eventDate ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.eventDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.eventDate}</p>
                )}
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