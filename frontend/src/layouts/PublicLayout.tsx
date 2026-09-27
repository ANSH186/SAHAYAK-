import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-sahayak-cream text-sahayak-text-primary selection:bg-sahayak-blue/20 selection:text-sahayak-blue-deep font-sans">
      <PublicNavbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
