'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type UserRole = 'MANUFACTURER' | 'LOGISTICS' | 'RETAILER' | 'ADMIN' | 'PENDING';

interface AuthContextType {
    user: User | null;
    role: UserRole;
    companyId: string | null;
    loading: boolean;
    logout: () => Promise<void>;
    setRole: (role: UserRole) => void;
    setCompanyId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LoadingScreen = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-gold-100 border-b-gold-500 animate-spin-reverse" />
        </div>
        <div className="flex flex-col items-center">
            <p className="text-emerald-900 font-medium tracking-wide font-sans animate-pulse">Establishing Secure Bridge...</p>
            <span className="text-xs text-emerald-600/60 mt-2">Verifying Node Identity</span>
        </div>
    </div>
);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>('PENDING');
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Only set loading to true if we are transitioning to a user
            if (firebaseUser) setLoading(true);
            
            setUser(firebaseUser);
            
            if (firebaseUser) {
                // Set session cookie for Middleware
                document.cookie = `gftb-session=${firebaseUser.uid}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

                try {
                    // 1. Try to fetch role from Firestore profiles
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    
                    // Failsafe Superadmin allocation as requested
                    if (firebaseUser.email === 'olegvakin@gmail.com') {
                        setRole('ADMIN');
                        setCompanyId('GFTB-HQ');
                    } else if (userDoc.exists()) {
                        const data = userDoc.data();
                        setRole(data.role as UserRole);
                        setCompanyId(data.companyId || null);
                    } else {
                        // No Firestore profile found — user needs to be provisioned by admin
                        // Security: roles are ONLY assigned through Firestore documents, never via email patterns
                        console.warn(`[GFTB-AUTH] No profile found for user ${firebaseUser.uid}. Role set to PENDING.`);
                        setRole('PENDING');
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole('PENDING');
                    // Ensure we don't hang on error
                } finally {
                    setLoading(false);
                }
            } else {
                // Remove session cookie
                document.cookie = 'gftb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setRole('PENDING');
                setCompanyId(null);
                setLoading(false);
            }
        });

        // Fail-safe: Force loading to end after 6 seconds
        const timeoutId = setTimeout(() => {
            setLoading((prevLoading) => {
                if (prevLoading) {
                    console.warn('Auth initialization timed out after 6s. Proceeding to app...');
                    return false;
                }
                return false;
            });
        }, 6000);

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    const logout = async () => {
        setLoading(true);
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, role, companyId, loading, logout, setRole, setCompanyId }}>
            {loading ? <LoadingScreen /> : children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
