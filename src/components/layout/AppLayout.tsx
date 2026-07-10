import React from 'react';
import { Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbf9ff] text-[#1f2433] selection:bg-[#6b2ff2]/15 selection:text-[#6b2ff2]">
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
