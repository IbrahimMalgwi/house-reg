import React, { useState, useEffect } from "react";
import EditForm from "../../components/EditRegistrationForm";
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
import AdminRoute from "../../components/AdminRoute";


export default function RegistrationsManager() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRegistration, setEditingRegistration] = useState(null); // Holds the data we are editing
    const [showEditModal, setShowEditModal] = useState(false);
    const [firebaseError, setFirebaseError] = useState("");

    // READ: Fetch all registrations
    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                setLoading(true);
                // Create a query to order by creation date, newest first
                const q = query(
                    collection(db, "registrations"),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const registrationsList = [];
                querySnapshot.forEach((doc) => {
                    // Include the document ID which is needed for update/delete
                    registrationsList.push({ id: doc.id, ...doc.data() });
                });
                setRegistrations(registrationsList);
                setFirebaseError("");
            } catch (err) {
                console.error("Error fetching registrations:", err);
                setFirebaseError("Failed to load registrations: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []); // Empty dependency array to run only on mount

    // UPDATE: Open modal for editing
    const handleEdit = (reg) => {
        setEditingRegistration(reg);
        setShowEditModal(true);
    };

    // Function to handle the actual update after form submission
    const handleUpdate = async (updatedData) => {
        try {
            // Create a reference to the specific document
            const regRef = doc(db, "registrations", editingRegistration.id);
            // Prepare the data to update. We don't want to change the ID or house assignment logic here.
            // We'll omit the id and only update the fields from the form.
            const { id, house, color, createdAt, ...dataToUpdate } = updatedData;
            // Add a timestamp for the update
            dataToUpdate.updatedAt = new Date();

            await updateDoc(regRef, dataToUpdate);

            // Update the local state optimistically
            setRegistrations(prevRegs =>
                prevRegs.map(reg =>
                    reg.id === editingRegistration.id
                        ? { ...reg, ...dataToUpdate }
                        : reg
                )
            );

            setShowEditModal(false);
            setEditingRegistration(null);
            setFirebaseError("");
        } catch (err) {
            console.error("Error updating document:", err);
            setFirebaseError("Failed to update registration: " + err.message);
        }
    };

    // DELETE: Remove a registration
    const handleDelete = async (regId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this registration? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            await deleteDoc(doc(db, "registrations", regId));
            // Optimistic update: remove from local state
            setRegistrations(registrations.filter((reg) => reg.id !== regId));
            setFirebaseError("");
        } catch (err) {
            console.error("Error deleting document:", err);
            setFirebaseError("Failed to delete registration: " + err.message);
        }
    };

    if (loading) {
        return (
            <AdminRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading registrations...</p>
                    </div>
                </div>
            </AdminRoute>
        );
    }

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Manage Registrations
                        </h1>
                        <p className="mt-2 text-gray-600">
                            View, edit, and delete all teen registrations.
                        </p>
                    </div>

                    {firebaseError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            <p className="font-medium">Error:</p>
                            <p className="text-sm">{firebaseError}</p>
                        </div>
                    )}

                    {/* Registrations Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Age / Sex
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Religion
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        House
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Registered
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {registrations.map((reg) => (
                                    <tr key={reg.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {reg.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{reg.age}</div>
                                            <div className="text-sm text-gray-500">{reg.sex}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.religion}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {reg.phone && (
                                                <div className="text-sm text-gray-900">
                                                    📞 {reg.phone}
                                                </div>
                                            )}
                                            {reg.email && (
                                                <div className="text-sm text-gray-500">
                                                    ✉️ {reg.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span
                            className="px-2 py-1 text-xs font-medium rounded-full text-white"
                            style={{ backgroundColor: reg.color || "#6b7280" }}
                        >
                          {reg.house}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.createdAt?.toDate
                                                ? reg.createdAt.toDate().toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(reg)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(reg.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {registrations.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No registrations found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && editingRegistration && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Edit Registration
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingRegistration(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {/* We will create an EditForm component next */}
                                <EditForm
                                    registration={editingRegistration}
                                    onSave={handleUpdate}
                                    onCancel={() => {
                                        setShowEditModal(false);
                                        setEditingRegistration(null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminRoute>
    );
}