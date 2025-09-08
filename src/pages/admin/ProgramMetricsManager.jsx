import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
} from "firebase/firestore";
import RoleRoute from "../../components/RoleRoute";
import EditMetricForm from "../../components/EditMetricForm";

// Reuse the same constants from the form
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700" },
    PURPLE: { name: "Jesus our coming King", color: "#800080" }
};

export default function ProgramMetricsManager() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMetric, setEditingMetric] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [firebaseError, setFirebaseError] = useState("");

    // READ: Fetch all program metrics
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
                setFirebaseError("");
            } catch (err) {
                console.error("Error fetching program metrics:", err);
                setFirebaseError("Failed to load program metrics: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    // UPDATE: Open modal for editing
    const handleEdit = (metric) => {
        setEditingMetric(metric);
        setShowEditModal(true);
    };

    // Function to handle the actual update
    const handleUpdate = async (updatedData) => {
        try {
            const metricRef = doc(db, "programMetrics", editingMetric.id);
            // Prepare data for update
            const { id, createdAt, ...dataToUpdate } = updatedData;
            dataToUpdate.updatedAt = new Date();

            await updateDoc(metricRef, dataToUpdate);

            // Update local state
            setMetrics(prevMetrics =>
                prevMetrics.map(metric =>
                    metric.id === editingMetric.id
                        ? { ...metric, ...dataToUpdate }
                        : metric
                )
            );

            setShowEditModal(false);
            setEditingMetric(null);
            setFirebaseError("");
        } catch (err) {
            console.error("Error updating metric:", err);
            setFirebaseError("Failed to update program metric: " + err.message);
        }
    };

    // DELETE: Remove a program metric
    const handleDelete = async (metricId, participantName) => {
        if (
            !window.confirm(
                `Are you sure you want to delete the metrics record for ${participantName}? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            await deleteDoc(doc(db, "programMetrics", metricId));
            setMetrics(metrics.filter((metric) => metric.id !== metricId));
            setFirebaseError("");
        } catch (err) {
            console.error("Error deleting metric:", err);
            setFirebaseError("Failed to delete program metric: " + err.message);
        }
    };

    // Helper function to find team by name
    const findTeamByName = (teamName) => {
        return Object.values(TEAMS).find(team => team.name === teamName);
    };

    if (loading) {
        return (
            <RoleRoute allowedRoles={["admin"]}>
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
        <RoleRoute allowedRoles={["admin"]}>
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Manage Program Metrics
                        </h1>
                        <p className="mt-2 text-gray-600">
                            View, edit, and delete all program metrics records.
                        </p>
                    </div>

                    {firebaseError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            <p className="font-medium">Error:</p>
                            <p className="text-sm">{firebaseError}</p>
                        </div>
                    )}

                    {/* Metrics Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Participant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Spiritual Decisions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Team Wins
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {metrics.map((metric) => {
                                    const team = findTeamByName(metric.winningTeam);
                                    const teamColor = team ? team.color : 'transparent';

                                    return (
                                        <tr key={metric.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {metric.participantName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {metric.eventDate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 space-y-1">
                                                    {metric.decisionForChrist && (
                                                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                ✓ Decision for Christ
                              </span>
                                                    )}
                                                    {metric.holyGhostBaptism && (
                                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                ✓ Holy Ghost Baptism
                              </span>
                                                    )}
                                                    {metric.injured && (
                                                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                ⚠️ Injured
                              </span>
                                                    )}
                                                    {metric.receiveCounseling && (
                                                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                💬 Counseling
                              </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {metric.teamWin && metric.winningTeam ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: teamColor }}
                                                        ></div>
                                                        <span className="text-sm font-medium">
                                {metric.winningTeam} - {metric.position}
                              </span>
                                                        {metric.sportCategory && (
                                                            <span className="text-sm text-gray-500">
                                  ({metric.sportCategory})
                                </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {metric.createdAt?.toDate
                                                    ? metric.createdAt.toDate().toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(metric)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(metric.id, metric.participantName)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                        {metrics.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No program metrics found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && editingMetric && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Edit Program Metric
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingMetric(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <EditMetricForm
                                    metric={editingMetric}
                                    onSave={handleUpdate}
                                    onCancel={() => {
                                        setShowEditModal(false);
                                        setEditingMetric(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleRoute>
    );
}