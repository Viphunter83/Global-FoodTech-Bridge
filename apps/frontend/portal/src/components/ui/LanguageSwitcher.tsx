'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, locales } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState, useTransition } from 'react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const selectLanguage = (nextLocale: typeof locales[number]) => {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
        setIsOpen(false);
    };

    const labels = {
        en: 'English',
        ru: 'Русский',
        ar: 'العربية',
        vi: 'Tiếng Việt'
    };

    return (
        <div className="relative">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleOpen} 
                className="gap-2 focus-visible:ring-primary/20"
                disabled={isPending}
            >
                <Globe className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                <span className="uppercase font-bold">{locale}</span>
            </Button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl shadow-2xl glass border border-primary/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-2 pb-2 mb-2 border-b border-primary/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Select Language</span>
                    </div>
                    {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
                        <button
                            key={key}
                            onClick={() => selectLanguage(key)}
                            disabled={isPending}
                            className={`
                                flex w-full items-center px-4 py-2.5 text-sm transition-all rounded-xl mx-auto max-w-[90%]
                                ${locale === key 
                                    ? 'bg-primary/10 text-primary font-bold' 
                                    : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'
                                }
                            `}
                        >
                            <span className="flex-1 text-left">{labels[key]}</span>
                            {locale === key && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </button>
                    ))}
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

