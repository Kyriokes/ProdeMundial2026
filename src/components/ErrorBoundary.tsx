import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/** Last line of defence: a render error shows a recovery screen instead of a blank page. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold">Algo salió mal</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          No pudimos mostrar el torneo. Si llegaste desde un enlace compartido, puede estar dañado.
        </p>
        <a
          href="/groups"
          className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    );
  }
}
