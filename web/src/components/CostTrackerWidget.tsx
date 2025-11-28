import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { MOCK_COST_DATA } from '../lib/constants';
import { DollarSign } from 'lucide-react';

interface CostData {
  todayCost: number;
  todayTokens: number;
  todayCalls: number;
  totalCost: number;
  budgetLimit: number;
}

export function CostTrackerWidget() {
  const [costData, setCostData] = useState<CostData>({
    todayCost: 0,
    todayTokens: 0,
    todayCalls: 0,
    totalCost: 0,
    budgetLimit: 50
  });

  useEffect(() => {
    setCostData(MOCK_COST_DATA);
  }, []);

  const budgetPercent = (costData.todayCost / costData.budgetLimit) * 100;
  
  function getBudgetColor(percent: number): string {
    if (percent < 50) return 'text-emerald-600';
    if (percent < 80) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getProgressBarColor(percent: number): string {
    if (percent < 50) return 'bg-emerald-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  function formatTokens(tokens: number): string {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5 text-blue-600" />
          AI Cost Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Today's Cost</p>
          <p className="text-3xl font-bold text-slate-900">${costData.todayCost.toFixed(2)}</p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Budget: ${costData.budgetLimit}/day</span>
            <span className={`font-medium ${getBudgetColor(budgetPercent)}`}>
              {budgetPercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${getProgressBarColor(budgetPercent)}`}
              style={{ width: `${Math.min(100, Math.max(0, budgetPercent))}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Tokens Used</span>
            <span className="font-medium text-slate-900">
              {formatTokens(costData.todayTokens)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">API Calls</span>
            <span className="font-medium text-slate-900">{costData.todayCalls}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">All-Time Cost</span>
            <span className="font-semibold text-slate-900">${costData.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

