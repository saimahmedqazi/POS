import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              An unexpected error occurred. The application has encountered an issue
              and needs to reload.
            </p>
            {this.state.error && (
              <pre className="mt-4 text-xs text-red-400 bg-red-500/10 rounded-xl p-4 text-left max-w-lg overflow-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
