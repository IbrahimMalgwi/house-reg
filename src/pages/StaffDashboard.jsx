// src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";


export default function StaffDashboard() {
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStaff: 0,
        byDesignation: {}
    });

    useEffect(() => {
        fetchStaffData();
    }, []);

    const fetchStaffData = async () => {
        try {
            const staffRef = collection(db, "staffRegistrations");
            const querySnapshot = await getDocs(staffRef);

            const staffMembers = [];
            const designationCount = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                staffMembers.push({ id: doc.id, ...data });

                // Count by designation
                const designation = data.finalDesignation || data.designation;
                designationCount[designation] = (designationCount[designation] || 0) + 1;
            });

            setStaffData(staffMembers);
            setStats({
                totalStaff: staffMembers.length,
                byDesignation: designationCount
            });
        } catch (error) {
            console.error("Error fetching staff data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (

                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>

        );
    }

    return (

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Staff Analytics Dashboard</h1>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Total Staff</h3>
                        <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalStaff}</p>
                    </div>

                    {Object.entries(stats.byDesignation).map(([designation, count]) => (
                        <div key={designation} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{designation}</h3>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{count}</p>
                        </div>
                    ))}
                </div>

                {/* Staff List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Staff Members</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Organization</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Designation</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {staffData.map((staff) => (
                                <tr key={staff.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{staff.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{staff.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{staff.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{staff.organization}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {staff.finalDesignation || staff.designation}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

    );
}