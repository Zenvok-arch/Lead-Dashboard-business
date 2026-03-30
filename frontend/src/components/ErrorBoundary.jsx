import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark text-white p-6 flex flex-col items-center justify-center">
          <div className="glass p-8 rounded-3xl border border-red-500/20 shadow-2xl max-w-lg text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-sm text-gray-400 mb-6">
              An unexpected error occurred in the component tree.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2 rounded-xl transition-all font-bold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
