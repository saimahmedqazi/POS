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
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
            <h1 className="text-3xl font-bold text-red-600">
              Something went wrong
            </h1>

            <p className="text-slate-600 mt-4">
              The application encountered an unexpected error.
            </p>

            <button
              onClick={
                this
                  .handleReload
              }
              className="mt-8 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition"
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