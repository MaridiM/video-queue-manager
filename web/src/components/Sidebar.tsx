import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  ListVideo,
  FileText,
  Settings,
  User,
  Bell,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search-queue', icon: Search, label: 'Search Queue' },
  { to: '/video-queue', icon: ListVideo, label: 'Video Queue' },
  { to: '/researches', icon: FileText, label: 'Researches' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed inset-y-0 left-0 z-10">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white">
            R
          </div>
          <span>REMS Queue</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <User size={18} />
          </div>
          <div className="text-sm">
            <div className="font-medium text-slate-200">Admin User</div>
            <div className="text-xs text-slate-500">admin@rhs.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
