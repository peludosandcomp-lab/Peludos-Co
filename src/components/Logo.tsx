import React from "react";

export type LogoVariant = "full" | "emblem" | "text" | "horizontal";
export type LogoTheme = "original" | "gold" | "dark" | "white";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  theme?: LogoTheme;
  showSubtitle?: boolean;
}

/**
 * Peludos & Co - PREMIUM PET CARE
 * Official Brand Logo Component
 */
export default function Logo({
  variant = "horizontal",
  size = "md",
  className = "",
  theme = "original",
  showSubtitle = false,
}: LogoProps) {
  // Dimensions map
  const emblemSizes: Record<LogoSize, number> = {
    xs: 32,
    sm: 40,
    md: 54,
    lg: 84,
    xl: 120,
    "2xl": 180,
  };

  const textWidths: Record<LogoSize, number> = {
    xs: 120,
    sm: 155,
    md: 205,
    lg: 275,
    xl: 360,
    "2xl": 480,
  };

  const fullHeights: Record<LogoSize, number> = {
    xs: 55,
    sm: 80,
    md: 115,
    lg: 175,
    xl: 240,
    "2xl": 340,
  };

  const emblemPx = emblemSizes[size] || 54;
  const textPx = textWidths[size] || 205;
  const fullPx = fullHeights[size] || 115;

  // Filter styles based on theme
  const themeFilter =
    theme === "white"
      ? "brightness(0) invert(1)"
      : theme === "dark"
      ? "brightness(0.15) contrast(1.4)"
      : "none";

  // 1. EMBLEM ONLY (Shield with dog & cat)
  if (variant === "emblem") {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: emblemPx, height: emblemPx }}
      >
        <img
          src="/logo-emblem.svg"
          alt="Peludos & Co Emblem"
          className="w-full h-full object-contain pointer-events-none transition-all duration-300"
          style={{ filter: themeFilter }}
        />
      </div>
    );
  }

  // 2. TEXT ONLY (Brand name + Subtitle)
  if (variant === "text") {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center select-none ${className}`}
        style={{ width: textPx }}
      >
        <img
          src="/logo-text.svg"
          alt="Peludos & Co - Premium Pet Care"
          className="w-full h-auto object-contain pointer-events-none transition-all duration-300"
          style={{ filter: themeFilter }}
        />
        {showSubtitle && (
          <span className="text-[9px] tracking-[0.32em] uppercase font-medium text-[#DFCCA8] mt-1">
            PREMIUM PET CARE
          </span>
        )}
      </div>
    );
  }

  // 3. FULL VERTICAL LOGO
  if (variant === "full") {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center select-none text-center ${className}`}
        style={{ height: fullPx }}
      >
        <img
          src="/logo-full.svg"
          alt="Peludos & Co - Premium Pet Care"
          className="h-full w-auto object-contain pointer-events-none transition-all duration-300"
          style={{ filter: themeFilter }}
        />
      </div>
    );
  }

  // 4. HORIZONTAL COMPOSITION (Emblem + Text)
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src="/logo-emblem.svg"
        alt="Peludos & Co"
        style={{ width: emblemPx * 0.9, height: emblemPx * 0.9, filter: themeFilter }}
        className="object-contain shrink-0 pointer-events-none"
      />
      <div className="flex flex-col justify-center">
        <span className="font-bold tracking-tight text-base sm:text-lg leading-tight text-[#FAF9F6]">
          Peludos &amp; Co
        </span>
        <span className="text-[8px] sm:text-[9px] tracking-[0.28em] uppercase font-medium text-[#DFCCA8] mt-0.5">
          PREMIUM PET CARE
        </span>
      </div>
    </div>
  );
}
