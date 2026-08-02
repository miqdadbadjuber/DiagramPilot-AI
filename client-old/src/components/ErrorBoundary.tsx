import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-200">
          <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-sm text-zinc-400 mb-1">
                An unexpected error occurred in the application.
              </p>
              {this.state.error && (
                <p className="text-xs text-zinc-500 font-mono mt-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors text-sm"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
