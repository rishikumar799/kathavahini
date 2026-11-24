import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

const CHUNK_RELOAD_KEY = 'kathavahini_chunk_reload_attempted';

function isChunkLoadError(error: Error | null | undefined): boolean {
  const msg = (error?.message || String(error || '')).toLowerCase();
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('chunkloaderror') ||
    msg.includes('loading chunk') ||
    msg.includes('unable to preload css')
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;

  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Kathavahini ErrorBoundary caught error:', error, errorInfo);

    // Self-heal stale JS chunks right after a new live deployment (max 1 automatic reload)
    if (typeof window !== 'undefined' && isChunkLoadError(error)) {
      try {
        const lastAttempt = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0');
        if (Date.now() - lastAttempt > 15_000) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
          window.location.reload();
        }
      } catch {
        // Ignore storage errors
      }
    }
  }

  private handleReload = (): void => {
    try {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  private handleGoHome = (): void => {
    try {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    } catch {
      // Ignore
    }
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-[#101014] text-[#17151A] dark:text-[#F7F3EE] p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#18181D] border border-[#E8E1DA] dark:border-[#2E2D36] rounded-3xl p-8 text-center shadow-xl space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#7A284B]/10 dark:bg-[#D87591]/15 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Kathavahini"
                className="w-11 h-11 object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif-telugu text-[#17151A] dark:text-[#F7F3EE]">
                పేజీ లోడ్ చేయడంలో సమస్య ఏర్పడింది
              </h2>
              <p className="text-sm text-[#6F6970] dark:text-[#AAA4AC] leading-relaxed">
                కొత్త అప్‌డేట్ లేదా రన్‌టైమ్ లోపం కారణంగా ఈ పేజీని మళ్ళీ లోడ్ చేయాల్సి ఉంది. దయచేసి క్రింది బటన్ నొక్కండి.
              </p>
              {this.state.errorMessage && (
                <p className="text-[11px] font-mono text-[#7A284B] dark:text-[#D87591] bg-[#FAF7F2] dark:bg-[#222229] border border-[#E8E1DA] dark:border-[#2E2D36] rounded-xl px-3 py-2 break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#7A284B] hover:bg-[#631F3C] text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                మళ్ళీ లోడ్ చేయండి
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#E8E1DA] dark:border-[#2E2D36] text-[#17151A] dark:text-[#F7F3EE] hover:bg-[#FAF7F2] dark:hover:bg-[#222229] font-semibold text-sm transition-colors cursor-pointer"
              >
                హోమ్‌కు వెళ్ళండి
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
