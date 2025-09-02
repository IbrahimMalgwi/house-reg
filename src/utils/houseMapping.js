// src/utils/houseMapping.js

// Centralized mapping of houses
export const HOUSES = {
    RED: { name: "Jesus Christ Our Saviour", color: "#FF0000" },
    YELLOW: { name: "Jesus Christ The Holy Ghost Baptizer", color: "#FFD700" },
    BLUE: { name: "Jesus Christ Our Healer", color: "#0000FF" },
    PURPLE: { name: "Jesus Christ Our Coming King", color: "#800080" },
};

// List of keys (RED, YELLOW, BLUE, PURPLE)
export const HOUSE_KEYS = Object.keys(HOUSES);

// Get house by key (e.g. "RED")
export function getHouseByKey(key) {
    return HOUSES[key] || null;
}

// Get the full name from a house key
export function getFullHouseName(key) {
    return HOUSES[key]?.name || key;
}

// Get just the color hex
export function getHouseColor(key) {
    return HOUSES[key]?.color || "#999999";
}

// Get short names for charts or tags
export function getShortHouseName(fullName) {
    const mappings = {
        "Jesus Christ Our Saviour": "Our Saviour",
        "Jesus Christ The Holy Ghost Baptizer": "Holy Ghost Baptizer",
        "Jesus Christ Our Healer": "Our Healer",
        "Jesus Christ Our Coming King": "Our Coming King",
    };
    return mappings[fullName] || fullName;
}

// utils/houseMapping.js
export const THEME_COLORS = [
    "#ef4444", // Red (Saviour)
    "#facc15", // Yellow (Holy Ghost Baptizer)
    "#3b82f6", // Blue (Healer)
    "#8b5cf6", // Purple (Coming King)
];




