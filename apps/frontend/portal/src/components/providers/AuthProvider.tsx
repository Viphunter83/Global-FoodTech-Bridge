'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { removeSessionCookie } from '@/lib/cookies';

export type UserRole = 'MANUFACTURER' | 'LOGISTICS' | 'RETAILER' | 'ADMIN' | 'PENDING';

interface AuthContextType {
    user: User | null;
    role: UserRole;
    companyId: string | null;
    loading: boolean;
    logout: () => Promise<void>;
    getToken: () => Promise<string | null>;
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
                try {
                    // 1. Refresh session cookie & sync roles to Custom Claims via our API
                    const idToken = await firebaseUser.getIdToken();
                    const sessionRes = await fetch('/api/auth/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken })
                    });
                    
                    const sessionData = await sessionRes.json();

                    // 2. Extract role from ID Token Result (Custom Claims)
                    const tokenResult = await firebaseUser.getIdTokenResult();
                    const claimsRole = tokenResult.claims.role as UserRole;
                    
                    if (claimsRole) {
                        setRole(claimsRole);
                        console.log(`[GFTB-AUTH] Role resolved from JWT Claims: ${claimsRole}`);
                    } else if (sessionData.role) {
                        setRole(sessionData.role);
                        console.log(`[GFTB-AUTH] Role resolved from Session API: ${sessionData.role}`);
                    }

                    // 3. Optional: Fetch extra data (like companyId) from Firestore if NOT blocked
                    // We don't block the UI on this anymore
                    getDoc(doc(db, 'users', firebaseUser.uid)).then(userDoc => {
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            setCompanyId(data.companyId || null);
                            if (!claimsRole && data.role) setRole(data.role as UserRole);
                        }
                    }).catch(err => {
                        console.warn("[GFTB-AUTH] Optional Firestore data fetch failed (likely blocked), using JWT defaults.");
                    });

                } catch (error) {
                    console.error("[GFTB-AUTH] Initialization error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                // Remove session cookie
                removeSessionCookie();
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
        try {
            await fetch('/api/auth/session', { method: 'DELETE' });
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getToken = async () => {
        if (!user) return null;
        return await user.getIdToken();
    };

    return (
        <AuthContext.Provider value={{ user, role, companyId, loading, logout, getToken, setRole, setCompanyId }}>
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
