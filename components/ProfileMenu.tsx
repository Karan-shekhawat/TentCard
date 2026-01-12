import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Save, History, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileMenuProps {
    onOpenHistory: () => void;
    onSaveToHistory: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onOpenHistory, onSaveToHistory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            setIsLoggingOut(false);
            setIsOpen(false);
        }
    };

    if (!user) return null;

    const initials = user.displayName
        ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email[0].toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
                    {user.displayName || user.email}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                onSaveToHistory();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                            <Save size={16} className="text-gray-400" />
                            Save Current Design
                        </button>
                        <button
                            onClick={() => {
                                onOpenHistory();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                            <History size={16} className="text-gray-400" />
                            View History
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors disabled:opacity-50"
                        >
                            {isLoggingOut ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <LogOut size={16} />
                            )}
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileMenu;
