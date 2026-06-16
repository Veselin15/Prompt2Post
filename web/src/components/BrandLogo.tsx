"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface BrandLogoProps {
  className?: string;
  /** When true, renders only the icon mark without the wordmark. */
  iconOnly?: boolean;
  height?: number;
}

export default function BrandLogo({
  className,
  iconOnly = false,
  height = 32,
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
      className={clsx("flex items-center", className)}
      aria-label="Prompt2Post home"
    >
      {iconOnly ? (
        <Image
          src="/logo.png"
          alt="Prompt2Post"
          height={height}
          width={height}
          className="shrink-0"
          priority
        />
      ) : (
        <Image
          src="/logo_text.png"
          alt="Prompt2Post"
          height={height}
          width={0}
          style={{ width: "auto" }}
          className="shrink-0"
          priority
        />
      )}
    </Link>
  );
}
