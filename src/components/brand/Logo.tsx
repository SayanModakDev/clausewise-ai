import React from 'react';
import Link from 'next/link';

export type LogoVariant = 'full' | 'symbol' | 'compact' | 'wordmark';
export type LogoTheme = 'light' | 'dark' | 'auto';
export type LogoSize = 'sm' | 'md' | 'lg' | 'custom';

export interface LogoProps {
  /**
   * Layout format of the logo:
   * - 'full': Symbol tile + Wordmark
   * - 'symbol': Symbol tile only
   * - 'compact': Small symbol + compact wordmark for narrow spaces
   * - 'wordmark': Text-only branding
   */
  variant?: LogoVariant;
  /**
   * Surface theme:
   * - 'light': Dark text on light surface (default)
   * - 'dark': White/light text on dark surface
   * - 'auto': Uses responsive Tailwind colors
   */
  theme?: LogoTheme;
  /**
   * Presets for standard heights:
   * - 'sm': 28px height
   * - 'md': 36px height (default for navbar)
   * - 'lg': 44px height
   * - 'custom': Size controlled via className
   */
  size?: LogoSize;
  /**
   * Optional custom CSS classes
   */
  className?: string;
  /**
   * Whether to wrap in a Next.js link to '/'
   * Default: false (caller can wrap in Link or button as desired)
   */
  href?: string | null;
  /**
   * Optional tagline underneath the wordmark
   */
  showTagline?: boolean;
}

/**
 * Pure SVG Symbol Mark for ClauseWise AI.
 * Represents a legal document folio with an integrated "C" arc, folded page corner,
 * and precision clause navigation beam with forward insight guide.
 */
export function LogoSymbol({
  size = 36,
  theme = 'light',
  withTile = true,
  className = '',
}: {
  size?: number | string;
  theme?: LogoTheme;
  withTile?: boolean;
  className?: string;
}) {
  const isDark = theme === 'dark';
  const tileFill = isDark ? '#1E293B' : '#0F172A';
  const tileStroke = isDark ? '#334155' : '#1E293B';
  const spineColor = isDark ? '#60A5FA' : '#3B82F6';
  const chevronColor = isDark ? '#93C5FD' : '#60A5FA';

  if (!withTile) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
        aria-hidden="true"
      >
        <path
          d="M22 9.5H13C10.2386 9.5 8 11.7386 8 14.5V19.5C8 22.2614 10.2386 24.5 13 24.5H22"
          stroke={isDark ? '#60A5FA' : '#2563EB'}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M18 5.5L22.5 10H18V5.5Z" fill="#38BDF8" />
        <path
          d="M12.5 17H19.5M17.5 14.5L19.5 17L17.5 19.5"
          stroke={isDark ? '#93C5FD' : '#60A5FA'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Rounded Obsidian/Slate Base Container */}
      <rect width="40" height="40" rx="10" fill={tileFill} />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="9.5"
        stroke={tileStroke}
        strokeOpacity={isDark ? 1 : 0.6}
      />

      {/* Document "C" Arc Spine */}
      <path
        d="M26 12H17C14.2386 12 12 14.2386 12 17V23C12 25.7614 14.2386 28 17 28H26"
        stroke={spineColor}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Document Fold Corner */}
      <path d="M22 8L26.5 12.5H22V8Z" fill="#38BDF8" />

      {/* Active Clause Navigation Beam & Forward Direction Guide */}
      <path
        d="M16.5 20H23.5M21 17.5L23.5 20L21 22.5"
        stroke={chevronColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * High-legibility, geometric brand wordmark for ClauseWise.
 */
export function LogoWordmark({
  theme = 'light',
  size = 'md',
  className = '',
}: {
  theme?: LogoTheme;
  size?: LogoSize;
  className?: string;
}) {
  const isDark = theme === 'dark';

  const textSize =
    size === 'sm'
      ? 'text-base tracking-tight'
      : size === 'lg'
      ? 'text-2xl tracking-tight'
      : 'text-lg tracking-tight';

  return (
    <span
      className={`font-extrabold select-none inline-flex items-center ${textSize} ${className}`}
      aria-hidden="true"
    >
      <span className={isDark ? 'text-white' : 'text-slate-900'}>Clause</span>
      <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>Wise</span>
    </span>
  );
}

/**
 * ClauseWise Unified Logo Component
 */
export function Logo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  href = null,
  showTagline = false,
}: LogoProps) {
  const symbolDimension = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 transition-opacity ${className}`}
      role="img"
      aria-label="ClauseWise AI"
    >
      {variant !== 'wordmark' && (
        <LogoSymbol
          size={variant === 'compact' ? 32 : symbolDimension}
          theme={theme}
          withTile={true}
        />
      )}

      {variant !== 'symbol' && (
        <div className="flex flex-col min-w-0">
          <LogoWordmark
            theme={theme}
            size={variant === 'compact' ? 'sm' : size}
          />
          {showTagline && (
            <span
              className={`text-[11px] leading-tight truncate ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Understand the document before you sign it.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg group"
        aria-label="ClauseWise AI — Home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
