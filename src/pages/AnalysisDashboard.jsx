import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getShortHouseName } from '../utils/houseMapping';

const HOUSE_COLORS = {
    "Jesus Christ Our Saviour": "#FF0000", // Red
    "Jesus Christ The Holy Ghost Baptizer": "#FFD700", // Yellow
    "Jesus Christ Our Healer": "#0000FF", // Blue
    "Jesus Christ Our Coming King": "#800080", // Purple
};

const GENDER_COLORS = ["#4CAF50", "#FF9800", "#9E9E9E"];
const RELIGION_COLORS = ["#2196F3", "#F44336", "#FFC107", "#9C27B0", "#607D8B"];
const AGE_COLORS = ["#E91E63", "#3F51B5", "#00BCD4", "#8BC34A", "#FF5722"];

export default function AnalysisDashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        house: "",
        sex: "",
        religion: "",
        age: ""
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    useEffect(() => {
        async function fetchData() {
            const snapshot = await getDocs(collection(db, "registrations"));
            setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }
        fetchData();
    }, []);

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Filter and search registrations
    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg => {
            const matchesSearch =
                reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.age?.toString().includes(searchTerm) ||
                reg.phone?.includes(searchTerm) ||
                reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.religion?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesHouse = !filters.house || reg.house === filters.house;
            const matchesSex = !filters.sex || reg.sex === filters.sex;
            const matchesReligion = !filters.religion || reg.religion === filters.religion;
            const matchesAge = !filters.age || reg.age?.toString() === filters.age;

            return matchesSearch && matchesHouse && matchesSex && matchesReligion && matchesAge;
        });
    }, [registrations, searchTerm, filters]);

    // Sort registrations
    const sortedRegistrations = useMemo(() => {
        if (!sortConfig.key) return filteredRegistrations;

        return [...filteredRegistrations].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredRegistrations, sortConfig]);

    // Get unique values for filter dropdowns
    const uniqueHouses = useMemo(() => [...new Set(registrations.map(r => r.house).filter(Boolean))], [registrations]);
    const uniqueSexes = useMemo(() => [...new Set(registrations.map(r => r.sex).filter(Boolean))], [registrations]);
    const uniqueReligions = useMemo(() => [...new Set(registrations.map(r => r.religion).filter(Boolean))], [registrations])

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
                    <p className="font-semibold">{getShortHouseName(payload[0].name)}</p>
                    <p className="text-sm">{`Count: ${payload[0].value}`}</p>
                    <p className="text-sm">{`Percentage: ${payload[0].payload.percentage}%`}</p>
                </div>
            );
        }
        return null;
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            house: "",
            sex: "",
            religion: "",
            age: ""
        });
        setSearchTerm("");
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

                {/* Search and Filter Section */}
                <section className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
                        <span className="bg-blue-100 p-2 rounded-lg mr-2">🔍</span>
                        Search & Filter Registrations
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        {/* Search Input */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name, age, phone, email, or religion"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>

                        {/* House Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">House</label>
                            <select
                                value={filters.house}
                                onChange={(e) => setFilters({...filters, house: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">All Houses</option>
                                {uniqueHouses.map(house => (
                                    <option key={house} value={house}>{house}</option>
                                ))}
                            </select>
                        </div>

                        {/* Gender Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                value={filters.sex}
                                onChange={(e) => setFilters({...filters, sex: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">All Genders</option>
                                {uniqueSexes.map(sex => (
                                    <option key={sex} value={sex}>{sex}</option>
                                ))}
                            </select>
                        </div>

                        {/* Religion Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                            <select
                                value={filters.religion}
                                onChange={(e) => setFilters({...filters, religion: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="">All Religions</option>
                                {uniqueReligions.map(religion => (
                                    <option key={religion} value={religion}>{religion}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Showing {filteredRegistrations.length} of {registrations.length} registrations
                        </div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </section>

                {/* Registrations Table */}
                <section className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
                        <span className="bg-green-100 p-2 rounded-lg mr-2">📋</span>
                        All Registrations ({filteredRegistrations.length})
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('age')}
                                >
                                    Age {sortConfig.key === 'age' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('sex')}
                                >
                                    Gender {sortConfig.key === 'sex' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('religion')}
                                >
                                    Religion {sortConfig.key === 'religion' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('house')}
                                >
                                    House {sortConfig.key === 'house' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {sortedRegistrations.length > 0 ? (
                                sortedRegistrations.map((reg, index) => (
                                    <tr key={reg.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {reg.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.age || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.sex || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.religion || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span
                                                    className="px-2 py-1 rounded-full text-xs text-white"
                                                    style={{ backgroundColor: HOUSE_COLORS[reg.house] || '#ccc' }}
                                                >
                                                    {getShortHouseName(reg.house) || 'N/A'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.email || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No registrations found matching your criteria
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>

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
                                    {getShortHouseName(h.name)}
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
                                    label={({ name, percentage }) => `${getShortHouseName(name)}: ${percentage}%`}
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
                                    formatter={(value) => <span className="text-sm">{getShortHouseName(value)}</span>}
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