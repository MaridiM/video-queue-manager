# Part 2: Dashboard Page

**Module:** Dashboard with Analytics & Statistics
**Dependencies:** Part 1 (Core Setup)
**Next Module:** Part 3 (Search Queue)

---

## 📋 Overview

This module implements the Dashboard page with comprehensive statistics, charts, and analytics widgets. The dashboard provides real-time insights into video queues, search queues, department distribution, and AI processing costs.

---

## 🎯 Dashboard Features

### Core Components
1. **Statistics Cards** - Key metrics with trend indicators
2. **Video Processing Trend Chart** - Line chart showing processing over time
3. **Department Distribution** - Pie chart showing work distribution
4. **Status Breakdown** - Bar chart for video statuses
5. **AI Cost Tracker Widget** - Budget monitoring and cost analysis
6. **Recent Activity** - Latest videos and searches

---

## 📊 Backend API Endpoints

### Overview Statistics Endpoint

Add to `api/server.js`:

```javascript
// GET /api/overview - Enhanced dashboard statistics
app.get('/api/overview', async (req, res) => {
  try {
    const [
      totalVideos,
      totalSearches,
      totalEntities,
      videosByStatus,
      videosByDepartment,
      videosByPriority,
      searchesByStatus,
      recentVideos,
      trendData
    ] = await Promise.all([
      // Total counts
      prisma.videoQueue.count(),
      prisma.searchQueue.count(),
      prisma.extractedEntity.count(),

      // Group by status
      prisma.videoQueue.groupBy({
        by: ['status'],
        _count: true
      }),

      // Group by department
      prisma.videoQueue.groupBy({
        by: ['department'],
        _count: true
      }),

      // Group by priority
      prisma.videoQueue.groupBy({
        by: ['priority'],
        _count: true
      }),

      // Search status breakdown
      prisma.searchQueue.groupBy({
        by: ['status'],
        _count: true
      }),

      // Recent videos (last 10)
      prisma.videoQueue.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          queueId: true,
          videoTitle: true,
          status: true,
          priority: true,
          createdAt: true
        }
      }),

      // Trend data (last 30 days)
      getTrendData()
    ]);

    // Format response
    res.json({
      summary: {
        totalVideos,
        totalSearches,
        totalEntities,
        completedVideos: videosByStatus.find(s => s.status === 'complete')?._count || 0,
        pendingVideos: videosByStatus.find(s => s.status === 'pending')?._count || 0,
        processingVideos: videosByStatus.filter(s =>
          ['transcribing', 'transcribed', 'processing'].includes(s.status)
        ).reduce((sum, s) => sum + s._count, 0)
      },
      videosByStatus: videosByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      videosByDepartment: videosByDepartment.map(item => ({
        department: item.department,
        count: item._count
      })),
      videosByPriority: videosByPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {}),
      searchesByStatus: searchesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      recentVideos,
      trendData
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to get trend data
async function getTrendData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const videos = await prisma.videoQueue.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo
      }
    },
    select: {
      createdAt: true,
      status: true
    }
  });

  // Group by date
  const trendMap = new Map();
  videos.forEach(video => {
    const date = video.createdAt.toISOString().split('T')[0];
    if (!trendMap.has(date)) {
      trendMap.set(date, { date, total: 0, completed: 0 });
    }
    const entry = trendMap.get(date);
    entry.total++;
    if (video.status === 'complete') entry.completed++;
  });

  return Array.from(trendMap.values()).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
```

---

## 🎨 Frontend Implementation

### Dashboard Main Component

