import React from 'react';
import { Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from 'next-intl';

interface InUIDocTooltipProps {
    titleKey: string;
    descriptionKey: string;
    iconSize?: number;
    className?: string;
}

export function InUIDocTooltip({ titleKey, descriptionKey, iconSize = 16, className }: InUIDocTooltipProps) {
    const t = useTranslations('Docs');

    // Fallback if translations aren't added to next-intl yet
    const title = t.has(titleKey) ? t(titleKey) : titleKey;
    const desc = t.has(descriptionKey) ? t(descriptionKey) : descriptionKey;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className={`inline-flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-help shrink-0 ${className}`} style={{ width: iconSize + 8, height: iconSize + 8 }}>
                    <Info size={iconSize} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-5 rounded-2xl shadow-xl border-primary/10 glass z-[100]" sideOffset={5}>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Info size={14} className="animate-pulse" />
                        </div>
                        <h4 className="font-bold text-sm tracking-tight text-foreground">{title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-2 border-l-2 border-primary/20">
                        {desc}
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
}
