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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>('PENDING');
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            setUser(firebaseUser);
            
            if (firebaseUser) {
                // Set session cookie for Middleware
                document.cookie = `gftb-session=${firebaseUser.uid}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

                try {
                    // 1. Try to fetch role from Firestore profiles
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setRole(data.role as UserRole);
                        setCompanyId(data.companyId || null);
                    } else {
                        // 2. Fallback: Check email (for initial admin setup) or default to PARTNER
                        if (firebaseUser.email?.includes('admin') || firebaseUser.email === 'olegvakin@gmail.com') {
                            setRole('ADMIN');
                        } else {
                            const storedRole = localStorage.getItem(`role_${firebaseUser.uid}`);
                            setRole((storedRole as UserRole) || 'PENDING'); 
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole('PENDING');
                }
            } else {
                // Remove session cookie
                document.cookie = 'gftb-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setRole('PENDING');
                setCompanyId(null);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, role, companyId, loading, logout, setRole, setCompanyId }}>
            {!loading && children}
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
