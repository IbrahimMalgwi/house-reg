// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut,
    updatePassword,
    updateEmail,
    sendEmailVerification,
    deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role || 'user');
                    } else {
                        setUserRole('user');
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole('user');
                }
            } else {
                setUserRole(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    // ... other auth functions (updatePassword, updateEmail, etc.)

    const value = {
        currentUser,
        userRole,
        logout,
        updatePassword,
        updateEmail,
        sendEmailVerification,
        deleteUser: firebaseDeleteUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}