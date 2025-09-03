// src/utils/storageHelpers.js
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Upload profile picture
export const uploadProfilePicture = async (userId, file) => {
    try {
        const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw error;
    }
};

// Delete profile picture
export const deleteProfilePicture = async (userId, fileName) => {
    try {
        const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.error("Error deleting profile picture:", error);
        throw error;
    }
};