import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'var(--color-success-500)',
  error: 'var(--color-danger-500)',
  warning: 'var(--color-warning-500)',
  info: 'var(--color-info-500)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = iconMap[toast.type];
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon" style={{ color: colorMap[toast.type] }}>
              <Icon size={18} />
            </span>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button className="toast-dismiss" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
