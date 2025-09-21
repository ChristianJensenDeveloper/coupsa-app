import { useState } from "react";

// Simple test version to isolate the issue
export default function SimpleApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">
          KOOCAO Test
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          This is a simple test to check if the basic app works without any complex imports.
        </p>
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-slate-700/40 shadow-xl shadow-black/5 p-8 max-w-md mx-auto">
          <div className="text-6xl font-bold text-blue-500 mb-4">
            {count}
          </div>
          <button 
            onClick={() => setCount(c => c + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Click me
          </button>
        </div>
      </div>
    </div>
  );
}