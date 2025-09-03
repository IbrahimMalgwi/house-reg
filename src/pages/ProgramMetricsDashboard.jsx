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
import { Doughnut,  Pie } from 'react-chartjs-2';

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

// Define teams with updated names and colors
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000", short: "Saviour" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF", short: "Healer" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700", short: "Baptizer" },
    PURPLE: { name: "Jesus our coming King", color: "#800080", short: "Coming King" }
};

// Define updated sports categories
const SPORTS = [
    "Football",
    "Basketball",
    "Volleyball",
    "Long Jump",
    "Shot Put",
    "100m",
    "200m",
    "400m",
    "4x100m Relay",
    "4x400m Relay",
    "Table Tennis",
    "Scrabble",
    "Chess"
];

export default function ProgramMetricsDashboard() {
    const [metricsData, setMetricsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("all");

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

    const filterDataByTime = (data) => {
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

    // Calculate all metrics
    // Calculate all metrics
    const calculateMetrics = () => {
        // Spiritual metrics
        const decisionsForChrist = filteredData.filter(item => item.decisionForChrist).length;
        const holyGhostBaptisms = filteredData.filter(item => item.holyGhostBaptism).length;
        const injuries = filteredData.filter(item => item.injured).length;
        const counselingSessions = filteredData.filter(item => item.receiveCounseling).length;

        // Team wins analysis - filter items where teamWin is true
        const teamWins = filteredData.filter(item => item.teamWin === true);

        // Debug: Log team wins to see what data we're getting
        console.log("Team wins data:", teamWins);

        // Wins by team
        const winsByTeam = {};
        Object.keys(TEAMS).forEach(teamKey => {
            winsByTeam[TEAMS[teamKey].name] = 0;
        });

        // Wins by sport with positions
        const winsBySport = {};
        SPORTS.forEach(sport => {
            winsBySport[sport] = {
                total: 0,
                wins: {}
            };
            Object.keys(TEAMS).forEach(teamKey => {
                winsBySport[sport].wins[TEAMS[teamKey].name] = 0;
            });
        });

        // Wins by position (1st, 2nd, 3rd)
        const winsByPosition = {
            "1st Place": 0,
            "2nd Place": 0,
            "3rd Place": 0
        };

        teamWins.forEach(win => {
            // Count wins by team - handle exact matches from the form
            if (win.winningTeam && winsByTeam.hasOwnProperty(win.winningTeam)) {
                winsByTeam[win.winningTeam]++;
            }

            // Count wins by sport
            if (win.sportCategory && winsBySport[win.sportCategory]) {
                winsBySport[win.sportCategory].total++;
                if (win.winningTeam && winsBySport[win.sportCategory].wins.hasOwnProperty(win.winningTeam)) {
                    winsBySport[win.sportCategory].wins[win.winningTeam]++;
                }
            }

            // Count wins by position - handle exact matches from the form
            if (win.position && winsByPosition.hasOwnProperty(win.position)) {
                winsByPosition[win.position]++;
            }
        });

        // Calculate rankings for each sport
        const sportRankings = {};
        Object.keys(winsBySport).forEach(sport => {
            const teamWins = Object.entries(winsBySport[sport].wins)
                .filter(([_, wins]) => wins > 0)
                .sort(([,a], [,b]) => b - a);

            sportRankings[sport] = {
                1: teamWins[0] || null,
                2: teamWins[1] || null,
                3: teamWins[2] || null
            };
        });

        // Calculate overall winner - filter out teams with 0 wins
        const overallRanking = Object.entries(winsByTeam)
            .filter(([_, wins]) => wins > 0)
            .sort(([,a], [,b]) => b - a);

        // Calculate team performance by positions
        const teamPositions = {};
        Object.keys(TEAMS).forEach(teamKey => {
            teamPositions[TEAMS[teamKey].name] = {
                "1st Place": 0,
                "2nd Place": 0,
                "3rd Place": 0
            };
        });

        teamWins.forEach(win => {
            if (win.winningTeam && win.position && teamPositions[win.winningTeam]) {
                if (teamPositions[win.winningTeam].hasOwnProperty(win.position)) {
                    teamPositions[win.winningTeam][win.position]++;
                }
            }
        });

        // Debug: Log the calculated metrics
        console.log("Calculated metrics:", {
            winsByTeam,
            overallRanking,
            teamWinsCount: teamWins.length
        });

        return {
            decisionsForChrist,
            holyGhostBaptisms,
            injuries,
            counselingSessions,
            teamWins: teamWins.length,
            winsByTeam,
            winsBySport,
            winsByPosition,
            teamPositions,
            sportRankings,
            overallRanking
        };
    };
    const metrics = calculateMetrics();

    // Prepare data for CSV export
    const csvData = {
        data: filteredData.map(item => ({
            "Participant Name": item.participantName,
            "Decision for Christ": item.decisionForChrist ? "Yes" : "No",
            "Holy Ghost Baptism": item.holyGhostBaptism ? "Yes" : "No",
            "Injured": item.injured ? "Yes" : "No",
            "Received Counseling": item.receiveCounseling ? "Yes" : "No",
            "Team Win": item.teamWin ? "Yes" : "No",
            "Winning Team": item.winningTeam || "",
            "Position": item.position || "",
            "Sport Category": item.sportCategory || "",
            "Event Date": item.eventDate || ""
        })),
        headers: [
            { label: "Participant Name", key: "Participant Name" },
            { label: "Decision for Christ", key: "Decision for Christ" },
            { label: "Holy Ghost Baptism", key: "Holy Ghost Baptism" },
            { label: "Injured", key: "Injured" },
            { label: "Received Counseling", key: "Received Counseling" },
            { label: "Team Win", key: "Team Win" },
            { label: "Winning Team", key: "Winning Team" },
            { label: "Position", key: "Position" },
            { label: "Sport Category", key: "Sport Category" },
            { label: "Event Date", key: "Event Date" }
        ]
    };

    // Chart data for spiritual metrics
    const spiritualChartData = {
        labels: ["Decisions for Christ", "Holy Ghost Baptisms", "Counseling Sessions"],
        datasets: [
            {
                data: [metrics.decisionsForChrist, metrics.holyGhostBaptisms, metrics.counselingSessions],
                backgroundColor: ["#FF0000", "#FFD700", "#ADD8E6"], // Red, Yellow, Light Blue
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };


    // Chart data for team wins
    const teamWinsChartData = {
        labels: Object.keys(metrics.winsByTeam).map(team => {
            const teamKey = Object.keys(TEAMS).find(key => TEAMS[key].name === team);
            return TEAMS[teamKey]?.short || team;
        }),
        datasets: [
            {
                data: Object.values(metrics.winsByTeam),
                backgroundColor: Object.keys(TEAMS).map(key => TEAMS[key].color),
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    // Chart data for positions
    const positionsChartData = {
        labels: Object.keys(metrics.winsByPosition),
        datasets: [
            {
                data: Object.values(metrics.winsByPosition),
                backgroundColor: ["#FFD700", "#C0C0C0", "#CD7F32"], // Gold, Silver, Bronze
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
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
        <div className="max-w-7xl mx-auto p-4">
            {/* Header */}
            <div className="text-center mb-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Sports Fiesta 4.0 Analytics</h1>
                <p className="text-xl opacity-90">Comprehensive analysis of sports, spiritual decisions, and team performances</p>
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
                        filename={"sports-fiesta-metrics.csv"}
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
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
                        💬
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Counseling Sessions</h3>
                    <p className="text-3xl font-bold text-green-600">{metrics.counselingSessions}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
                        🏆
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Team Wins</h3>
                    <p className="text-3xl font-bold text-red-600">{metrics.teamWins}</p>
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
                        <h2 className="text-2xl font-semibold">Spiritual Metrics</h2>
                    </div>
                    <div className="h-80">
                        <Doughnut data={spiritualChartData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }} />
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
                        <Pie data={teamWinsChartData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }} />
                    </div>
                </div>
            </div>

            {/* Positions Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 text-yellow-600">
                        🏅
                    </div>
                    <h2 className="text-2xl font-semibold">Wins by Position</h2>
                </div>
                <div className="h-80">
                    <Doughnut data={positionsChartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }} />
                </div>
            </div>

            {/* Team Positions Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                        📊
                    </div>
                    <h2 className="text-2xl font-semibold">Team Performance by Positions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(metrics.teamPositions).map(([team, positions]) => {
                        const teamKey = Object.keys(TEAMS).find(key => TEAMS[key].name === team);
                        const teamColor = TEAMS[teamKey]?.color || "#6b7280";

                        return (
                            <div key={team} className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: teamColor }}>
                                <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: teamColor }}>
                                    {TEAMS[teamKey]?.short || team}
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(positions).map(([position, count]) => (
                                        <div key={position} className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">{position}</span>
                                            <span className="font-bold" style={{ color: teamColor }}>{count}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>Total Wins</span>
                                            <span style={{ color: teamColor }}>
                                                {Object.values(positions).reduce((sum, count) => sum + count, 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sport Rankings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3 text-red-600">
                        🏅
                    </div>
                    <h2 className="text-2xl font-semibold">Sport Rankings</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(metrics.sportRankings).map(([sport, rankings]) => (
                        <div key={sport} className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 text-center">{sport}</h3>
                            <div className="space-y-3">
                                {['1', '2', '3'].map((position) => {
                                    const ranking = rankings[position];
                                    if (!ranking) return null;

                                    const [teamName, wins] = ranking;
                                    const teamKey = Object.keys(TEAMS).find(key => TEAMS[key].name === teamName);
                                    const team = TEAMS[teamKey];

                                    return (
                                        <div
                                            key={position}
                                            className="flex justify-between items-center p-3 rounded-lg text-white"
                                            style={{ backgroundColor: team.color }}
                                        >
                                            <span className="font-bold">{position}st Place</span>
                                            <div className="text-right">
                                                <div className="font-semibold">{team.short}</div>
                                                <div className="text-sm opacity-90">{wins} Win{wins !== 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overall Winner */}
            {metrics.overallRanking.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 text-yellow-600">
                            🏆
                        </div>
                        <h2 className="text-2xl font-semibold">Overall Champion</h2>
                    </div>
                    <div className="text-center">
                        <div
                            className="inline-block p-6 rounded-2xl text-white text-center mx-auto mb-4"
                            style={{
                                backgroundColor: TEAMS[Object.keys(TEAMS).find(key =>
                                    TEAMS[key].name === metrics.overallRanking[0][0]
                                )]?.color
                            }}
                        >
                            <div className="text-4xl font-bold mb-2">1st</div>
                            <div className="text-2xl font-semibold">
                                {TEAMS[Object.keys(TEAMS).find(key =>
                                    TEAMS[key].name === metrics.overallRanking[0][0]
                                )]?.short}
                            </div>
                            <div className="text-lg">{metrics.overallRanking[0][1]} Wins</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            {metrics.overallRanking.slice(1, 3).map(([team, wins], index) => {
                                const teamKey = Object.keys(TEAMS).find(key => TEAMS[key].name === team);
                                const teamData = TEAMS[teamKey];
                                return (
                                    <div
                                        key={team}
                                        className="p-4 rounded-xl text-white text-center"
                                        style={{ backgroundColor: teamData.color }}
                                    >
                                        <div className="text-xl font-bold mb-1">{index + 2}nd</div>
                                        <div className="font-semibold">{teamData.short}</div>
                                        <div className="text-sm">{wins} Wins</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Team Wins Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 text-green-600">
                        📊
                    </div>
                    <h2 className="text-2xl font-semibold">Team Performance Breakdown</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(metrics.winsByTeam).map(([team, wins]) => {
                        const teamKey = Object.keys(TEAMS).find(key => TEAMS[key].name === team);
                        const color = TEAMS[teamKey]?.color || "#6b7280";
                        const percentage = metrics.teamWins > 0 ? (wins / metrics.teamWins) * 100 : 0;

                        return (
                            <div
                                key={team}
                                className="bg-gray-50 p-4 rounded-lg border-l-4"
                                style={{ borderLeftColor: color }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900 text-sm">
                                        {TEAMS[teamKey]?.short || team}
                                    </span>
                                    <span className="text-lg font-bold" style={{ color }}>
                                        {wins}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: color
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {percentage.toFixed(1)}% of total wins
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}