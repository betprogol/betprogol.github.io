import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // Explicitly declare state and props types for React 19 TS compatibility
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in BetProGol:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-white">Bir Hata Oluştu</h2>
            <p className="text-sm text-gray-400">
              Uygulama yüklenirken bir problemle karşılaşıldı. Sayfayı yenileyebilir veya önbelleği sıfırlayabilirsiniz.
            </p>

            {this.state.error && (
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#21262D] text-left text-xs font-mono text-red-300 max-h-32 overflow-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Sayfayı Yenile
              </button>
              <button
                onClick={this.handleResetStorage}
                className="flex-1 py-2.5 px-4 bg-[#21262D] hover:bg-[#30363D] text-gray-300 font-semibold rounded-lg transition"
              >
                Önbelleği Sıfırla
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
