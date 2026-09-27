import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { StudentHeader } from '../components/layout/StudentHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuth } from '../lib/authContext';

export const StudentLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Require student authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen flex bg-sahayak-cream text-sahayak-text-primary selection:bg-sahayak-blue/20 selection:text-sahayak-blue-deep font-sans">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block">
        <StudentSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <StudentHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

