'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'MANUFACTURER' | 'LOGISTICS' | 'RETAILER';

interface AuthContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    companyId: string | null;
    setCompanyId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole>('RETAILER');

    const [companyId, setCompanyId] = useState<string | null>(null);

    useEffect(() => {
        // Load role from local storage if available
        const storedRole = localStorage.getItem('gfb_user_role');
        if (storedRole) {
            setRole(storedRole as UserRole);
        }

        const storedCompany = localStorage.getItem('gfb_company_id');
        if (storedCompany) {
            setCompanyId(storedCompany);
        }
    }, []);

    const updateRole = (newRole: UserRole) => {
        setRole(newRole);
        localStorage.setItem('gfb_user_role', newRole);
    };

    const updateCompanyId = (newId: string | null) => {
        setCompanyId(newId);
        if (newId) {
            localStorage.setItem('gfb_company_id', newId);
        } else {
            localStorage.removeItem('gfb_company_id');
        }
    };

    return (
        <AuthContext.Provider value={{ role, setRole: updateRole, companyId, setCompanyId: updateCompanyId }}>
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
