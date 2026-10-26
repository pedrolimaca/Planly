import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  style,
}: BadgeProps) {
  const variantClasses: Record<string, string> = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  };

  return (
    <span
      className={`badge ${variantClasses[variant] || 'badge-primary'} ${size === 'sm' ? 'badge-sm' : ''} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
