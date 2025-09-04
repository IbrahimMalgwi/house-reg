// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
    HOUSES,
    getShortHouseName,
    getHouseColor,
} from "../utils/houseMapping";
import { CSVLink } from "react-csv";

// Import Chart.js and react-chartjs-2
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

// Registration Table Component
function RegistrationTable({ registrations }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Filter registrations based on search term
    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg =>
            reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.phone?.includes(searchTerm) ||
            reg.house?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.sex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.religion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.fiestaAttendance?.join(", ").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [registrations, searchTerm]);

    // Sort registrations
    const sortedRegistrations = useMemo(() => {
        let sortableItems = [...filteredRegistrations];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredRegistrations, sortConfig]);

    // Get current page items
    const currentItems = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedRegistrations.slice(indexOfFirstItem, indexOfLastItem);
    }, [sortedRegistrations, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(sortedRegistrations.length / itemsPerPage);

    // Handle sort request
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Prepare data for CSV export
    const csvData = useMemo(() => {
        const headers = [
            { label: "Name", key: "name" },
            { label: "Age", key: "age" },
            { label: "Gender", key: "sex" },
            { label: "Religion", key: "religion" },
            { label: "Phone", key: "phone" },
            { label: "Email", key: "email" },
            { label: "House", key: "house" },
            { label: "Sports Fiesta Attendance", key: "fiestaAttendance" },
            { label: "Registration Date", key: "createdAt" }
        ];

        const data = sortedRegistrations.map(reg => ({
            name: reg.name || "",
            age: reg.age || "",
            sex: reg.sex || "",
            religion: reg.religion || "",
            phone: reg.phone || "",
            email: reg.email || "",
            house: reg.house || "",
            fiestaAttendance: reg.fiestaAttendance ? reg.fiestaAttendance.join(", ") : "",
            createdAt: reg.createdAt ? new Date(reg.createdAt.seconds * 1000).toLocaleDateString() : ""
        }));

        return { data, headers };
    }, [sortedRegistrations]);

    // Format date for display
    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-semibold mb-4 md:mb-0">Registration Records</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search registrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <CSVLink
                        data={csvData.data}
                        headers={csvData.headers}
                        filename={"teen-program-registrations.csv"}
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
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('name')}
                        >
                            Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('age')}
                        >
                            Age {sortConfig.key === 'age' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('sex')}
                        >
                            Gender {sortConfig.key === 'sex' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('religion')}
                        >
                            Religion {sortConfig.key === 'religion' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('house')}
                        >
                            House {sortConfig.key === 'house' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SF Attendance
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('createdAt')}
                        >
                            Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                        currentItems.map((registration, index) => (
                            <tr key={registration.id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{registration.age}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {registration.sex}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {registration.religion}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{registration.phone}</div>
                                    <div className="text-sm text-gray-500">{registration.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                                          style={{
                                              backgroundColor: getHouseColor(
                                                  Object.keys(HOUSES).find(key => HOUSES[key].name === registration.house)
                                              )
                                          }}
                                    >
                                        {getShortHouseName(registration.house)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {registration.fiestaAttendance?.join(", ") || "None"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(registration.createdAt)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                No registrations found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                            <span className="font-medium">
                                {Math.min(currentPage * itemsPerPage, sortedRegistrations.length)}
                            </span> of{" "}
                            <span className="font-medium">{sortedRegistrations.length}</span> results
                        </p>
                    </div>
                    <div>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="mr-4 px-2 py-1 border border-gray-300 rounded-md"
                        >
                            <option value="5">5 per page</option>
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            currentPage === pageNum
                                                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const snapshot = await getDocs(collection(db, "registrations"));
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            // Normalize house values
            const normalized = docs.map((r) => {
                const houseValue = r.house?.toLowerCase() || "";
                let normalizedHouse = null;

                // Check for "Our Coming King" variations
                if (houseValue.includes("coming king") || houseValue.includes("our coming king")) {
                    normalizedHouse = HOUSES.PURPLE.name;
                }
                // Check for "Our Saviour" variations
                else if (houseValue.includes("saviour") || houseValue.includes("savior")) {
                    normalizedHouse = HOUSES.RED.name;
                }
                // Check for "Our Healer" variations
                else if (houseValue.includes("healer") || houseValue.includes("our healer")) {
                    normalizedHouse = HOUSES.BLUE.name;
                }
                // Check for "Holy Ghost" variations
                else if (houseValue.includes("holy ghost") || houseValue.includes("baptizer")) {
                    normalizedHouse = HOUSES.YELLOW.name;
                }
                // Try to match against HOUSES as fallback
                else {
                    for (const key of Object.keys(HOUSES)) {
                        const h = HOUSES[key];
                        if (
                            houseValue.includes(h.name.toLowerCase()) ||
                            r.houseKey === key
                        ) {
                            normalizedHouse = h.name;
                            break;
                        }
                    }
                }

                // Normalize sex values
                const sexValue = r.sex?.toLowerCase() || "";
                let normalizedSex = "Unknown";

                // Check for exact matches first
                if (sexValue === "male") {
                    normalizedSex = "Male";
                } else if (sexValue === "female") {
                    normalizedSex = "Female";
                } else if (sexValue === "others") {
                    normalizedSex = "Others";
                }
                // Then check for partial matches
                else if (sexValue.includes("male")) {
                    normalizedSex = "Male";
                } else if (sexValue.includes("female")) {
                    normalizedSex = "Female";
                } else if (sexValue.includes("other") || sexValue.includes("prefer") || sexValue.includes("not")) {
                    normalizedSex = "Others";
                }

                // Ensure fiestaAttendance is always an array
                const fiestaAttendance = Array.isArray(r.fiestaAttendance) ? r.fiestaAttendance : [];

                return {
                    ...r,
                    house: normalizedHouse || "Unknown",
                    sex: normalizedSex,
                    fiestaAttendance: fiestaAttendance
                };
            });

            setRegistrations(normalized);
            setLoading(false);
        }
        fetchData();
    }, []);

    const total = registrations.length;

    // Aggregations - Only include known values
    const aggregateData = (key) => {
        const counts = {};
        registrations.forEach((r) => {
            const value = r[key];
            // Only count known values (not "Unknown")
            if (value && value !== "Unknown") {
                counts[value] = (counts[value] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0.0",
        }));
    };

    // Age group calculation
    const getAgeGroups = () => {
        const groups = {
            "13-17": 0,
            "18-25": 0,
            "26+": 0,
        };

        registrations.forEach((r) => {
            if (r.age) {
                const age = parseInt(r.age);
                if (age <= 17) groups["13-17"]++;
                else if (age <= 25) groups["18-25"]++;
                else groups["26+"]++;
            }
        });

        return Object.entries(groups).map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0.0",
        }));
    };

    // Calculate Sports Fiesta attendance statistics
    const getFiestaAttendanceStats = () => {
        const attendanceCounts = {
            "1.0": 0,
            "2.0": 0,
            "3.0": 0,
            "4.0": 0
        };

        const editionParticipation = {
            "First-timers (only 4.0)": 0,
            "Attended 2 editions": 0,
            "Attended 3 editions": 0,
            "Attended all 4 editions": 0
        };

        registrations.forEach(reg => {
            // Count attendance for each edition
            reg.fiestaAttendance?.forEach(edition => {
                if (attendanceCounts.hasOwnProperty(edition)) {
                    attendanceCounts[edition]++;
                }
            });

            // Count participation categories
            const editionCount = reg.fiestaAttendance?.length || 0;
            const hasAllEditions = reg.fiestaAttendance?.includes("1.0") &&
                reg.fiestaAttendance?.includes("2.0") &&
                reg.fiestaAttendance?.includes("3.0") &&
                reg.fiestaAttendance?.includes("4.0");

            if (hasAllEditions) {
                editionParticipation["Attended all 4 editions"]++;
            } else if (editionCount === 1 && reg.fiestaAttendance?.includes("4.0")) {
                editionParticipation["First-timers (only 4.0)"]++;
            } else if (editionCount === 2) {
                editionParticipation["Attended 2 editions"]++;
            } else if (editionCount === 3) {
                editionParticipation["Attended 3 editions"]++;
            }
        });

        return {
            byEdition: Object.entries(attendanceCounts).map(([edition, count]) => ({
                edition,
                count,
                percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
            })),
            byParticipation: Object.entries(editionParticipation).map(([category, count]) => ({
                category,
                count,
                percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
            }))
        };
    };

    const fiestaStats = getFiestaAttendanceStats();
    const houseData = aggregateData("house");
    const sexData = aggregateData("sex");
    const religionData = aggregateData("religion");
    const ageData = getAgeGroups();

    // Ensure we have all gender options even if they're not in the data
    const allGenders = [
        { name: "Male", value: 0, percentage: "0.0" },
        { name: "Female", value: 0, percentage: "0.0" },
        { name: "Others", value: 0, percentage: "0.0" }
    ];

    sexData.forEach(gender => {
        const index = allGenders.findIndex(g => g.name === gender.name);
        if (index !== -1) {
            allGenders[index] = gender;
        }
    });

    // Chart data and options
    const houseChartData = {
        labels: houseData.map(h => getShortHouseName(h.name)),
        datasets: [
            {
                data: houseData.map(h => h.value),
                backgroundColor: houseData.map(h => {
                    const houseKey = Object.keys(HOUSES).find(key => HOUSES[key].name === h.name);
                    return getHouseColor(houseKey);
                }),
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const houseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            }
        },
        cutout: '70%'
    };

    const genderChartData = {
        labels: allGenders.map(g => g.name),
        datasets: [
            {
                data: allGenders.map(g => g.value),
                backgroundColor: ['#FF0000', '#800080', '#FFD700'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const genderChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            }
        }
    };

    const religionChartData = {
        labels: religionData.map(r => r.name),
        datasets: [
            {
                label: 'Participants',
                data: religionData.map(r => r.value),
                backgroundColor: ['#0000FF', '#FFD700', '#800080'],
                borderWidth: 0,
                borderRadius: 6,
                barPercentage: 0.6
            }
        ]
    };

    const religionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
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
            }
        }
    };

    const ageChartData = {
        labels: ageData.map(a => a.name),
        datasets: [
            {
                label: 'Participants',
                data: ageData.map(a => a.value),
                backgroundColor: ['#FF0000', '#0000FF', '#800080'],
                borderWidth: 0,
                borderRadius: 6,
                barPercentage: 0.6
            }
        ]
    };

    const ageChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
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
            }
        }
    };

    const fiestaEditionChartData = {
        labels: fiestaStats.byEdition.map(item => `Sports Fiesta ${item.edition}`),
        datasets: [
            {
                label: 'Participants',
                data: fiestaStats.byEdition.map(item => item.count),
                backgroundColor: ['#FF0000', '#0000FF', '#FFD700', '#800080'],
                borderWidth: 0,
                borderRadius: 6,
                barPercentage: 0.6
            }
        ]
    };

    const fiestaEditionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
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
            }
        }
    };

    const fiestaParticipationChartData = {
        labels: fiestaStats.byParticipation.map(item => item.category),
        datasets: [
            {
                data: fiestaStats.byParticipation.map(item => item.count),
                backgroundColor: ['#FF0000', '#0000FF', '#FFD700', '#800080'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const fiestaParticipationChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Teens Analytics Dashboard</h1>
                <p className="text-xl opacity-90">Comprehensive overview of registrations and distributions</p>
            </header>

            {/* Total Registration Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mr-4 text-indigo-600 text-xl">
                            📊
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold">Total Registrations</h2>
                            <p className="text-gray-500">All participants in the teen program</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-indigo-600">{total}</div>
                        <div className="text-sm text-gray-500">Participants</div>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                            👥
                        </div>
                        <div>
                            <div className="text-sm text-blue-600">Gender Distribution</div>
                            <div className="font-semibold">{allGenders.length} Categories</div>
                        </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                            🏠
                        </div>
                        <div>
                            <div className="text-sm text-purple-600">House Distribution</div>
                            <div className="font-semibold">{houseData.length} Houses</div>
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">
                            🙏
                        </div>
                        <div>
                            <div className="text-sm text-green-600">Religion Distribution</div>
                            <div className="font-semibold">{religionData.length} Categories</div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3 text-yellow-600">
                            🏆
                        </div>
                        <div>
                            <div className="text-sm text-yellow-600">SF Editions</div>
                            <div className="font-semibold">{fiestaStats.byEdition.length} Editions</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* House Distribution Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                            🏠
                        </div>
                        <h2 className="text-2xl font-semibold">House Distribution</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {houseData.map((h) => {
                            const houseKey = Object.keys(HOUSES).find(key => HOUSES[key].name === h.name);
                            const color = getHouseColor(houseKey);

                            return (
                                <div
                                    key={h.name}
                                    className="p-4 rounded-xl text-center text-white shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${color}, ${color}AA)` }}
                                >
                                    <div className="text-sm font-semibold uppercase tracking-wide">
                                        {getShortHouseName(h.name)}
                                    </div>
                                    <div className="text-2xl font-bold my-2">{h.value}</div>
                                    <div className="text-sm opacity-90">({h.percentage}%)</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-80">
                        <Doughnut data={houseChartData} options={houseChartOptions} />
                    </div>
                </div>

                {/* Gender Distribution Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                            👥
                        </div>
                        <h2 className="text-2xl font-semibold">Gender Distribution</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {allGenders.map((g) => {
                            let colorClass = "text-gray-800";

                            if (g.name.toLowerCase().includes("male")) {
                                colorClass = "text-red-600";
                            } else if (g.name.toLowerCase().includes("female")) {
                                colorClass = "text-purple-600";
                            } else if (g.name.toLowerCase().includes("other")) {
                                colorClass = "text-yellow-600";
                            }

                            return (
                                <div key={g.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">{g.name}</span>
                                    <div className="text-right">
                                        <span className={`font-bold text-xl ${colorClass}`}>{g.value}</span>
                                        <span className="text-sm text-gray-500 ml-2">({g.percentage}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-64">
                        <Pie data={genderChartData} options={genderChartOptions} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Religion Distribution Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3 text-red-600">
                            🙏
                        </div>
                        <h2 className="text-2xl font-semibold">Religion Distribution</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {religionData.map((r) => {
                            let colorClass = "text-gray-800";

                            if (r.name.toLowerCase().includes("christian")) {
                                colorClass = "text-blue-600";
                            } else if (r.name.toLowerCase().includes("islam")) {
                                colorClass = "text-yellow-600";
                            } else if (r.name.toLowerCase().includes("other")) {
                                colorClass = "text-purple-600";
                            }

                            return (
                                <div key={r.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">{r.name}</span>
                                    <div className="text-right">
                                        <span className={`font-bold text-xl ${colorClass}`}>{r.value}</span>
                                        <span className="text-sm text-gray-500 ml-2">({r.percentage}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-64">
                        <Bar data={religionChartData} options={religionChartOptions} />
                    </div>
                </div>

                {/* Age Distribution Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 text-yellow-600">
                            🎂
                        </div>
                        <h2 className="text-2xl font-semibold">Age Distribution</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        {ageData.map((a) => {
                            let colorClass = "text-gray-800";

                            if (a.name === "13-17") {
                                colorClass = "text-red-600";
                            } else if (a.name === "18-25") {
                                colorClass = "text-blue-600";
                            } else if (a.name === "26+") {
                                colorClass = "text-purple-600";
                            }

                            return (
                                <div key={a.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">{a.name} years</span>
                                    <div className="text-right">
                                        <span className={`font-bold text-xl ${colorClass}`}>{a.value}</span>
                                        <span className="text-sm text-gray-500 ml-2">({a.percentage}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-64">
                        <Bar data={ageChartData} options={ageChartOptions} />
                    </div>
                </div>
            </div>

            {/* Sports Fiesta Attendance Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4 text-green-600 text-xl">
                            🏆
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold">Sports Fiesta Attendance</h2>
                            <p className="text-gray-500">Participation across different editions</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Edition-wise Attendance */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Attendance by Edition</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {fiestaStats.byEdition.map(item => (
                                <div
                                    key={item.edition}
                                    className="bg-gray-50 p-4 rounded-lg text-center"
                                    title={`${item.count} out of ${total} participants attended Sports Fiesta ${item.edition}`}
                                >
                                    <div className="text-sm font-semibold text-gray-600">
                                        SF {item.edition}
                                    </div>
                                    <div className="text-2xl font-bold text-indigo-600 my-1">
                                        {item.count}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ({item.percentage}%)
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-64">
                            <Bar data={fiestaEditionChartData} options={fiestaEditionChartOptions} />
                        </div>
                    </div>

                    {/* Participation Categories */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Participation Categories</h3>
                        <div className="grid grid-cols-1 gap-3 mb-6">
                            {fiestaStats.byParticipation.map(item => (
                                <div
                                    key={item.category}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                    title={`${item.count} participants (${item.percentage}%)`}
                                >
                                    <span className="font-medium">{item.category}</span>
                                    <div className="text-right">
                                        <span className="font-bold text-xl text-indigo-600">{item.count}</span>
                                        <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-64">
                            <Doughnut data={fiestaParticipationChartData} options={fiestaParticipationChartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Records Table */}
            <RegistrationTable registrations={registrations} />
        </div>
    );
}