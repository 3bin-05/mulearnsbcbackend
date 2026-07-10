import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number; // duration in ms
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, duration = 1500 }) => {
  const [fadeAway, setFadeAway] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeAway(true);
      const finishTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // match transition duration
      return () => clearTimeout(finishTimer);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-all duration-500 ease-in-out ${
        fadeAway ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated ambient glow */}
        <div className="absolute -inset-10 rounded-full bg-violet-500/10 blur-3xl animate-pulse" />
        
        {/* Outer glowing rings */}
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-indigo-500 animate-spin" />
          
          {/* Central Logo mark */}
          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent">
              SBC
            </span>
          </div>
        </div>

        {/* Text Loader */}
        <div className="mt-8 text-center">
          <h2 className="text-lg font-semibold tracking-wider text-slate-200 uppercase">
            MuLearn SBC
          </h2>
          <p className="mt-2 text-xs tracking-widest text-slate-500 uppercase animate-pulse">
            Event Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
