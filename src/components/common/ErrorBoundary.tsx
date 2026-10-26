import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backgroundColor: 'var(--surface-bg, #f5f3f0)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 500,
              width: '100%',
              backgroundColor: '#ffffff',
              padding: 32,
              borderRadius: 16,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px', color: '#1c1917' }}>
              Algo deu errado ao carregar
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#78716c', margin: '0 0 20px', lineHeight: 1.5 }}>
              Ocorreu um erro inesperado na interface. Clique abaixo para tentar recarregar a página.
            </p>
            {this.state.error && (
              <pre
                style={{
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  backgroundColor: '#faf9f7',
                  padding: 12,
                  borderRadius: 8,
                  overflowX: 'auto',
                  color: '#dc2626',
                  marginBottom: 20,
                  maxHeight: 120,
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} /> Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
