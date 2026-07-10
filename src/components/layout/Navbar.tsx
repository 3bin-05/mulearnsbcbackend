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
            <Link to="/" className="flex items-center gap-3 group">
              {/* μLearn logo image */}
              <img
                src="/sbc.png"
                alt="μLearn Logo"
                className="h-7 w-auto object-contain"
              />

              {/* Vertical divider */}
              <span className="h-8 w-px bg-slate-600" />

              {/* SBC text block */}
              <div className="flex flex-col leading-tight">
                <span className="text-base font-black tracking-tight text-white uppercase">
                  SBC
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">
                  Campus Chapter
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
