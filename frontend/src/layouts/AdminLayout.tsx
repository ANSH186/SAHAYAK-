import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AdminHeader } from '../components/layout/AdminHeader';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useAuth } from '../lib/authContext';

export const AdminLayout: React.FC = () => {
  const { isAdminAuthenticated } = useAuth();

  // Protect Admin route
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-sahayak-cream text-sahayak-text-primary selection:bg-sahayak-blue/20 selection:text-sahayak-blue-deep font-sans">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-12">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
