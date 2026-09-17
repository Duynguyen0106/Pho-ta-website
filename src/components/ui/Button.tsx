import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" &&
            "bg-[#1a3c34] text-[#faf7f2] hover:bg-[#245046]",
          variant === "secondary" &&
            "bg-[#c9a962] text-[#1a3c34] hover:bg-[#b8984f]",
          variant === "outline" &&
            "border border-[#1a3c34] text-[#1a3c34] hover:bg-[#1a3c34] hover:text-[#faf7f2]",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-2.5 text-sm",
          size === "lg" && "px-8 py-3 text-base",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
