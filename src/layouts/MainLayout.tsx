import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Subtle background decorative shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-success/5 rounded-full blur-3xl pointer-events-none -z-10 translate-y-1/2 -translate-x-1/2"></div>
          
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
