interface PlanlyLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textColor?: string;
}

export default function PlanlyLogo({
  size = 36,
  showText = true,
  className = '',
  textColor = 'var(--text-primary)',
}: PlanlyLogoProps) {
  return (
    <div
      className={`planly-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.28,
        userSelect: 'none',
      }}
    >
      {/* Planly "P" checkmark — inherits the application color system. */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="planly-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #7c3aed)" />
            <stop offset="68%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="planly-shadow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
          <filter id="planly-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.32" />
          </filter>
        </defs>

        {/* Outer Glowing Rounded "P" Path */}
        <g filter="url(#planly-glow)">
          {/* Main "P" Body */}
          <path
            d="M 22 26 C 22 17 29 10 38 10 L 62 10 C 78 10 90 22 90 38 C 90 54 78 66 62 66 L 46 66 L 46 80 C 46 86 41 90 35 90 C 28 90 22 85 22 79 Z"
            fill="url(#planly-gradient)"
          />

          {/* Bottom curve accent */}
          <path
            d="M 22 55 L 22 79 C 22 85 28 90 35 90 C 41 90 46 86 46 80 L 46 55 Z"
            fill="url(#planly-shadow)"
          />

          <circle cx="77" cy="71" r="5" fill="#10b981" />
          <circle cx="66" cy="83" r="3.5" fill="#f97316" />

          {/* Inner Crisp White Checkmark */}
          <path
            d="M 39 37 L 49 47 L 73 23"
            stroke="#ffffff"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      {/* Planly Wordmark */}
      {showText && (
        <span
          className="planly-logo-text"
          style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: size * 0.72,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: textColor,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Planly
        </span>
      )}
    </div>
  );
}
