import React, { ReactNode, ErrorInfo } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm max-w-sm w-full">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm font-medium text-slate-500 mb-6">We encountered an unexpected error while rendering this section.</p>
            <button
              // @ts-ignore
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center justify-center bg-slate-900 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}
