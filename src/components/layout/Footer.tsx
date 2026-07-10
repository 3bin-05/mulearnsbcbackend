import React from 'react';
import { Shield, Sparkles, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/40 text-slate-500">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          {/* Brand Logo & Copyright */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300 text-xs">
                μLearn <span className="bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">SBC</span>
              </span>
              <span className="text-[9px] rounded-full border border-slate-900 bg-slate-950 px-2 py-0.5 text-slate-600 font-semibold">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-slate-600 text-center sm:text-left">
              &copy; {currentYear} MuLearn SBC. All rights reserved.
            </p>
          </div>

          {/* Quick Badges / Core Features */}
          <div className="flex flex-wrap justify-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950 px-2.5 py-1 text-slate-500">
              <Cpu className="h-3 w-3 text-violet-500" />
              <span>Vite + React</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950 px-2.5 py-1 text-slate-500">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Tailwind v4</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-900 bg-slate-950 px-2.5 py-1 text-slate-500">
              <Shield className="h-3 w-3 text-emerald-500" />
              <span>Admin Console</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
