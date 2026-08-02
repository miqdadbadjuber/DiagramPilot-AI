"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-[#0A0A0A] text-zinc-200">
      <div className="max-w-md p-8 bg-red-950/20 border border-red-900/50 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-semibold text-red-400">Terjadi Kesalahan!</h2>
        <p className="text-sm text-zinc-400">
          Aplikasi mengalami masalah tidak terduga saat mencoba merender tampilan.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-sm rounded-lg transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
