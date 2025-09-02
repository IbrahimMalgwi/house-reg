// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
    HOUSES,
    getShortHouseName,
    getHouseColor,
} from "../utils/houseMapping";

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

                // Normalize sex values - FIXED: Added Female option
                const sexValue = r.sex?.toLowerCase() || "";
                let normalizedSex = r.sex;

                if (sexValue.includes("male") || sexValue === "m") {
                    normalizedSex = "Male";
                } else if (sexValue.includes("female") || sexValue === "f" || sexValue === "fem") {
                    normalizedSex = "Female";
                } else if (sexValue.includes("other") || sexValue.includes("prefer") || sexValue.includes("not")) {
                    normalizedSex = "Others";
                }

                return {
                    ...r,
                    house: normalizedHouse || "Unknown",
                    sex: normalizedSex || "Unknown",
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Teen Program Dashboard</h1>
                    <p className="text-xl opacity-90">Comprehensive overview of registrations and distributions</p>
                </header>

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>
        </div>
    );
}