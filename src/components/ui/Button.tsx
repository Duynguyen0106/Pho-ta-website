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
          "inline-flex items-center justify-center font-sans font-medium uppercase tracking-[0.14em] transition duration-300 disabled:cursor-not-allowed disabled:opacity-40",
          variant === "primary" &&
            "border border-gold bg-gold text-white hover:border-gold-light hover:bg-gold-light",
          variant === "secondary" &&
            "border border-gold/50 bg-transparent text-gold hover:border-gold hover:bg-gold/10",
          variant === "outline" &&
            "border border-foreground/25 bg-transparent text-foreground hover:border-gold hover:text-gold",
          variant === "ghost" && "text-gold hover:text-gold-light",
          size === "sm" && "px-5 py-3 text-base",
          size === "md" && "px-8 py-3.5 text-base",
          size === "lg" && "px-10 py-4 text-lg",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
