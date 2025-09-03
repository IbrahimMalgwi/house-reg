// src/pages/ProgramMetricsDashboard.jsx
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
import { Doughnut, Bar, Pie } from 'react-chartjs-2';

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

// Define teams and colors
const TEAMS = {
    RED: { name: "Red Team", color: "#FF0000" },
    BLUE: { name: "Blue Team", color: "#0000FF" },
    PURPLE: { name: "Purple Team", color: "#800080" },
    YELLOW: { name: "Yellow Team", color: "#FFD700" }
};

// Define sports categories
const SPORTS = [
    "Football",
    "Basketball",
    "Table Tennis",
    "Volleyball",
    "Scrabble",
    "Track and Field"
];

export default function ProgramMetricsDashboard() {
    const [metricsData, setMetricsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("all"); // all, week, month

    useEffect(() => {
        fetchMetricsData();
    }, []);

    const fetchMetricsData = async () => {
        try {
            const metricsRef = collection(db, "programMetrics");
            const querySnapshot = await getDocs(metricsRef);

            const metrics = [];
            querySnapshot.forEach((doc) => {
                metrics.push({ id: doc.id, ...doc.data() });
            });

            setMetricsData(metrics);
        } catch (error) {
            console.error("Error fetching metrics data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data based on time selection
    const filterDataByTime = (data) => {
        const now = new Date();

        if (timeFilter === "week") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return data.filter(item => {
                const itemDate = item.eventDate ? new Date(item.eventDate) :
                    (item.createdAt ? new Date(item.createdAt.seconds * 1000) : null);
                return itemDate && itemDate >= oneWeekAgo;
            });
        }

        if (timeFilter === "month") {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return data.filter(item => {
                const itemDate = item.eventDate ? new Date(item.eventDate) :
                    (item.createdAt ? new Date(item.createdAt.seconds * 1000) : null);
                return itemDate && itemDate >= oneMonthAgo;
            });
        }

        return data;
    };

    const filteredData = filterDataByTime(metricsData);

    // Calculate metrics
    const calculateMetrics = () => {
        const decisionsForChrist = filteredData.filter(item => item.decisionForChrist).length;
        const holyGhostBaptisms = filteredData.filter(item => item.holyGhostBaptism).length;
        const injuries = filteredData.filter(item => item.injured).length;
        const counselingSessions = filteredData.filter(item => item.receiveCounseling).length;

        // Team wins by sport
        const teamWins = filteredData.filter(item => item.teamWin);
        const winsByTeam = {};
        const winsBySport = {};

        Object.keys(TEAMS).forEach(teamKey => {
            winsByTeam[TEAMS[teamKey].name] = 0;
        });

        SPORTS.forEach(sport => {
            winsBySport[sport] = 0;
        });

        teamWins.forEach(win => {
            if (win.winningTeam && winsByTeam.hasOwnProperty(win.winningTeam)) {
                winsByTeam[win.winningTeam]++;
            }

            if (win.sportCategory && winsBySport.hasOwnProperty(win.sportCategory)) {
                winsBySport[win.sportCategory]++;
            }
        });

        // Track and field wins by age and gender
        const trackFieldWins = teamWins.filter(win => win.sportCategory === "Track and Field");
        const trackFieldByAge = {};
        const trackFieldByGender = { Male: 0, Female: 0 };

        // AGE_CATEGORIES.forEach(age => {
        //     trackFieldByAge[age] = 0;
        // });

        trackFieldWins.forEach(win => {
            if (win.ageCategory && trackFieldByAge.hasOwnProperty(win.ageCategory)) {
                trackFieldByAge[win.ageCategory]++;
            }

            if (win.genderCategory && trackFieldByGender.hasOwnProperty(win.genderCategory)) {
                trackFieldByGender[win.genderCategory]++;
            }
        });

        return {
            decisionsForChrist,
            holyGhostBaptisms,
            injuries,
            counselingSessions,
            teamWins: teamWins.length,
            winsByTeam,
            winsBySport,
            trackFieldByAge,
            trackFieldByGender
        };
    };

    const metrics = calculateMetrics();

    // Prepare data for CSV export
    const csvData = {
        data: filteredData.map(item => ({
            "Participant ID": item.participantId,
            "Participant Name": item.participantName,
            "Decision for Christ": item.decisionForChrist ? "Yes" : "No",
            "Holy Ghost Baptism": item.holyGhostBaptism ? "Yes" : "No",
            "Injured": item.injured ? "Yes" : "No",
            "Injury Details": item.injuryDetails || "",
            "Received Counseling": item.receiveCounseling ? "Yes" : "No",
            "Counseling Details": item.counselingDetails || "",
            "Team Win": item.teamWin ? "Yes" : "No",
            "Winning Team": item.winningTeam || "",
            "Sport Category": item.sportCategory || "",
            "Age Category": item.ageCategory || "",
            "Gender Category": item.genderCategory || "",
            "Event Date": item.eventDate || ""
        })),
        headers: [
            { label: "Participant ID", key: "Participant ID" },
            { label: "Participant Name", key: "Participant Name" },
            { label: "Decision for Christ", key: "Decision for Christ" },
            { label: "Holy Ghost Baptism", key: "Holy Ghost Baptism" },
            { label: "Injured", key: "Injured" },
            { label: "Injury Details", key: "Injury Details" },
            { label: "Received Counseling", key: "Received Counseling" },
            { label: "Counseling Details", key: "Counseling Details" },
            { label: "Team Win", key: "Team Win" },
            { label: "Winning Team", key: "Winning Team" },
            { label: "Sport Category", key: "Sport Category" },
            { label: "Age Category", key: "Age Category" },
            { label: "Gender Category", key: "Gender Category" },
            { label: "Event Date", key: "Event Date" }
        ]
    };

    // Chart data for spiritual metrics
    const spiritualChartData = {
        labels: ["Decisions for Christ", "Holy Ghost Baptisms"],
        datasets: [
            {
                data: [metrics.decisionsForChrist, metrics.holyGhostBaptisms],
                backgroundColor: ["#4F46E5", "#6366F1"],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const spiritualChartOptions = {
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

    // Chart data for team wins
    const teamWinsChartData = {
        labels: Object.keys(metrics.winsByTeam),
        datasets: [
            {
                data: Object.values(metrics.winsByTeam),
                backgroundColor: Object.keys(TEAMS).map(key => TEAMS[key].color),
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const teamWinsChartOptions = {
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

    // Chart data for sports wins
    const sportsChartData = {
        labels: Object.keys(metrics.winsBySport),
        datasets: [
            {
                label: 'Wins',
                data: Object.values(metrics.winsBySport),
                backgroundColor: '#4F46E5',
                borderWidth: 0,
                borderRadius: 6,
                barPercentage: 0.7
            }
        ]
    };

    const sportsChartOptions = {
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
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading program metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Program Metrics Dashboard</h1>
                <p className="text-xl opacity-90">Comprehensive overview of spiritual decisions, injuries, counseling, and team wins</p>
            </div>

            {/* Time Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Metrics Overview</h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">Time Period:</span>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        <option value="all">All Time</option>
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                    </select>
                    <CSVLink
                        data={csvData.data}
                        headers={csvData.headers}
                        filename={"program-metrics.csv"}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center text-sm"
                    >
                        Export CSV
                    </CSVLink>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                        ✝️
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Decisions for Christ</h3>
                    <p className="text-3xl font-bold text-indigo-600">{metrics.decisionsForChrist}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 text-purple-600">
                        🔥
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Holy Ghost Baptisms</h3>
                    <p className="text-3xl font-bold text-purple-600">{metrics.holyGhostBaptisms}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
                        🏥
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Injuries</h3>
                    <p className="text-3xl font-bold text-red-600">{metrics.injuries}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
                        💬
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Counseling Sessions</h3>
                    <p className="text-3xl font-bold text-green-600">{metrics.counselingSessions}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Spiritual Decisions Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">
                            ✝️
                        </div>
                        <h2 className="text-2xl font-semibold">Spiritual Decisions</h2>
                    </div>
                    <div className="h-80">
                        <Doughnut data={spiritualChartData} options={spiritualChartOptions} />
                    </div>
                </div>

                {/* Team Wins Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                            🏆
                        </div>
                        <h2 className="text-2xl font-semibold">Team Wins Distribution</h2>
                    </div>
                    <div className="h-80">
                        <Pie data={teamWinsChartData} options={teamWinsChartOptions} />
                    </div>
                </div>
            </div>

            {/* Sports Wins Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                        ⚽
                    </div>
                    <h2 className="text-2xl font-semibold">Wins by Sport Category</h2>
                </div>
                <div className="h-80">
                    <Bar data={sportsChartData} options={sportsChartOptions} />
                </div>
            </div>

            {/* Team Wins Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3 text-red-600">
                        🏅
                    </div>
                    <h2 className="text-2xl font-semibold">Team Wins Breakdown</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(metrics.winsByTeam).map(([team, wins]) => {
                        const teamKey = Object.keys(TEAMS).find(key => TEAMS[key].name === team);
                        const color = TEAMS[teamKey]?.color || "#6b7280";

                        return (
                            <div
                                key={team}
                                className="bg-gray-50 p-4 rounded-lg border-l-4"
                                style={{ borderLeftColor: color }}
                            >
                                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {team}
                  </span>
                                    <span className="text-lg font-bold" style={{ color }}>
                    {wins}
                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${metrics.teamWins > 0 ? (wins / metrics.teamWins) * 100 : 0}%`,
                                            backgroundColor: color
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {metrics.teamWins > 0 ? ((wins / metrics.teamWins) * 100).toFixed(1) : 0}% of total wins
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Track and Field Details (if applicable) */}
            {metrics.trackFieldByAge && Object.values(metrics.trackFieldByAge).some(count => count > 0) && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 text-yellow-600">
                            🏃
                        </div>
                        <h2 className="text-2xl font-semibold">Track & Field Wins by Age Category</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {Object.entries(metrics.trackFieldByAge).map(([age, wins]) => (
                            <div
                                key={age}
                                className="bg-gray-50 p-4 rounded-lg border-l-4"
                                style={{ borderLeftColor: "#FFD700" }}
                            >
                                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {age}
                  </span>
                                    <span className="text-lg font-bold text-yellow-600">
                    {wins}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}