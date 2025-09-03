// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut,
    updatePassword,
    updateEmail,
    sendEmailVerification,
    deleteUser as firebaseDeleteUser,
    signInWithEmailAndPassword, // Add this import
    createUserWithEmailAndPassword // Add this import
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Login function
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Signup function
    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Create a user document in Firestore
                return setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: email,
                    role: 'user',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            });
    };

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

    const value = {
        currentUser,
        userRole,
        login, // Make sure this is included
        signup, // Make sure this is included
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