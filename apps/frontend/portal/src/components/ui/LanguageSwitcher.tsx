'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import { Button } from '@/components/ui/Button';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const selectLanguage = (lang: 'en' | 'ru' | 'ar') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    const labels = {
        en: 'English',
        ru: 'Русский',
        ar: 'العربية'
    };

    return (
        <div className="relative">
            <Button variant="ghost" size="sm" onClick={toggleOpen} className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="uppercase">{language}</span>
            </Button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
                            <button
                                key={key}
                                onClick={() => selectLanguage(key)}
                                className={`
                                    block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                                    ${language === key ? 'bg-gray-50 font-bold' : ''}
                                `}
                                role="menuitem"
                            >
                                {labels[key]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Click outside closer overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
