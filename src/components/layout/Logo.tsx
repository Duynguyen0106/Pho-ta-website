import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  linked?: boolean;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function Logo({
  href = "/",
  linked = true,
  className,
  imageClassName,
  priority = false,
}: LogoProps) {
  const image = (
    <Image
      src="/images/logo.jpg"
      alt="Pho Ta — Vietnamese restaurant"
      width={160}
      height={64}
      priority={priority}
      className={cn("h-14 w-auto object-contain sm:h-16", imageClassName)}
    />
  );

  if (!linked) {
    return <div className={cn("inline-block shrink-0", className)}>{image}</div>;
  }

  return (
    <Link href={href} className={cn("inline-block shrink-0", className)}>
      {image}
    </Link>
  );
}
