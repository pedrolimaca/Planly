import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export default function Card({
  children,
  title,
  subtitle,
  action,
  footer,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`} {...props}>
      {(title || action) && (
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <div>
            {typeof title === 'string' ? <h3 className="card-title text-base font-semibold">{title}</h3> : title}
            {subtitle && <p className="card-subtitle text-xs text-secondary mt-1">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer mt-3 pt-3 border-t border-color">{footer}</div>}
    </div>
  );
}
