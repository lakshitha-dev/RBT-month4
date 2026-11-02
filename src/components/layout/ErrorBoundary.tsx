import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** When any of these change the boundary resets (e.g. the route path). */
  resetKeys?: unknown[];
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A real app would report this to an error-tracking service.
    console.error('Uncaught UI error', error, info.componentStack);
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && prev.resetKeys?.some((key, i) => key !== this.props.resetKeys?.[i])) {
      this.reset();
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });

    return (
      <div className="mx-auto max-w-xl p-6">
        <Alert
          variant="error"
          title="Something went wrong"
          action={
            <div className="flex gap-2">
              <Button size="sm" onClick={this.reset}>
                Try again
              </Button>
              <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          }
        >
          {error.message || 'An unexpected error occurred while rendering this page.'}
        </Alert>
      </div>
    );
  }
}
