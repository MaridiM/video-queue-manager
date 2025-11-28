import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_STATS, MOCK_TREND_DATA } from '../lib/constants';

interface Stats {
  totalVideos: number;
  inProgress: number;
  completed: number;
  completionRate: number;
}

interface TrendData {
  date: string;
  videos_added: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  data: TrendData[];
  chartColor: string;
}

function StatCard({ title, value, trend, trendUp, data, chartColor }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1 mb-4">
          <div className="text-3xl font-bold text-slate-900">{value}</div>
        </div>

        <div className="h-[40px] w-full mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip 
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }}
                itemStyle={{ color: chartColor }}
              />
              <Line
                type="monotone"
                dataKey="videos_added"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`text-xs font-medium flex items-center ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
          <span className="mr-1">{trend}</span>
          <span>{trendUp ? '↑' : '↓'} from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats(MOCK_STATS);
      setTrendData(MOCK_TREND_DATA);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 rounded-xl border border-gray-200 bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Videos"
        value={stats?.totalVideos || 0}
        trend="+12"
        trendUp={true}
        chartColor="#3b82f6"
        data={trendData}
      />
      <StatCard
        title="In Progress"
        value={stats?.inProgress || 0}
        trend="+5"
        trendUp={true}
        chartColor="#0ea5e9"
        data={trendData}
      />
      <StatCard
        title="Completed"
        value={stats?.completed || 0}
        trend="+8"
        trendUp={true}
        chartColor="#10b981"
        data={trendData}
      />
      <StatCard
        title="Success Rate"
        value={`${stats?.completionRate || 0}%`}
        trend="+2.3%"
        trendUp={true}
        chartColor="#8b5cf6"
        data={trendData}
      />
    </div>
  );
}

