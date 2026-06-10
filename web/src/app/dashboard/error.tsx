"use client";

import { DbUnavailableError } from "@/lib/db-errors";
import { Database, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dbDown = error instanceof DbUnavailableError || error.name === "DbUnavailableError";

  if (dbDown) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <Database className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Database not connected</h2>
          <p className="text-white/50 text-sm mb-6">
            PostgreSQL is not running. Start Docker Desktop, then in the{" "}
            <code className="text-white/70">web</code> folder run:
          </p>
          <pre className="text-left text-xs bg-black/40 rounded-xl p-4 mb-6 text-brand-300 overflow-x-auto">
            npm run db:up
          </pre>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="glass rounded-2xl p-8 max-w-md text-center">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-white/50 text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 text-sm bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}
