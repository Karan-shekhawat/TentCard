
import { AppConfig, NameEntry } from './types';

// User profile structure
export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    createdAt: Date;
}

// Saved nameplate configuration with metadata
export interface SavedNameplate {
    id: string;
    name: string;           // User-given name for this save
    config: AppConfig;      // Full styling config
    names: NameEntry[];     // Names on the plate
    savedAt: Date;
}

// Full user data in database
export interface UserData {
    profile: UserProfile;
    currentConfig: AppConfig;
    currentNames: NameEntry[];
    history: SavedNameplate[];  // Past saved nameplates (max 20)
}

// Auth state for context
export interface AuthState {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
}
