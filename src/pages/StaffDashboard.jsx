// src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { CSVLink } from "react-csv";

// Import Chart.js components
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    DoughnutController
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    DoughnutController
);

// Define the exact designations in the desired order
const DESIGNATIONS = [
    "Counselor/Marshal",
    "Medic",
    "Media",
    "Sound",
    "Welfare",
    "Data",
    "Security",
    "Other"
];

// Updated Color palette using the same scheme as Dashboard
const DESIGNATION_COLORS = {
    "Counselor/Marshal": "#FF0000", // Red
    "Medic": "#0000FF", // Blue
    "Media": "#800080", // Purple
    "Sound": "#FFD700", // Gold/Yellow
    "Welfare": "#4f46e5", // Indigo
    "Data": "#6366f1", // Lighter Indigo
    "Security": "#10b981", // Green
    "Other": "#6b7280" // Gray
};

// Color palette for organizations - using vibrant, distinct colors
const ORGANIZATION_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B',
    '#FB5607', '#8338EC', '#3A86FF', '#FF006E',
    '#04E762', '#F9C80E', '#F86624', '#662E9B',
    '#43BCCD', '#F72585', '#7209B7', '#3A0CA3',
    '#4361EE', '#4CC9F0', '#F72585', '#560BAD'
];

export default function StaffDashboard() {
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [stats, setStats] = useState({
        totalStaff: 0,
        byDesignation: {},
        byOrganization: {},
        recentRegistrations: 0
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
            const organizationCount = {};
            let recentCount = 0;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Initialize all designations with 0 count
            DESIGNATIONS.forEach(designation => {
                designationCount[designation] = 0;
            });

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const staffMember = { id: doc.id, ...data };
                staffMembers.push(staffMember);

                // Count by designation - use the exact designation or map to "Other"
                let designation = data.finalDesignation || data.designation || "Unknown";

                // If designation is not in our list, categorize as "Other"
                if (!DESIGNATIONS.includes(designation)) {
                    designation = "Other";
                }

                designationCount[designation] = (designationCount[designation] || 0) + 1;

                // Count by organization
                const org = data.organization || "Unknown";
                organizationCount[org] = (organizationCount[org] || 0) + 1;

                // Count recent registrations (last 7 days)
                if (data.createdAt && data.createdAt.seconds) {
                    const regDate = new Date(data.createdAt.seconds * 1000);
                    if (regDate > oneWeekAgo) {
                        recentCount++;
                    }
                }
            });

            setStaffData(staffMembers);
            setStats({
                totalStaff: staffMembers.length,
                byDesignation: designationCount,
                byOrganization: organizationCount,
                recentRegistrations: recentCount
            });
        } catch (error) {
            console.error("Error fetching staff data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter staff data based on search term
    const filteredStaff = staffData.filter(staff =>
        staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone?.includes(searchTerm) ||
        staff.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.finalDesignation || staff.designation)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const currentItems = filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Prepare data for CSV export
    const csvData = {
        data: filteredStaff.map(staff => ({
            Name: staff.name,
            Email: staff.email,
            Phone: staff.phone,
            Organization: staff.organization,
            Designation: staff.finalDesignation || staff.designation,
            RegistrationDate: staff.createdAt ? new Date(staff.createdAt.seconds * 1000).toLocaleDateString() : "Unknown"
        })),
        headers: [
            { label: "Name", key: "Name" },
            { label: "Email", key: "Email" },
            { label: "Phone", key: "Phone" },
            { label: "Organization", key: "Organization" },
            { label: "Designation", key: "Designation" },
            { label: "Registration Date", key: "RegistrationDate" }
        ]
    };

    // Prepare chart data in the correct order
    const orderedDesignationData = DESIGNATIONS.map(designation => ({
        designation,
        count: stats.byDesignation[designation] || 0
    }));

    // Chart data for designations
    const designationChartData = {
        labels: orderedDesignationData.map(item => item.designation),
        datasets: [
            {
                data: orderedDesignationData.map(item => item.count),
                backgroundColor: orderedDesignationData.map(item => DESIGNATION_COLORS[item.designation]),
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const designationChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 11
                    },
                    padding: 15
                }
            }
        }
    };

    // Prepare data for top organizations bar chart
    const topOrganizations = Object.entries(stats.byOrganization)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);

    // Generate different colors for each organization
    const organizationChartData = {
        labels: topOrganizations.map(([org]) => org.length > 20 ? org.substring(0, 20) + '...' : org),
        datasets: [
            {
                label: 'Staff Count',
                data: topOrganizations.map(([, count]) => count),
                backgroundColor: topOrganizations.map((_, index) =>
                    ORGANIZATION_COLORS[index % ORGANIZATION_COLORS.length]
                ),
                borderWidth: 0,
                borderRadius: 6,
                barPercentage: 0.7
            }
        ]
    };

    const organizationChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
                },
                ticks: {
                    stepSize: 1
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    },
                    title: function(context) {
                        const fullOrgName = topOrganizations[context[0].dataIndex][0];
                        return fullOrgName;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading staff analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Marshals Analytics Dashboard</h1>
                <p className="text-xl opacity-90">Comprehensive overview of staff registrations</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                        👥
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Staff</h3>
                    <p className="text-3xl font-bold text-indigo-600">{stats.totalStaff}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
                        📈
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">This Week</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.recentRegistrations}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600">
                        🏢
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Organizations</h3>
                    <p className="text-3xl font-bold text-blue-600">{Object.keys(stats.byOrganization).length}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 text-purple-600">
                        🎯
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Roles</h3>
                    <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.byDesignation).length}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Designation Distribution */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                            🎯
                        </div>
                        <h2 className="text-2xl font-semibold">Designation Distribution</h2>
                    </div>
                    <div className="h-80">
                        <Doughnut data={designationChartData} options={designationChartOptions} />
                    </div>
                </div>

                {/* Top Organizations */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                            🏢
                        </div>
                        <h2 className="text-2xl font-semibold">Top Organizations</h2>
                    </div>
                    <div className="h-80">
                        <Bar data={organizationChartData} options={organizationChartOptions} />
                    </div>
                </div>
            </div>

            {/* Designation Breakdown Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">
                        📊
                    </div>
                    <h2 className="text-2xl font-semibold">Designation Breakdown</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {orderedDesignationData.map(({ designation, count }) => (
                        <div
                            key={designation}
                            className="bg-gray-50 p-4 rounded-lg border-l-4"
                            style={{ borderLeftColor: DESIGNATION_COLORS[designation] }}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-900 text-sm">
                                    {designation}
                                </span>
                                <span className="text-lg font-bold" style={{ color: DESIGNATION_COLORS[designation] }}>
                                    {count}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full"
                                    style={{
                                        width: `${stats.totalStaff > 0 ? (count / stats.totalStaff) * 100 : 0}%`,
                                        backgroundColor: DESIGNATION_COLORS[designation]
                                    }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.totalStaff > 0 ? ((count / stats.totalStaff) * 100).toFixed(1) : 0}% of total
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Staff List with Search and Export */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-2xl font-semibold mb-4 md:mb-0">Staff Members ({filteredStaff.length})</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <CSVLink
                            data={csvData.data}
                            headers={csvData.headers}
                            filename={"staff-registrations.csv"}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
                        >
                            Export CSV
                        </CSVLink>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.length > 0 ? (
                            currentItems.map((staff) => {
                                const designation = staff.finalDesignation || staff.designation;
                                const isCommonDesignation = DESIGNATIONS.includes(designation);
                                const displayDesignation = isCommonDesignation ? designation : "Other";

                                return (
                                    <tr key={staff.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{staff.phone}</div>
                                            <div className="text-sm text-gray-500">{staff.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {staff.organization}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-2 py-1 text-xs font-medium rounded-full"
                                                    style={{
                                                        backgroundColor: `${DESIGNATION_COLORS[displayDesignation]}20`,
                                                        color: DESIGNATION_COLORS[displayDesignation],
                                                        border: `1px solid ${DESIGNATION_COLORS[displayDesignation]}`
                                                    }}
                                                >
                                                    {displayDesignation}
                                                    {!isCommonDesignation && designation !== "Other" && ` (${designation})`}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {staff.createdAt ? new Date(staff.createdAt.seconds * 1000).toLocaleDateString() : "Unknown"}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No staff members found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex-1 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * itemsPerPage, filteredStaff.length)}
                                    </span> of{" "}
                                    <span className="font-medium">{filteredStaff.length}</span> results
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="px-2 py-1 border border-gray-300 rounded-md"
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}