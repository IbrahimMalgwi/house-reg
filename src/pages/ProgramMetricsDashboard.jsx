// src/pages/ProgramMetricsDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
    DoughnutController,
    BarController
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
    Title,
    DoughnutController,
    BarController
);

// Define teams with updated names and colors
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000", short: "Saviour" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF", short: "Healer" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700", short: "Baptizer" },
    PURPLE: { name: "Jesus our coming King", color: "#800080", short: "Coming King" }
};

// Create reverse mapping for team lookup efficiency
const TEAM_NAME_TO_KEY_MAP = {};
Object.keys(TEAMS).forEach(key => {
    TEAM_NAME_TO_KEY_MAP[TEAMS[key].name] = key;
});

// Define updated sports categories with gender information
const SPORTS = [
    { name: "Basketball", hasGender: true, hasAgeGroup: false },
    { name: "Volleyball", hasGender: true, hasAgeGroup: false },
    { name: "Football", hasGender: true, hasAgeGroup: true },
    { name: "Relley", hasGender: false, hasAgeGroup: false },
    { name: "50 Meters", hasGender: true, hasAgeGroup: false },
    { name: "70 Meters", hasGender: true, hasAgeGroup: false },
    { name: "100 Meters", hasGender: true, hasAgeGroup: false },
    { name: "100 Meters Under 15 Boys", hasGender: false, hasAgeGroup: false },
    { name: "100 Meters Under 15 Girls", hasGender: false, hasAgeGroup: false },
    { name: "100 Meters Under 17 Boys", hasGender: false, hasAgeGroup: false },
    { name: "100 Meters Under 17 Girls", hasGender: false, hasAgeGroup: false },
    { name: "800 Meters", hasGender: true, hasAgeGroup: false },
    { name: "4 x 100 Meters Relay", hasGender: true, hasAgeGroup: false },
    { name: "4 x 400 Meters Relay", hasGender: true, hasAgeGroup: false },
    { name: "Long Jump", hasGender: true, hasAgeGroup: false },
    { name: "Shot Put", hasGender: true, hasAgeGroup: false }
];

