// src/utils/houseMapping.js
export const HOUSES = {
    RED: { key: "RED", name: "Savour", color: "#ef4444", label: "Red" },
    YELLOW: { key: "YELLOW", name: "Holy Ghost Baptizer", color: "#f59e0b", label: "Yellow" },
    BLUE: { key: "BLUE", name: "Healer", color: "#3b82f6", label: "Blue" },
    PURPLE: { key: "PURPLE", name: "Coming King", color: "#a855f7", label: "Purple" },
};

export const HOUSE_KEYS = Object.keys(HOUSES);

export function getHouseByKey(key) {
    return HOUSES[key] || null;
}
