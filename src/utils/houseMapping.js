// src/utils/houseMapping.js
export const HOUSES = {
    RED: { name: "Jesus Christ Our Saviour", color: "#FF0000" },
    YELLOW: { name: "Jesus Christ The Holy Ghost Baptizer", color: "#FFD700" },
    BLUE: { name: "Jesus Christ Our Healer", color: "#0000FF" },
    PURPLE: { name: "Jesus Christ Our Coming King", color: "#800080" },
};

export const HOUSE_KEYS = Object.keys(HOUSES);

export function getHouseByKey(key) {
    return HOUSES[key];
}

// Add the short name helper function
export const getShortHouseName = (fullName) => {
    const mappings = {
        "Jesus Christ Our Saviour": "Our Saviour",
        "Jesus Christ The Holy Ghost Baptizer": "Holy Ghost Baptizer",
        "Jesus Christ Our Healer": "Our Healer",
        "Jesus Christ Our Coming King": "Our Coming King"
    };
    return mappings[fullName] || fullName;
};