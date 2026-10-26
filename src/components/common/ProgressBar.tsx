
interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  color,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightMap = {
    sm: 6,
    md: 8,
    lg: 12,
  };

  return (
    <div className={`progress-container ${className}`} style={{ width: '100%' }}>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
          {label && <span className="font-medium text-secondary">{label}</span>}
          {showPercent && <span className="font-semibold text-primary">{percent}%</span>}
        </div>
      )}
      <div
        className="progress-track"
        style={{
          width: '100%',
          height: heightMap[size],
          backgroundColor: 'var(--color-neutral-200)',
          borderRadius: 'var(--border-radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="progress-fill"
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: color || 'var(--color-primary-600)',
            borderRadius: 'var(--border-radius-full)',
            transition: 'width 0.4s ease-in-out',
          }}
        />
      </div>
    </div>
  );
}