export default function ProgramMetricsDashboard() {
    const [metricsData, setMetricsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFilter, setTimeFilter] = useState("all");

    useEffect(() => {
        fetchMetricsData();
    }, []);

    const fetchMetricsData = async () => {
        setLoading(true);
        setError(null);
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
            setError("Failed to load metrics data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    //TODO: Update fetchMetricsData to pull from both spiritualReports and sportingReports collections
    // Inside ProgramMetricsDashboard.jsx
    // const fetchMetricsData = async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         // Fetch from both collections
    //         const [spiritualSnapshot, sportingSnapshot] = await Promise.all([
    //             getDocs(collection(db, "spiritualReports")),
    //             getDocs(collection(db, "sportingReports"))
    //         ]);
    //
    //         const metrics = [];
    //
    //         spiritualSnapshot.forEach((doc) => {
    //             metrics.push({ id: doc.id, ...doc.data() });
    //         });
    //         sportingSnapshot.forEach((doc) => {
    //             metrics.push({ id: doc.id, ...doc.data() });
    //         });
    //
    //         setMetricsData(metrics);
    //     } catch (error) {
    //         console.error("Error fetching metrics data:", error);
    //         setError("Failed to load metrics data. Please try again later.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Use useCallback to memoize the filter function
    const filterDataByTime = useCallback((data) => {
        if (timeFilter === "all") return data;

        const now = new Date();
        let cutoffDate;

        if (timeFilter === "week") {
            cutoffDate = new Date();
            cutoffDate.setDate(now.getDate() - 7);
        } else if (timeFilter === "month") {
            cutoffDate = new Date();
            cutoffDate.setMonth(now.getMonth() - 1);
        }

        return data.filter(item => {
            // Determine which date field to use, with a fallback
            let itemDate;
            if (item.eventDate) {
                itemDate = new Date(item.eventDate);
            } else if (item.createdAt && item.createdAt.seconds) {
                itemDate = new Date(item.createdAt.seconds * 1000);
            } else {
                // If no date is found, exclude it from time-filtered views
                return false;
            }
            return itemDate >= cutoffDate;
        });
    }, [timeFilter]); // timeFilter is a dependency

    const filteredData = useMemo(() => filterDataByTime(metricsData), [metricsData, filterDataByTime]);

    // Calculate all metrics - use useCallback to memoize this function
    const calculateMetrics = useCallback(() => {

        // TODO: UPDATE THIS IN FETURE WHEN TO USE FOR NEXT UPDATE
        // const decisionsForChrist = filteredData.filter(item =>
        //     item.reportType === "spiritual" && item.decisionForChrist
        // ).length;
        //
        // const teamWins = filteredData.filter(item =>
        //     item.reportType === "sporting" && item.teamWin === true
        // );

        // Spiritual metrics
        const decisionsForChrist = filteredData.filter(item => item.decisionForChrist).length;
        const holyGhostBaptisms = filteredData.filter(item => item.holyGhostBaptism).length;
        const injuries = filteredData.filter(item => item.injured).length;
        const counselingSessions = filteredData.filter(item => item.receiveCounseling).length;

        // Team wins analysis - filter items where teamWin is true
        const teamWins = filteredData.filter(item => item.teamWin === true);

        // Wins by team
        const winsByTeam = {};
        Object.keys(TEAMS).forEach(teamKey => {
            winsByTeam[TEAMS[teamKey].name] = 0;
        });

        // Wins by gender
        const winsByGender = {
            "Male": 0,
            "Female": 0
        };

        // Wins by sport with positions
        const winsBySport = {};
        SPORTS.forEach(sport => {
            winsBySport[sport.name] = {
                total: 0,
                wins: {}
            };
            Object.keys(TEAMS).forEach(teamKey => {
                winsBySport[sport.name].wins[TEAMS[teamKey].name] = 0;
            });
        });

        // NEW: Wins by sport, gender, and team
        const winsBySportGenderTeam = {};
        SPORTS.forEach(sport => {
            winsBySportGenderTeam[sport.name] = {
                "Male": {},
                "Female": {},
                "Total": 0
            };
            Object.keys(TEAMS).forEach(teamKey => {
                winsBySportGenderTeam[sport.name]["Male"][TEAMS[teamKey].name] = 0;
                winsBySportGenderTeam[sport.name]["Female"][TEAMS[teamKey].name] = 0;
            });
        });

        // Wins by sport and gender
        const winsBySportAndGender = {};
        SPORTS.forEach(sport => {
            winsBySportAndGender[sport.name] = {
                "Male": 0,
                "Female": 0,
                "Total": 0
            };
        });

        // Wins by position (1st, 2nd, 3rd)
        const winsByPosition = {
            "1st Place": 0,
            "2nd Place": 0,
            "3rd Place": 0
        };

        // Wins by team and gender
        const winsByTeamAndGender = {};
        Object.keys(TEAMS).forEach(teamKey => {
            winsByTeamAndGender[TEAMS[teamKey].name] = {
                "Male": 0,
                "Female": 0,
                "Total": 0
            };
        });

        teamWins.forEach(win => {
            // Count wins by team - handle exact matches from the form
            if (win.winningTeam && winsByTeam.hasOwnProperty(win.winningTeam)) {
                winsByTeam[win.winningTeam]++;
            }

            // Count wins by gender
            if (win.sportGender && winsByGender.hasOwnProperty(win.sportGender)) {
                winsByGender[win.sportGender]++;
            }

            // Count wins by sport and gender
            if (win.sportCategory && win.sportGender && winsBySportAndGender[win.sportCategory]) {
                winsBySportAndGender[win.sportCategory][win.sportGender]++;
                winsBySportAndGender[win.sportCategory].Total++;
            }

            // NEW: Count wins by sport, gender, and team
            if (win.sportCategory && win.sportGender && win.winningTeam && winsBySportGenderTeam[win.sportCategory]) {
                if (winsBySportGenderTeam[win.sportCategory][win.sportGender].hasOwnProperty(win.winningTeam)) {
                    winsBySportGenderTeam[win.sportCategory][win.sportGender][win.winningTeam]++;
                    winsBySportGenderTeam[win.sportCategory].Total++;
                }
            }

            // Count wins by team and gender
            if (win.winningTeam && win.sportGender && winsByTeamAndGender[win.winningTeam]) {
                winsByTeamAndGender[win.winningTeam][win.sportGender]++;
                winsByTeamAndGender[win.winningTeam].Total++;
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

        return {
            decisionsForChrist,
            holyGhostBaptisms,
            injuries,
            counselingSessions,
            teamWins: teamWins.length,
            winsByTeam,
            winsByGender,
            winsByTeamAndGender,
            winsBySport,
            winsBySportAndGender,
            winsBySportGenderTeam, // NEW
            winsByPosition,
            teamPositions,
            sportRankings,
            overallRanking
        };
    }, [filteredData]); // filteredData is a dependency

    const metrics = useMemo(() => calculateMetrics(), [calculateMetrics]);

    // Prepare data for CSV export
    const csvData = useMemo(() => ({
        data: filteredData.map(item => ({
            "Participant Name": item.participantName,
            "Decision for Christ": item.decisionForChrist ? "Yes" : "No",
            "Holy Ghost Baptism": item.holyGhostBaptism ? "Yes" : "No",
            "Holy Ghost Baptism Details": item.holyGhostBaptismDetails || "",
            "Injured": item.injured ? "Yes" : "No",
            "Injury Details": item.injuryDetails || "",
            "Received Counseling": item.receiveCounseling ? "Yes" : "No",
            "Counseling Details": item.counselingDetails || "",
            "Team Win": item.teamWin ? "Yes" : "No",
            "Winning Team": item.winningTeam || "",
            "Position": item.position || "",
            "Sport Category": item.sportCategory || "",
            "Sport Gender": item.sportGender || "",
            "Age Group": item.ageGroup || "",
            "Event Date": item.eventDate || ""
        })),
        headers: [
            { label: "Participant Name", key: "Participant Name" },
            { label: "Decision for Christ", key: "Decision for Christ" },
            { label: "Holy Ghost Baptism", key: "Holy Ghost Baptism" },
            { label: "Holy Ghost Baptism Details", key: "Holy Ghost Baptism Details" },
            { label: "Injured", key: "Injured" },
            { label: "Injury Details", key: "Injury Details" },
            { label: "Received Counseling", key: "Received Counseling" },
            { label: "Counseling Details", key: "Counseling Details" },
            { label: "Team Win", key: "Team Win" },
            { label: "Winning Team", key: "Winning Team" },
            { label: "Position", key: "Position" },
            { label: "Sport Category", key: "Sport Category" },
            { label: "Sport Gender", key: "Sport Gender" },
            { label: "Age Group", key: "Age Group" },
            { label: "Event Date", key: "Event Date" }
        ]
    }), [filteredData]);

    // Chart data for spiritual metrics
    const spiritualChartData = useMemo(() => ({
        labels: ["Decisions for Christ", "Holy Ghost Baptisms", "Injuries", "Counseling Sessions"],
        datasets: [
            {
                data: [metrics.decisionsForChrist, metrics.holyGhostBaptisms, metrics.injuries, metrics.counselingSessions],
                backgroundColor: ["#4CAF50", "#FFD700", "#FF0000", "#2196F3"],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    }), [metrics.decisionsForChrist, metrics.holyGhostBaptisms, metrics.injuries, metrics.counselingSessions]);

    // Chart data for team wins
    const teamWinsChartData = useMemo(() => ({
        labels: Object.keys(metrics.winsByTeam).map(team => {
            const teamKey = TEAM_NAME_TO_KEY_MAP[team];
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
    }), [metrics.winsByTeam]);

    // Chart data for wins by gender
    const genderWinsChartData = useMemo(() => ({
        labels: Object.keys(metrics.winsByGender),
        datasets: [
            {
                data: Object.values(metrics.winsByGender),
                backgroundColor: ["#3498db", "#e74c3c"],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    }), [metrics.winsByGender]);

    // Chart data for positions
    const positionsChartData = useMemo(() => ({
        labels: Object.keys(metrics.winsByPosition),
        datasets: [
            {
                data: Object.values(metrics.winsByPosition),
                backgroundColor: ["#FFD700", "#C0C0C0", "#CD7F32"],
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    }), [metrics.winsByPosition]);

    // Chart data for wins by team and gender (stacked bar chart)
    const teamGenderWinsChartData = useMemo(() => ({
        labels: Object.keys(TEAMS).map(key => TEAMS[key].short),
        datasets: [
            {
                label: 'Male',
                data: Object.keys(TEAMS).map(key => {
                    const teamName = TEAMS[key].name;
                    return metrics.winsByTeamAndGender[teamName]?.Male || 0;
                }),
                backgroundColor: '#3498db',
            },
            {
                label: 'Female',
                data: Object.keys(TEAMS).map(key => {
                    const teamName = TEAMS[key].name;
                    return metrics.winsByTeamAndGender[teamName]?.Female || 0;
                }),
                backgroundColor: '#e74c3c',
            }
        ]
    }), [metrics.winsByTeamAndGender]);

    // Chart data for wins by sport and gender
    const sportGenderWinsChartData = useMemo(() => ({
        labels: Object.keys(metrics.winsBySportAndGender),
        datasets: [
            {
                label: 'Male',
                data: Object.keys(metrics.winsBySportAndGender).map(sport =>
                    metrics.winsBySportAndGender[sport]?.Male || 0
                ),
                backgroundColor: '#3498db',
            },
            {
                label: 'Female',
                data: Object.keys(metrics.winsBySportAndGender).map(sport =>
                    metrics.winsBySportAndGender[sport]?.Female || 0
                ),
                backgroundColor: '#e74c3c',
            }
        ]
    }), [metrics.winsBySportAndGender]);

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

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-100">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchMetricsData}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="p-4 md:p-6 lg:p-8">
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
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 text-green-600">
                        ✝️
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Decisions for Christ</h3>
                    <p className="text-3xl font-bold text-green-600">{metrics.decisionsForChrist}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3 text-yellow-600">
                        🔥
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Holy Ghost Baptisms</h3>
                    <p className="text-3xl font-bold text-yellow-600">{metrics.holyGhostBaptisms}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
                        🏥
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Injuries</h3>
                    <p className="text-3xl font-bold text-red-600">{metrics.injuries}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600">
                        💬
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Counseling Sessions</h3>
                    <p className="text-3xl font-bold text-blue-600">{metrics.counselingSessions}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Spiritual Decisions Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 text-green-600">
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

            {/* Additional Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Wins by Gender Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                            👥
                        </div>
                        <h2 className="text-2xl font-semibold">Wins by Gender</h2>
                    </div>
                    <div className="h-80">
                        <Doughnut data={genderWinsChartData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }} />
                    </div>
                </div>

                {/* Positions Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
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
            </div>

            {/* Team Wins by Gender (Stacked Bar Chart) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600">
                        📊
                    </div>
                    <h2 className="text-2xl font-semibold">Team Wins by Gender</h2>
                </div>
                <div className="h-96">
                    <Bar
                        data={teamGenderWinsChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: 'Wins by Team and Gender' }
                            },
                            scales: {
                                x: {
                                    stacked: true,
                                },
                                y: {
                                    stacked: true,
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Wins by Sport and Gender (Stacked Bar Chart) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                        🏅
                    </div>
                    <h2 className="text-2xl font-semibold">Wins by Sport and Gender</h2>
                </div>
                <div className="h-96">
                    <Bar
                        data={sportGenderWinsChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: 'Wins by Sport and Gender' }
                            },
                            scales: {
                                x: {
                                    stacked: true,
                                },
                                y: {
                                    stacked: true,
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Sport Wins by Gender Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 text-green-600">
                        🏆
                    </div>
                    <h2 className="text-2xl font-semibold">Sport Wins by Gender</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(metrics.winsBySportAndGender)
                        .filter(([sport, data]) => data.Total > 0)
                        .map(([sport, genderData]) => (
                            <div key={sport} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-400">
                                <h3 className="text-lg font-semibold mb-3 text-center text-indigo-600">
                                    {sport}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Male Wins</span>
                                        <span className="font-bold text-blue-600">{genderData.Male}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Female Wins</span>
                                        <span className="font-bold text-red-600">{genderData.Female}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>Total Wins</span>
                                            <span className="text-indigo-600">{genderData.Total}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* NEW: Winning Per Sporting Category - Separated by Gender */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3 text-yellow-600">
                        🏅
                    </div>
                    <h2 className="text-2xl font-semibold">Winning Per Sporting Category</h2>
                </div>

                {/* Male Sports */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-blue-600 flex items-center">
                        <span className="mr-2">👨 Male Sports</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(metrics.winsBySportGenderTeam)
                            .filter(([sport, data]) => {
                                const maleWins = Object.values(data.Male).reduce((sum, wins) => sum + wins, 0);
                                return maleWins > 0;
                            })
                            .map(([sport, sportData]) => {
                                const maleWins = Object.entries(sportData.Male)
                                    .filter(([_, wins]) => wins > 0)
                                    .sort(([,a], [,b]) => b - a);

                                return (
                                    <div key={`male-${sport}`} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                                        <h3 className="text-lg font-semibold mb-3 text-center text-blue-600">
                                            {sport} (Male)
                                        </h3>
                                        <div className="space-y-2">
                                            {maleWins.map(([team, wins], index) => {
                                                const teamKey = TEAM_NAME_TO_KEY_MAP[team];
                                                const teamColor = TEAMS[teamKey]?.color || "#6b7280";
                                                const teamShort = TEAMS[teamKey]?.short || team;

                                                return (
                                                    <div key={team} className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""} {teamShort}
                                                        </span>
                                                        <span className="font-bold" style={{ color: teamColor }}>{wins}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="border-t pt-2 mt-2">
                                                <div className="flex justify-between items-center font-semibold">
                                                    <span>Total Male Wins</span>
                                                    <span className="text-blue-600">
                                                        {Object.values(sportData.Male).reduce((sum, wins) => sum + wins, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Female Sports */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
                        <span className="mr-2">👩 Female Sports</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(metrics.winsBySportGenderTeam)
                            .filter(([sport, data]) => {
                                const femaleWins = Object.values(data.Female).reduce((sum, wins) => sum + wins, 0);
                                return femaleWins > 0;
                            })
                            .map(([sport, sportData]) => {
                                const femaleWins = Object.entries(sportData.Female)
                                    .filter(([_, wins]) => wins > 0)
                                    .sort(([,a], [,b]) => b - a);

                                return (
                                    <div key={`female-${sport}`} className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-400">
                                        <h3 className="text-lg font-semibold mb-3 text-center text-red-600">
                                            {sport} (Female)
                                        </h3>
                                        <div className="space-y-2">
                                            {femaleWins.map(([team, wins], index) => {
                                                const teamKey = TEAM_NAME_TO_KEY_MAP[team];
                                                const teamColor = TEAMS[teamKey]?.color || "#6b7280";
                                                const teamShort = TEAMS[teamKey]?.short || team;

                                                return (
                                                    <div key={team} className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""} {teamShort}
                                                        </span>
                                                        <span className="font-bold" style={{ color: teamColor }}>{wins}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="border-t pt-2 mt-2">
                                                <div className="flex justify-between items-center font-semibold">
                                                    <span>Total Female Wins</span>
                                                    <span className="text-red-600">
                                                        {Object.values(sportData.Female).reduce((sum, wins) => sum + wins, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
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
                        const teamKey = TEAM_NAME_TO_KEY_MAP[team];
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

            {/* Team Wins by Gender Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 text-purple-600">
                        👥
                    </div>
                    <h2 className="text-2xl font-semibold">Team Wins by Gender</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(metrics.winsByTeamAndGender).map(([team, genderData]) => {
                        const teamKey = TEAM_NAME_TO_KEY_MAP[team];
                        const teamColor = TEAMS[teamKey]?.color || "#6b7280";
                        const totalWins = genderData.Total;

                        return (
                            <div key={team} className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: teamColor }}>
                                <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: teamColor }}>
                                    {TEAMS[teamKey]?.short || team}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Male Wins</span>
                                        <span className="font-bold text-blue-600">{genderData.Male}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Female Wins</span>
                                        <span className="font-bold text-red-600">{genderData.Female}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>Total Wins</span>
                                            <span style={{ color: teamColor }}>{totalWins}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                                backgroundColor: TEAMS[TEAM_NAME_TO_KEY_MAP[metrics.overallRanking[0][0]]]?.color
                            }}
                        >
                            <div className="text-4xl font-bold mb-2">1st</div>
                            <div className="text-2xl font-semibold">
                                {TEAMS[TEAM_NAME_TO_KEY_MAP[metrics.overallRanking[0][0]]]?.short}
                            </div>
                            <div className="text-lg">{metrics.overallRanking[0][1]} Wins</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            {metrics.overallRanking.slice(1, 3).map(([team, wins], index) => {
                                const teamKey = TEAM_NAME_TO_KEY_MAP[team];
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
        </div>
    );
}