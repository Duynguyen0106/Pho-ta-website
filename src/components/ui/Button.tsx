import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium uppercase tracking-[0.2em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-40",
          variant === "primary" &&
            "border border-[#c9a962] bg-[#c9a962] text-[#0a0908] hover:bg-[#dfc488] hover:border-[#dfc488]",
          variant === "secondary" &&
            "border border-[#c9a962]/60 bg-transparent text-[#c9a962] hover:border-[#c9a962] hover:bg-[#c9a962]/10",
          variant === "outline" &&
            "border border-[#f5f0e6]/30 bg-transparent text-[#f5f0e6] hover:border-[#c9a962] hover:text-[#c9a962]",
          variant === "ghost" &&
            "text-[#c9a962] hover:text-[#dfc488]",
          size === "sm" && "px-5 py-2 text-[10px]",
          size === "md" && "px-7 py-3 text-[11px]",
          size === "lg" && "px-10 py-4 text-xs",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
