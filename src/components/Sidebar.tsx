import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Layers } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Batch Manager', path: '/batches', icon: <Layers size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-full">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
            <Layers size={18} />
          </div>
          Tracker
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-sm text-slate-500">
        <p>System v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
