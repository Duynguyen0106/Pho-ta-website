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
      <p className="text-base font-medium uppercase tracking-[0.18em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-5xl font-normal tracking-wide text-foreground sm:text-6xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-6 max-w-xl text-xl leading-relaxed text-muted",
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
