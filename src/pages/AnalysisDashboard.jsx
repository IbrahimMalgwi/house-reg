import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const HOUSE_COLORS = {
    "Saviour": "#FF0000", // Red
    "Holy Ghost Baptizer": "#FFD700", // Yellow
    "Healer": "#0000FF", // Blue
    "Coming King": "#800080", // Purple
};

const GENDER_COLORS = ["#4CAF50", "#FF9800", "#9E9E9E"];
const RELIGION_COLORS = ["#2196F3", "#F44336", "#FFC107", "#9C27B0", "#607D8B"];
const AGE_COLORS = ["#E91E63", "#3F51B5", "#00BCD4", "#8BC34A", "#FF5722"];

export default function AnalysisDashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const snapshot = await getDocs(collection(db, "registrations"));
            setRegistrations(snapshot.docs.map(doc => doc.data()));
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading registration data...</p>
                </div>
            </div>
        );
    }

    const total = registrations.length;

    // ✅ Aggregations
    const aggregateData = (key) => {
        const counts = {};
        registrations.forEach(r => {
            const value = r[key] || "Unknown";
            counts[value] = (counts[value] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            percentage: ((value / total) * 100).toFixed(1),
        }));
    };

    const sexData = aggregateData("sex");
    const ageData = aggregateData("age");
    const religionData = aggregateData("religion");
    const houseData = aggregateData("house");

    // Custom tooltip for pie charts
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-sm">{`Count: ${payload[0].value}`}</p>
                    <p className="text-sm">{`Percentage: ${payload[0].payload.percentage}%`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        📊 House Registration Analysis Dashboard
                    </h1>
                    <p className="text-gray-600">Comprehensive overview of registration statistics</p>
                </header>

                {/* Total count */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
                    <div className="text-5xl font-bold text-indigo-600 mb-2">{total}</div>
                    <p className="text-lg text-gray-600 font-medium">Total Registrations</p>
                    <div className="w-24 h-1 bg-indigo-200 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* House Distribution */}
                <section className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
                        <span className="bg-purple-100 p-2 rounded-lg mr-2">🏠</span>
                        House Distribution
                    </h2>

                    {/* Prominent house badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {houseData.map((h) => (
                            <div
                                key={h.name}
                                className="p-5 rounded-xl text-center shadow-sm transition-transform duration-200 hover:scale-105"
                                style={{
                                    backgroundColor: HOUSE_COLORS[h.name] || "#ccc",
                                    borderLeft: `5px solid ${darkenColor(HOUSE_COLORS[h.name] || "#ccc", 20)}`
                                }}
                            >
                                <p className="text-white text-sm font-semibold uppercase tracking-wide">
                                    {h.name}
                                </p>
                                <p className="text-white text-3xl font-bold my-2">{h.value}</p>
                                <p className="text-white text-opacity-90 text-sm">({h.percentage}%)</p>
                            </div>
                        ))}
                    </div>

                    {/* Pie chart */}
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={houseData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    innerRadius={70}
                                    dataKey="value"
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    labelLine={false}
                                >
                                    {houseData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={HOUSE_COLORS[entry.name] || "#ccc"}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    iconType="circle"
                                    iconSize={12}
                                    formatter={(value) => <span className="text-sm">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Gender and Religion Distribution */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Gender Distribution */}
                    <section className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
                            <span className="bg-green-100 p-2 rounded-lg mr-2">👫</span>
                            Gender Distribution
                        </h2>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sexData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={60}
                                        dataKey="value"
                                        label={({ percentage }) => `${percentage}%`}
                                    >
                                        {sexData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={GENDER_COLORS[index % 3]}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={12}
                                        formatter={(value) => <span className="text-sm">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Religion Distribution */}
                    <section className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
                            <span className="bg-blue-100 p-2 rounded-lg mr-2">⛪</span>
                            Religion Distribution
                        </h2>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={religionData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={60}
                                        dataKey="value"
                                        label={({ percentage }) => `${percentage}%`}
                                    >
                                        {religionData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={RELIGION_COLORS[index % 5]}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={12}
                                        formatter={(value) => <span className="text-sm">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* Age Distribution */}
                <section className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
                        <span className="bg-red-100 p-2 rounded-lg mr-2">🎂</span>
                        Age Distribution
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ageData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    innerRadius={70}
                                    dataKey="value"
                                    label={({ percentage }) => `${percentage}%`}
                                >
                                    {ageData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={AGE_COLORS[index % 5]}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    iconType="circle"
                                    iconSize={12}
                                    formatter={(value) => <span className="text-sm">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Helper function to darken colors for borders
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;

    return "#" + (
        0x1000000 +
        (R < 0 ? 0 : R) * 0x10000 +
        (G < 0 ? 0 : G) * 0x100 +
        (B < 0 ? 0 : B)
    ).toString(16).slice(1);
}