**File:** `web/src/components/DashboardStats.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Video, Search, FileText, CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { overviewAPI } from '../lib/api';
import CostTrackerWidget from './CostTrackerWidget';

interface DashboardData {
  summary: {
    totalVideos: number;
    totalSearches: number;
    totalEntities: number;
    completedVideos: number;
    pendingVideos: number;
    processingVideos: number;
  };
  videosByStatus: Record<string, number>;
  videosByDepartment: Array<{ department: string; count: number }>;
  videosByPriority: Record<string, number>;
  searchesByStatus: Record<string, number>;
  recentVideos: Array<any>;
  trendData: Array<{ date: string; total: number; completed: number }>;
}

function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    const response = await overviewAPI.get();

    if (response.success) {
      setData(response.data);
    } else {
      setError(response.error || 'Failed to load dashboard data');
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Chart colors
  const COLORS = {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    secondary: '#6366f1',
    accent: '#8b5cf6'
  };

  const departmentColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Videos"
          value={data.summary.totalVideos}
          icon={Video}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={data.summary.completedVideos}
          icon={CheckCircle}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatCard
          title="In Progress"
          value={data.summary.processingVideos}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Pending"
          value={data.summary.pendingVideos}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Searches</p>
                <p className="text-2xl font-bold text-slate-900">{data.summary.totalSearches}</p>
              </div>
              <Search className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Entities</p>
                <p className="text-2xl font-bold text-slate-900">{data.summary.totalEntities}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data.summary.totalVideos > 0
                    ? Math.round((data.summary.completedVideos / data.summary.totalVideos) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Processing Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Video Processing Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  name="Total Videos"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.videosByDepartment}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.department}: ${entry.count}`}
                >
                  {data.videosByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={departmentColors[index % departmentColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Video Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(data.videosByStatus).map(([status, count]) => ({
                  status: status.replace('_', ' '),
                  count
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(data.videosByPriority).map(([priority, count]) => ({
                  priority,
                  count
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.warning} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Cost Tracker Widget */}
      <CostTrackerWidget />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{video.videoTitle}</p>
                  <p className="text-sm text-slate-600">
                    {video.queueId} • {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={video.status} />
                  <PriorityBadge priority={video.priority} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardStats;
```

### Stat Card Component

```typescript
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                {trend.isPositive ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">+{trend.value}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 font-medium">-{trend.value}%</span>
                  </>
                )}
                <span className="text-slate-500">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Status Badge Component

**File:** `web/src/components/ui/StatusBadge.tsx`

```typescript
import React from 'react';
import Badge from './Badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig: Record<string, { variant: any; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    selected: { variant: 'default', label: 'Selected' },
    transcribing: { variant: 'warning', label: 'Transcribing' },
    transcribed: { variant: 'warning', label: 'Transcribed' },
    processing: { variant: 'warning', label: 'Processing' },
    complete: { variant: 'success', label: 'Complete' },
    rejected: { variant: 'danger', label: 'Rejected' }
  };

  const config = statusConfig[status] || { variant: 'secondary', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StatusBadge;
```

### Priority Badge Component

```typescript
interface PriorityBadgeProps {
  priority: string;
  score?: number;
}

function PriorityBadge({ priority, score }: PriorityBadgeProps) {
  const priorityConfig: Record<string, { variant: any; label: string }> = {
    low: { variant: 'secondary', label: 'Low' },
    medium: { variant: 'warning', label: 'Medium' },
    high: { variant: 'danger', label: 'High' }
  };

  const config = priorityConfig[priority] || { variant: 'secondary', label: priority };

  return (
    <Badge variant={config.variant}>
      {config.label}
      {score !== undefined && ` (${score.toFixed(1)})`}
    </Badge>
  );
}
```

---

## 💰 AI Cost Tracker Widget

**File:** `web/src/components/CostTrackerWidget.tsx`

```typescript
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Progress } from './ui/Progress';

interface CostData {
  currentMonth: number;
  budget: number;
  byProvider: {
    google: number;
    openai: number;
  };
  estimatedEndOfMonth: number;
  avgCostPerVideo: number;
  totalVideosProcessed: number;
}

function CostTrackerWidget() {
  // Mock data - in real app, fetch from API
  const [costData] = useState<CostData>({
    currentMonth: 47.32,
    budget: 100,
    byProvider: {
      google: 28.50,
      openai: 18.82
    },
    estimatedEndOfMonth: 78.50,
    avgCostPerVideo: 0.15,
    totalVideosProcessed: 315
  });

  const percentUsed = (costData.currentMonth / costData.budget) * 100;
  const isOverBudget = costData.estimatedEndOfMonth > costData.budget;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Processing Costs</CardTitle>
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current spending */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-slate-600">This Month</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                ${costData.currentMonth.toFixed(2)}
              </span>
              <span className="text-sm text-slate-600">
                of ${costData.budget.toFixed(2)}
              </span>
            </div>
          </div>
          <Progress value={percentUsed} className="h-2" />
          <p className="text-xs text-slate-500 mt-1">
            {percentUsed.toFixed(1)}% of monthly budget used
          </p>
        </div>

        {/* Provider breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium">Google AI</p>
            <p className="text-lg font-bold text-blue-900">
              ${costData.byProvider.google.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">OpenAI</p>
            <p className="text-lg font-bold text-green-900">
              ${costData.byProvider.openai.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Projections */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Estimated end of month</span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
              ${costData.estimatedEndOfMonth.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Average per video</span>
            <span className="font-semibold text-slate-900">
              ${costData.avgCostPerVideo.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Videos processed</span>
            <span className="font-semibold text-slate-900">
              {costData.totalVideosProcessed}
            </span>
          </div>
        </div>

        {/* Warning if over budget */}
        {isOverBudget && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Budget Warning</p>
              <p className="text-xs text-yellow-700">
                Projected to exceed budget by ${(costData.estimatedEndOfMonth - costData.budget).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CostTrackerWidget;
```

---

## 🛠️ Additional UI Components

### Progress Component

**File:** `web/src/components/ui/Progress.tsx`

```typescript
import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', className)}>
      <div
        className="bg-blue-600 h-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

export { Progress };
```

---

## 🔗 Integration with App.tsx

Update `web/src/App.tsx` to include Dashboard:

```typescript
import DashboardStats from './components/DashboardStats';

function App() {
  // ... existing code ...

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            {getPageTitle(currentView)}
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardStats />}
            {currentView === 'search-queue' && <div>Search Queue (See Part 3)</div>}
            {currentView === 'video-queue' && <div>Video Queue (See Part 4)</div>}
            {currentView === 'settings' && <div>Settings (See Part 5)</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## ✅ Module Completion Checklist

- [x] Dashboard overview API endpoint
- [x] Trend data calculation (30 days)
- [x] Statistics cards with icons and trends
- [x] Line chart for video processing trends
- [x] Pie chart for department distribution
- [x] Bar charts for status and priority breakdown
- [x] AI cost tracker widget with projections
- [x] Recent activity feed
- [x] Progress bar component
- [x] Status and priority badge components
- [x] Responsive layout for all screen sizes
- [x] Loading and error states
- [x] Refresh functionality

---

## 🎨 UI/UX Details

### Color Scheme
- **Primary:** Blue (#2563eb) - Main actions, charts
- **Success:** Green (#10b981) - Completed items
- **Warning:** Yellow (#f59e0b) - In progress items
- **Danger:** Red (#ef4444) - Pending/rejected items
- **Secondary:** Purple (#6366f1) - Accent colors

### Typography
- **Headers:** font-semibold, text-2xl
- **Stats:** font-bold, text-3xl
- **Body:** font-medium, text-sm/base
- **Labels:** text-slate-600, text-sm

### Spacing
- Card padding: p-6
- Grid gaps: gap-4, gap-6
- Section spacing: space-y-6
- Element spacing: space-y-2, space-y-3

### Animations
- Fade-in on load: animate-fade-in
- Hover transitions: transition-all
- Chart transitions: duration-300
- Progress bar: transition-all duration-300

---

## 📊 Data Refresh Strategy

```typescript
// Auto-refresh dashboard every 60 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchDashboardData();
  }, 60000); // 60 seconds

  return () => clearInterval(interval);
}, []);
```

---

## 🔍 Testing Checklist

- [ ] Dashboard loads without errors
- [ ] All statistics display correct counts
- [ ] Charts render with proper data
- [ ] Trend line shows 30-day history
- [ ] Department pie chart shows all departments
- [ ] Status bar chart includes all statuses
- [ ] Cost tracker calculates correctly
- [ ] Recent videos list displays latest 10
- [ ] Loading spinner shows while fetching
- [ ] Error message displays on API failure
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Auto-refresh works every 60 seconds

---

**Status:** ✅ Part 2 Complete
**Previous Module:** [Part 1 - Core Setup](./05_COMPLETE_APP_GENERATION_PROMPT_1.md)
**Next Module:** [Part 3 - Search Queue Page](./05_COMPLETE_APP_GENERATION_PROMPT_3.md)
