// src/hooks/useRegistration.js
import { useState, useEffect } from "react";
import { HOUSES, HOUSE_KEYS, getHouseByKey } from "../utils/houseMapping";

export default function useRegistration() {
    const [registrants, setRegistrants] = useState([]);
    const [lastAssigned, setLastAssigned] = useState(null);

    // Load saved registrants (if any) and normalize house info
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("registrants") || "[]");
            const normalized = saved.map((r) => {
                // if old entries used houseName or house, try to map to a key
                const copy = { ...r };
                if (!copy.houseKey) {
                    const foundKey = HOUSE_KEYS.find(
                        (k) =>
                            (r.house && String(r.house).toLowerCase() === String(HOUSES[k].name).toLowerCase()) ||
                            (r.houseName && String(r.houseName).toLowerCase() === String(HOUSES[k].name).toLowerCase())
                    );
                    if (foundKey) {
                        copy.houseKey = foundKey;
                        copy.houseName = HOUSES[foundKey].name;
                        copy.houseColor = HOUSES[foundKey].color;
                    }
                } else {
                    const h = getHouseByKey(copy.houseKey);
                    if (h) {
                        copy.houseName = h.name;
                        copy.houseColor = h.color;
                    }
                }
                return copy;
            });
            setRegistrants(normalized);
        } catch (e) {
            setRegistrants([]);
        }
    }, []);

    // persist
    useEffect(() => {
        localStorage.setItem("registrants", JSON.stringify(registrants));
    }, [registrants]);

    // Balanced assignment: choose randomly among the min-count houses
    const handleRegister = (form) => {
        // compute current counts
        const counts = { RED: 0, YELLOW: 0, BLUE: 0, PURPLE: 0 };
        registrants.forEach((r) => {
            if (r.houseKey && Object.prototype.hasOwnProperty.call(counts, r.houseKey)) {
                counts[r.houseKey] = counts[r.houseKey] + 1;
            }
        });

        const min = Math.min(...Object.values(counts));
        const eligible = Object.keys(counts).filter((k) => counts[k] === min);
        const chosenKey = eligible[Math.floor(Math.random() * eligible.length)];
        const house = HOUSES[chosenKey];

        const newRegistrant = {
            id: Date.now(),
            fullName: form.name || "",
            sex: form.sex || "",
            age: form.age ? Number(form.age) : null,
            religion: form.religion || "",
            email: form.email || "",
            phone: form.phone || "",
            houseKey: chosenKey,
            houseName: house.name,
            houseColor: house.color,
            createdAt: new Date().toISOString(),
        };

        setRegistrants((prev) => [...prev, newRegistrant]);
        setLastAssigned(newRegistrant);
    };

    const clearLastAssigned = () => {
        setLastAssigned(null);
    };

    return {
        registrants,
        lastAssigned,
        handleRegister,
        clearLastAssigned
    };
}