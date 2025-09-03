// src/utils/userHelpers.js
import { db } from "../firebase";
import {  doc, setDoc, getDoc,  deleteDoc } from "firebase/firestore";

// Create or update user profile
export const updateUserProfile = async (userId, userData) => {
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, {
            ...userData,
            updatedAt: new Date(),
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

// Get user profile
export const getUserProfile = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        }

        // Create default profile if it doesn't exist
        const defaultProfile = {
            displayName: "",
            phone: "",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await setDoc(userRef, defaultProfile);
        return { id: userSnap.id, ...defaultProfile };
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};

// Delete user profile
export const deleteUserProfile = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        return true;
    } catch (error) {
        console.error("Error deleting user profile:", error);
        throw error;
    }
};