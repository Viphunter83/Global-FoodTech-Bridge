'use client';

import { useAuth, UserRole } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Shield, Truck, ShoppingBag } from 'lucide-react';

export function RoleSwitcher() {
    const { role, setRole } = useAuth();

    const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
        { id: 'MANUFACTURER', label: 'Manufacturer', icon: <Shield size={16} /> },
        { id: 'LOGISTICS', label: 'Logistics', icon: <Truck size={16} /> },
        { id: 'RETAILER', label: 'Retailer', icon: <ShoppingBag size={16} /> },
    ];

    return (
        <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 ml-4">
            <span className="text-xs uppercase font-bold text-gray-500 mr-2 hidden md:inline-block">Persona:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
                {roles.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${role === r.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                        title={`Switch to ${r.label}`}
                    >
                        <span className="mr-1.5">{r.icon}</span>
                        <span className="hidden lg:inline">{r.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
