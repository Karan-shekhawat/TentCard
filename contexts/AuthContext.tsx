import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserData, SavedNameplate } from '../userTypes';
import { AppConfig, NameEntry } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
    userData: UserData | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    saveCurrentSettings: (config: AppConfig, names: NameEntry[]) => Promise<void>;
    saveToHistory: (name: string, config: AppConfig, names: NameEntry[]) => Promise<void>;
    restoreFromHistory: (id: string) => { config: AppConfig; names: NameEntry[] } | null;
    deleteFromHistory: (id: string) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const HISTORY_LIMIT = 20;
const LOCAL_STORAGE_KEY = 'tentcard_guest_data';

// Helper to convert Firebase User to UserProfile
const toUserProfile = (user: User): UserProfile => ({
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || undefined,
    createdAt: new Date(),
});

// Helper for guest localStorage
const getGuestData = (): { config: AppConfig; names: NameEntry[]; history: SavedNameplate[] } | null => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // Convert date strings back to Date objects
            if (parsed.history) {
                parsed.history = parsed.history.map((h: SavedNameplate) => ({
                    ...h,
                    savedAt: new Date(h.savedAt),
                }));
            }
            return parsed;
        }
    } catch (e) {
        console.error('Error reading guest data:', e);
    }
    return null;
};

const saveGuestData = (config: AppConfig, names: NameEntry[], history: SavedNameplate[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ config, names, history }));
    } catch (e) {
        console.error('Error saving guest data:', e);
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load user data from Firestore
    const loadUserData = async (uid: string): Promise<UserData | null> => {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as UserData;
                // Convert Firestore timestamps to Date objects
                if (data.history) {
                    data.history = data.history.map((h) => ({
                        ...h,
                        savedAt: h.savedAt instanceof Date ? h.savedAt : new Date((h.savedAt as any).seconds * 1000),
                    }));
                }
                return data;
            }
        } catch (e) {
            console.error('Error loading user data:', e);
        }
        return null;
    };

    // Save user data to Firestore
    const saveUserData = async (uid: string, data: Partial<UserData>) => {
        try {
            const docRef = doc(db, 'users', uid);
            await setDoc(docRef, data, { merge: true });
        } catch (e) {
            console.error('Error saving user data:', e);
            throw e;
        }
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const profile = toUserProfile(firebaseUser);
                setUser(profile);
                const data = await loadUserData(firebaseUser.uid);
                setUserData(data);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e: any) {
            setError(e.message || 'Login failed');
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email: string, password: string, displayName?: string) => {
        try {
            setError(null);
            setLoading(true);
            const result = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName) {
                await updateProfile(result.user, { displayName });
            }

            // Initialize user document in Firestore
            const profile = toUserProfile(result.user);
            profile.displayName = displayName;

            const initialData: UserData = {
                profile,
                currentConfig: DEFAULT_CONFIG,
                currentNames: [],
                history: [],
            };

            await saveUserData(result.user.uid, initialData);
            setUserData(initialData);
        } catch (e: any) {
            setError(e.message || 'Signup failed');
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        try {
            setError(null);
            setLoading(true);
            const result = await signInWithPopup(auth, googleProvider);

            // Check if user document exists, if not create it
            const existingData = await loadUserData(result.user.uid);
            if (!existingData) {
                const profile = toUserProfile(result.user);
                const initialData: UserData = {
                    profile,
                    currentConfig: DEFAULT_CONFIG,
                    currentNames: [],
                    history: [],
                };
                await saveUserData(result.user.uid, initialData);
                setUserData(initialData);
            } else {
                setUserData(existingData);
            }
        } catch (e: any) {
            setError(e.message || 'Google login failed');
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserData(null);
        } catch (e: any) {
            setError(e.message || 'Logout failed');
        }
    };

    const saveCurrentSettings = async (config: AppConfig, names: NameEntry[]) => {
        if (user && userData) {
            const updated = { ...userData, currentConfig: config, currentNames: names };
            await saveUserData(user.uid, updated);
            setUserData(updated);
        } else {
            // Guest mode - save to localStorage
            const guestData = getGuestData();
            saveGuestData(config, names, guestData?.history || []);
        }
    };

    const saveToHistory = async (name: string, config: AppConfig, names: NameEntry[]) => {
        const newEntry: SavedNameplate = {
            id: Date.now().toString(),
            name,
            config,
            names,
            savedAt: new Date(),
        };

        if (user && userData) {
            let history = [...(userData.history || []), newEntry];
            // Enforce 20 item limit
            if (history.length > HISTORY_LIMIT) {
                history = history.slice(-HISTORY_LIMIT);
            }
            const updated = { ...userData, history };
            await saveUserData(user.uid, updated);
            setUserData(updated);
        } else {
            // Guest mode
            const guestData = getGuestData();
            let history = [...(guestData?.history || []), newEntry];
            if (history.length > HISTORY_LIMIT) {
                history = history.slice(-HISTORY_LIMIT);
            }
            saveGuestData(guestData?.config || config, guestData?.names || names, history);
        }
    };

    const restoreFromHistory = (id: string): { config: AppConfig; names: NameEntry[] } | null => {
        const history = user ? userData?.history : getGuestData()?.history;
        const entry = history?.find((h) => h.id === id);
        if (entry) {
            return { config: entry.config, names: entry.names };
        }
        return null;
    };

    const deleteFromHistory = async (id: string) => {
        if (user && userData) {
            const history = userData.history.filter((h) => h.id !== id);
            const updated = { ...userData, history };
            await saveUserData(user.uid, updated);
            setUserData(updated);
        } else {
            const guestData = getGuestData();
            if (guestData) {
                const history = guestData.history.filter((h) => h.id !== id);
                saveGuestData(guestData.config, guestData.names, history);
            }
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                userData,
                login,
                signup,
                loginWithGoogle,
                logout,
                saveCurrentSettings,
                saveToHistory,
                restoreFromHistory,
                deleteFromHistory,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
