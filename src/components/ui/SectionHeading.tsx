import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-4xl font-normal tracking-wide text-foreground sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-xl text-lg leading-relaxed text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
      <div className={cn("gold-line mt-8 w-24", align === "center" && "mx-auto")} />
    </div>
  );
}
