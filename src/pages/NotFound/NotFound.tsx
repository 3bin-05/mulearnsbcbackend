import React from 'react';
import { Link } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-slate-950 px-4 text-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute top-1/3 left-1/3 h-60 w-60 rounded-full bg-violet-500/5 blur-3xl animate-pulse" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <HelpCircle className="h-10 w-10 text-violet-500 animate-bounce" />
          <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
          </div>
        </div>

        {/* 404 Code */}
        <h1 className="mt-8 text-7xl font-extrabold tracking-tight text-white sm:text-8xl">
          404
        </h1>

        {/* Messaging */}
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-200 sm:text-2xl">
          Page Not Found
        </h2>
        <p className="mt-2.5 max-w-md text-sm text-slate-500">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Back Home Button */}
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/15 hover:bg-violet-500 hover:shadow-violet-500/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Home className="h-4.5 w-4.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
