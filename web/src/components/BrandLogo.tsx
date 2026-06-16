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
      <span className={clsx("font-bold leading-none text-lg", textClassName)}>
        <span style={{ color: "#1B75B8" }}>Prompt2</span>
        <span style={{ color: "#F07030" }}>Post</span>
      </span>
    </Link>
  );
}
