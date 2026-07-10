import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-md transition-all duration-300">
                <img src="/favicon.svg" alt="μLearn Logo" className="h-6 w-6 object-contain" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  μLearn <span className="bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">SBC</span>
                </span>
                <span className="hidden sm:block text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
                  Event Hub Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-[10px] font-bold text-violet-400 uppercase tracking-wider shadow-sm">
              <Shield className="h-3 w-3 text-cyan-400" />
              <span>Administrative Portal</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
