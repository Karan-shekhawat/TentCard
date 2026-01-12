import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const { login, signup, loginWithGoogle, error, clearError } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        clearError();

        if (!email || !password) {
            setLocalError('Please fill in all required fields');
            return;
        }

        if (mode === 'signup' && password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signup(email, password, displayName || undefined);
            }
            onClose();
            resetForm();
        } catch (e) {
            // Error is handled by context
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLocalError(null);
        clearError();
        setIsLoading(true);
        try {
            await loginWithGoogle();
            onClose();
            resetForm();
        } catch (e) {
            // Error is handled by context
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setDisplayName('');
        setLocalError(null);
        clearError();
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        resetForm();
    };

    const displayError = localError || error;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] transition-all duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[360px] mx-4 overflow-hidden border border-gray-100 flex flex-col">
                {/* Header - Minimalist */}
                <div className="relative pt-8 pb-4 px-6 text-center">
                    <button
                        onClick={() => { onClose(); resetForm(); }}
                        className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <X size={18} />
                    </button>

                    <div className="mx-auto w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                        <Lock className="text-blue-600" size={20} />
                    </div>

                    <h2 className="text-xl font-bold text-gray-800">
                        {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                    </h2>
                    <p className="text-gray-500 text-xs mt-1 px-4">
                        {mode === 'login'
                            ? 'Sign in to access your saved nameplates'
                            : 'Sign up to save your nameplate designs'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-8 pt-2 space-y-3.5">
                    {displayError && (
                        <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[11px] leading-tight font-medium">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            <span>{displayError}</span>
                        </div>
                    )}

                    {mode === 'signup' && (
                        <div>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Display Name (optional)"
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={mode === 'signup' ? 'Password (6+ chars)' : 'Password'}
                                required
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-blue-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                <span className="text-xs">Processing...</span>
                            </>
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <span className="px-2 bg-white">or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-[11px] text-gray-500 font-medium hover:text-blue-600 transition-colors"
                        >
                            {mode === 'login' ? (
                                <>New here? <span className="text-blue-600 font-bold">Create an account</span></>
                            ) : (
                                <>Already have an account? <span className="text-blue-600 font-bold">Sign in</span></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
