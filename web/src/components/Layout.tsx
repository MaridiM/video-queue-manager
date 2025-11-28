import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell } from 'lucide-react';

const pageTitles: Record<string, { title: string; badge?: string }> = {
  '/': { title: 'Dashboard Overview', badge: 'Overview' },
  '/search-queue': { title: 'Search Queue', badge: 'Phase 0: Search' },
  '/video-queue': { title: 'Video Queue', badge: 'Phase 0: Selection' },
  '/researches': { title: 'Researches', badge: 'Library' },
  '/settings': { title: 'Settings' },
};

export function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'Page' };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">
              {pageInfo.title}
            </h1>
            {pageInfo.badge && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {pageInfo.badge}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 flex-1">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
