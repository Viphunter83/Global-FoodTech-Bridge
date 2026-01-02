import { ButtonHTMLAttributes, FC } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
}

export const Button: FC<ButtonProps> = ({ className, variant = "primary", ...props }) => {
    return (
        <button
            className={twMerge(
                clsx(
                    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    {
                        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500": variant === "primary",
                        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500": variant === "secondary",
                    }
                ),
                className
            )}
            {...props}
        />
    );
};
