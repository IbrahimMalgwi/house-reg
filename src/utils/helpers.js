// src/utils/helpers.js
export const getShortHouseName = (fullName) => {
    const mappings = {
        "Jesus Christ Our Saviour": "Our Saviour",
        "Jesus Christ The Holy Ghost Baptizer": "Holy Ghost Baptizer",
        "Jesus Christ Our Healer": "Our Healer",
        "Jesus Christ Our Coming King": "Our Coming King"
    };
    return mappings[fullName] || fullName;
};

// You can add other helper functions here too