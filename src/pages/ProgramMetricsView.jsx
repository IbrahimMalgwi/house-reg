import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import RoleRoute from "../components/RoleRoute";

// Reuse the same constants
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700" },
    PURPLE: { name: "Jesus our coming King", color: "#800080" }
};

export default function ProgramMetricsView() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, spiritual, injuries, wins

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const q = query(
                    collection(db, "programMetrics"),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const metricsList = [];
                querySnapshot.forEach((doc) => {
                    metricsList.push({ id: doc.id, ...doc.data() });
                });
                setMetrics(metricsList);
            } catch (err) {
                console.error("Error fetching program metrics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    // Helper function to find team by name
    const findTeamByName = (teamName) => {
        return Object.values(TEAMS).find(team => team.name === teamName);
    };

    // Filter metrics based on selection
    const filteredMetrics = metrics.filter(metric => {
        if (filter === "spiritual") {
            return metric.decisionForChrist || metric.holyGhostBaptism;
        }
        if (filter === "injuries") {
            return metric.injured;
        }
        if (filter === "wins") {
            return metric.teamWin;
        }
        return true; // "all"
    });

    if (loading) {
        return (
            <RoleRoute allowedRoles={["staff", "user"]}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading program metrics...</p>
                    </div>
                </div>
            </RoleRoute>
        );
    }

    return (
        <RoleRoute allowedRoles={["staff", "user"]}>
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Program Metrics Dashboard
                        </h1>
                        <p className="mt-2 text-gray-600">
                            View spiritual decisions, injuries, counseling, and team wins
                        </p>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filter === "all"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300"
                            }`}
                        >
                            All Metrics
                        </button>
                        <button
                            onClick={() => setFilter("spiritual")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filter === "spiritual"
                                    ? "bg-green-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300"
                            }`}
                        >
                            Spiritual Decisions
                        </button>
                        <button
                            onClick={() => setFilter("injuries")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filter === "injuries"
                                    ? "bg-red-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300"
                            }`}
                        >
                            Injuries
                        </button>
                        <button
                            onClick={() => setFilter("wins")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filter === "wins"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 border border-gray-300"
                            }`}
                        >
                            Team Wins
                        </button>
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMetrics.map((metric) => {
                            const team = findTeamByName(metric.winningTeam);
                            const teamColor = team ? team.color : 'transparent';

                            return (
                                <div key={metric.id} className="bg-white rounded-lg shadow-md p-6">
                                    {/* Participant Header */}
                                    <div className="border-b border-gray-200 pb-4 mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {metric.participantName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {metric.eventDate}
                                        </p>
                                    </div>

                                    {/* Spiritual Decisions */}
                                    {(metric.decisionForChrist || metric.holyGhostBaptism) && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Spiritual Decisions</h4>
                                            <div className="space-y-1">
                                                {metric.decisionForChrist && (
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                        <span className="text-sm text-green-700">Decision for Christ</span>
                                                    </div>
                                                )}
                                                {metric.holyGhostBaptism && (
                                                    <div className="flex items-center">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                        <span className="text-sm text-blue-700">Holy Ghost Baptism</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Injuries */}
                                    {metric.injured && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Injury Report</h4>
                                            <div className="flex items-center text-red-600">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                                <span className="text-sm">Participant was injured</span>
                                            </div>
                                            {metric.injuryDetails && (
                                                <p className="text-sm text-gray-600 mt-1">{metric.injuryDetails}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Counseling */}
                                    {metric.receiveCounseling && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Counseling</h4>
                                            <div className="flex items-center text-purple-600">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                                <span className="text-sm">Received counseling</span>
                                            </div>
                                            {metric.counselingDetails && (
                                                <p className="text-sm text-gray-600 mt-1">{metric.counselingDetails}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Team Wins */}
                                    {metric.teamWin && metric.winningTeam && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Team Achievement</h4>
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: teamColor }}
                                                ></div>
                                                <span className="text-sm font-medium">
                          {metric.winningTeam} - {metric.position}
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {metric.sportCategory}
                                                {metric.sportGender && ` (${metric.sportGender})`}
                                                {metric.ageGroup && ` - ${metric.ageGroup}`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Record Date */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Recorded: {metric.createdAt?.toDate
                                            ? metric.createdAt.toDate().toLocaleDateString()
                                            : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredMetrics.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No program metrics found.</p>
                        </div>
                    )}
                </div>
            </div>
        </RoleRoute>
    );
}