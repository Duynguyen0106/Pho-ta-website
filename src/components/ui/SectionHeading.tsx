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
      <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#c9a962]">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-4xl font-light tracking-wide text-[#f5f0e6] sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-xl text-base leading-relaxed text-[#9a9085]",
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
