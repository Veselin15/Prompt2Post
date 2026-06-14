"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export default function BrandLogo({
  className,
  iconClassName = "w-5 h-5",
  textClassName = "gradient-text",
}: BrandLogoProps) {
  const pathname = usePathname();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className={clsx("flex items-center gap-2 font-bold", className)}
      aria-label="Prompt2Post home"
    >
      <Sparkles className={clsx(iconClassName, "text-brand-400 shrink-0")} />
      <span className={textClassName}>Prompt2Post</span>
    </Link>
  );
}
