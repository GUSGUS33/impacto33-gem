"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-semibold text-slate-700 mb-6">
        Algo salió mal
      </h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        {error.message || "Ha ocurrido un error inesperado."}
      </p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
