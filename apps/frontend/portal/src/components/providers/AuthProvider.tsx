'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'MANUFACTURER' | 'LOGISTICS' | 'RETAILER';

interface AuthContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole>('RETAILER');

    useEffect(() => {
        // Load role from local storage if available
        const stored = localStorage.getItem('gfb_user_role');
        if (stored) {
            setRole(stored as UserRole);
        }
    }, []);

    const updateRole = (newRole: UserRole) => {
        setRole(newRole);
        localStorage.setItem('gfb_user_role', newRole);
    };

    return (
        <AuthContext.Provider value={{ role, setRole: updateRole }}>
            {children}
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
