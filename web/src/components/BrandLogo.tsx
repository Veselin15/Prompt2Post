"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface BrandLogoProps {
  className?: string;
  iconSize?: number;
  textClassName?: string;
}

export default function BrandLogo({
  className,
  iconSize = 40,
  textClassName,
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
      className={clsx("flex items-center gap-2.5", className)}
      aria-label="Prompt2Post home"
    >
      <Image
        src="/logo.png"
        alt=""
        height={iconSize}
        width={iconSize}
        className="shrink-0"
        priority
      />
      <span
        className={clsx("font-bold leading-none text-lg", textClassName)}
        style={{
          background: "linear-gradient(to right, #1B75B8 0%, #8B3EDE 50%, #F07030 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        }}
      >
        Prompt2Post
      </span>
    </Link>
  );
}
