import { useState } from "react";
import { VideoQueueTable } from "./components/VideoQueueTable";
import { DashboardStats } from "./components/DashboardStats";
import { UploadTranscriptionScreen } from "./components/UploadTranscriptionScreen";
import { CostTrackerWidget } from "./components/CostTrackerWidget";
import { KnowledgeMapViewer } from "./components/KnowledgeMapViewer";
import { EntityExtractionViewer } from "./components/EntityExtractionViewer";
import { BulkVideoImport } from "./components/BulkVideoImport";
import { SearchQueueTable } from "./components/SearchQueueTable";
import {
  LayoutDashboard,
  ListVideo,
  Search,
  Settings,
  Bell,
  User,
  Upload,
  Network,
  Brain,
  FileInput,
} from "lucide-react";

type View =
  | "dashboard"
  | "queue"
  | "search"
  | "upload"
  | "extraction"
  | "knowledge"
  | "settings"
  | "import";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar - AdminRHS style */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              Q
            </div>
            QueueMgr
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              currentView === "dashboard"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("search")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              currentView === "search"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Search size={20} />
            Search Queue
          </button>
          <button
            onClick={() => setCurrentView("queue")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              currentView === "queue"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ListVideo size={20} />
            Video Queue
          </button>
          {/* <button 
            onClick={() => setCurrentView('import')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${currentView === 'import' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FileInput size={20} />
            Bulk Import
          </button> */}
          {/* <button 
            onClick={() => setCurrentView('upload')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${currentView === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Upload size={20} />
            Upload Transcript
          </button> */}
          {/* <button 
            onClick={() => setCurrentView('extraction')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${currentView === 'extraction' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Brain size={20} />
            Entity Extraction
          </button> */}
          {/* <button 
            onClick={() => setCurrentView('knowledge')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${currentView === 'knowledge' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Network size={20} />
            Knowledge Map
          </button> */}
          {/* <button 
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${currentView === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings size={20} />
            Settings
          </button> */}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User size={16} />
            </div>
            <div className="text-sm">
              <div className="font-medium text-slate-200">Admin User</div>
              <div className="text-xs text-slate-500">admin@rhs.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">
              {currentView === "dashboard" && "Dashboard Overview"}
              {currentView === "queue" && "Video Queue"}
              {currentView === "import" && "Bulk Video Import"}
              {currentView === "search" && "Search Queue"}
              {currentView === "upload" && "Upload Transcription"}
              {currentView === "extraction" && "Entity Extraction"}
              {currentView === "knowledge" && "Knowledge Map"}
              {currentView === "settings" && "Settings"}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              Phase 0: Selection
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 max-w-7xl mx-auto w-full">
          {currentView === "dashboard" && (
            <div className="space-y-6">
              <DashboardStats />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <CostTrackerWidget />
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400">
                  Additional Widget Space
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-xl h-64 flex items-center justify-center text-slate-400">
                  Additional Widget Space
                </div>
              </div>
            </div>
          )}
          {currentView === "queue" && <VideoQueueTable />}
          {currentView === "import" && <BulkVideoImport />}
          {currentView === "upload" && <UploadTranscriptionScreen />}
          {currentView === "extraction" && <EntityExtractionViewer />}
          {currentView === "knowledge" && <KnowledgeMapViewer />}
          {currentView === "search" && <SearchQueueTable />}
          {currentView === "settings" && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
              <Settings size={48} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium">Settings</p>
              <p className="text-sm">System configuration pending</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
