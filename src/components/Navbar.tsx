import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 md:hidden">Tracker</h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-primary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-700">{user?.username}</span>
            <span className="text-xs text-slate-500">Instructor</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <UserIcon size={20} />
          </div>
          <button
            onClick={logout}
            className="ml-2 text-slate-400 hover:text-danger p-2 transition-colors rounded-lg hover:bg-danger/10"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
