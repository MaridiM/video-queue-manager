import { useState } from "react";
import { VideoQueueTable } from "./components/VideoQueueTable";
import { VideoQueueCatalog } from "./pages/VideoQueueCatalog";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardStats } from "./components/DashboardStats";
import { UploadTranscriptionScreen } from "./components/UploadTranscriptionScreen";
import { CostTrackerWidget } from "./components/CostTrackerWidget";
import { KnowledgeMapViewer } from "./components/KnowledgeMapViewer";
import { EntityExtractionViewer } from "./components/EntityExtractionViewer";
import { BulkVideoImport } from "./components/BulkVideoImport";
import { SearchQueueTable } from "./components/SearchQueueTable";
import { Settings as SettingsPage } from "./pages/Settings";
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
    <div className="min-h-screen bg-[var(--background-primary)] flex font-sans text-[var(--text-primary)]">
      {/* Sidebar - Game Academy Design System */}
      <aside className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] hidden md:flex flex-col fixed inset-y-0 left-0 z-[100] transition-all duration-300">
        <div className="p-6 border-b border-[var(--sidebar-border)] min-h-[64px]">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-[var(--text-primary)]">
            <div className="w-8 h-8 bg-[var(--primary-default)] rounded-[8px] flex items-center justify-center text-white">
              Q
            </div>
            QueueMgr
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all duration-200 font-medium text-sm ${
              currentView === "dashboard"
                ? "bg-[rgba(37,99,235,0.15)] text-[var(--primary-default)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)]"
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("search")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all duration-200 font-medium text-sm ${
              currentView === "search"
                ? "bg-[rgba(37,99,235,0.15)] text-[var(--primary-default)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)]"
            }`}
          >
            <Search size={20} />
            Search Queue
          </button>
          <button
            onClick={() => setCurrentView("queue")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all duration-200 font-medium text-sm ${
              currentView === "queue"
                ? "bg-[rgba(37,99,235,0.15)] text-[var(--primary-default)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)]"
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
          <button 
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all duration-200 font-medium text-sm ${
              currentView === 'settings' 
                ? 'bg-[rgba(37,99,235,0.15)] text-[var(--primary-default)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)]'
            }`}
          >
            <Settings size={20} />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-[var(--sidebar-border)]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-default)] text-white flex items-center justify-center text-base font-semibold flex-shrink-0">
              <User size={20} />
            </div>
            <div className="text-sm min-w-0">
              <div className="font-medium text-[var(--text-primary)] truncate">Admin User</div>
              <div className="text-xs text-[var(--text-secondary)] truncate">admin@rhs.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-[var(--background-paper)] border-b border-[var(--border-default)] flex items-center justify-between px-6 sticky top-0 z-[1030] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              {currentView === "dashboard" && "Dashboard Overview"}
              {currentView === "queue" && "Video Queue"}
              {currentView === "import" && "Bulk Video Import"}
              {currentView === "search" && "Search Queue"}
              {currentView === "upload" && "Upload Transcription"}
              {currentView === "extraction" && "Entity Extraction"}
              {currentView === "knowledge" && "Knowledge Map"}
              {currentView === "settings" && "Settings"}
            </h1>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[rgba(37,99,235,0.15)] text-[var(--primary-default)] border border-[var(--primary-400)]">
              Phase 0: Selection
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)] rounded-[8px] transition-all duration-200">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--error)] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 max-w-[1920px] mx-auto w-full">
          {currentView === "dashboard" && (
            <div className="space-y-6">
              <DashboardStats />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div>
                  <CostTrackerWidget />
                </div>
                <div className="border-2 border-dashed border-[var(--border-default)] rounded-[12px] h-64 flex items-center justify-center text-[var(--text-tertiary)]">
                  Additional Widget Space
                </div>
                <div className="border-2 border-dashed border-[var(--border-default)] rounded-[12px] h-64 flex items-center justify-center text-[var(--text-tertiary)]">
                  Additional Widget Space
                </div>
                <div className="border-2 border-dashed border-[var(--border-default)] rounded-[12px] h-64 flex items-center justify-center text-[var(--text-tertiary)]">
                  Additional Widget Space
                </div>
              </div>
            </div>
          )}
          {currentView === "queue" && (
            <ErrorBoundary>
              <VideoQueueCatalog />
            </ErrorBoundary>
          )}
          {currentView === "import" && <BulkVideoImport />}
          {currentView === "upload" && <UploadTranscriptionScreen />}
          {currentView === "extraction" && <EntityExtractionViewer />}
          {currentView === "knowledge" && <KnowledgeMapViewer />}
          {currentView === "search" && <SearchQueueTable />}
          {currentView === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
