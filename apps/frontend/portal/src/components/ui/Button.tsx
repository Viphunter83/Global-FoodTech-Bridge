import { ButtonHTMLAttributes, FC } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

export const Button: FC<ButtonProps> = ({ className, variant = "primary", size = "default", ...props }) => {
    return (
        <button
            className={twMerge(
                clsx(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white",
                    {
                        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent": variant === "primary",
                        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 border border-transparent": variant === "secondary",
                        "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
                        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",

                        "h-10 px-4 py-2 text-sm": size === "default",
                        "h-9 rounded-md px-3 text-sm": size === "sm",
                        "h-11 rounded-md px-8 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    }
                ),
                className
            )}
            {...props}
        />
    );
};
