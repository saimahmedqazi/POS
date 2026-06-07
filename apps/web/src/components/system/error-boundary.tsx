import type {
  ReactNode,
} from 'react';

import {
  Component,
} from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;

  error?: Error;
};

export default class ErrorBoundary extends Component<
  Props,
  State
> {
  constructor(
    props: Props,
  ) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(
    error: Error,
  ) {
    console.error(
      'APPLICATION ERROR:',
      error,
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (
      this.state
        .hasError
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="bg-surface text-foreground border border-border rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">
              Something went wrong
            </h1>

            <p className="text-muted-foreground mt-4">
              The application encountered an unexpected error.
            </p>

            <button
              onClick={
                this
                  .handleReload
              }
              className="mt-8 bg-primary text-primary-foreground px-6 py-3 rounded-2xl hover:opacity-90 transition font-medium"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props
      .children;
  }
}