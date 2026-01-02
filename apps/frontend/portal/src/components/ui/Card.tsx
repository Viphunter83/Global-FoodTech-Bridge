import { HTMLAttributes, FC } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Card: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
    return (
        <div
            className={twMerge(
                clsx("rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm", className)
            )}
            {...props}
        />
    );
};
