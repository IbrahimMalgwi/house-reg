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
import EditStaffForm from "../../components/EditStaffForm";

export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");

  // READ: Fetch all staff registrations
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "staffRegistrations"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const staffList = [];
        querySnapshot.forEach((doc) => {
          staffList.push({ id: doc.id, ...doc.data() });
        });
        setStaff(staffList);
        setFirebaseError("");
      } catch (err) {
        console.error("Error fetching staff:", err);
        setFirebaseError("Failed to load staff registrations: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // UPDATE: Open modal for editing
  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setShowEditModal(true);
  };

  // Function to handle the actual update
  const handleUpdate = async (updatedData) => {
    try {
      const staffRef = doc(db, "staffRegistrations", editingStaff.id);
      // Prepare data for update
      const { id, createdAt, submittedByUid, submittedByEmail, submittedByName, registrationType, ...dataToUpdate } = updatedData;

      // Handle designation logic
      if (dataToUpdate.designation === "Other") {
        dataToUpdate.finalDesignation = dataToUpdate.otherDesignation;
      } else {
        dataToUpdate.finalDesignation = dataToUpdate.designation;
        dataToUpdate.otherDesignation = "";
      }

      dataToUpdate.updatedAt = new Date();

      await updateDoc(staffRef, dataToUpdate);

      // Update local state
      setStaff(prevStaff =>
        prevStaff.map(member =>
          member.id === editingStaff.id
            ? { ...member, ...dataToUpdate }
            : member
        )
      );

      setShowEditModal(false);
      setEditingStaff(null);
      setFirebaseError("");
    } catch (err) {
      console.error("Error updating staff:", err);
      setFirebaseError("Failed to update staff registration: " + err.message);
    }
  };

  // DELETE: Remove a staff registration
  const handleDelete = async (staffId, staffName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the registration for ${staffName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "staffRegistrations", staffId));
      setStaff(staff.filter((member) => member.id !== staffId));
      setFirebaseError("");
    } catch (err) {
      console.error("Error deleting staff:", err);
      setFirebaseError("Failed to delete staff registration: " + err.message);
    }
  };

  if (loading) {
    return (
      <RoleRoute allowedRoles={["admin"]}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff registrations...</p>
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
              Manage Staff Registrations
            </h1>
            <p className="mt-2 text-gray-600">
              View, edit, and delete all staff registrations.
            </p>
          </div>

          {firebaseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{firebaseError}</p>
            </div>
          )}

          {/* Staff Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
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
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          📞 {member.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          ✉️ {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                          {member.finalDesignation || member.designation}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.createdAt?.toDate
                          ? member.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
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
            {staff.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No staff registrations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && editingStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit Staff Registration
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStaff(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <EditStaffForm
                  staffMember={editingStaff}
                  onSave={handleUpdate}
                  onCancel={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
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