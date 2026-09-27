import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { AnalyticsSummary } from '../../types';
import { apiService } from '../../services/api';
import { WatchTimeChart, DropOffChart } from '../../components/analytics/Charts';
import { Table, Column } from '../../components/common/Table';
import { ProgressBar } from '../../components/common/ProgressBar';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiService.getAnalyticsSummary().then((data) => {
      setAnalytics(data);
      setIsLoading(false);
    });
  }, []);

  const lessonColumns: Column<AnalyticsSummary['topLessons'][0]>[] = [
    {
      header: 'Session Title',
      accessorKey: 'lessonTitle',
      cell: (l) => <span className="font-serif text-xs text-[#F2F1ED]">{l.lessonTitle}</span>,
    },
    {
      header: 'Curriculum',
      accessorKey: 'courseTitle',
      cell: (l) => <span className="text-xs text-[#9A9DA6]">{l.courseTitle}</span>,
    },
    {
      header: 'Unique Views',
      accessorKey: 'views',
      cell: (l) => <span className="text-xs font-mono text-[#F2F1ED]">{l.views}</span>,
    },
    {
      header: 'Completion Rate',
      accessorKey: 'completionRate',
      cell: (l) => (
        <div className="flex items-center gap-2">
          <div className="w-20">
            <ProgressBar value={l.completionRate} size="xs" variant="emerald" />
          </div>
          <span className="text-xs font-mono text-[#F2F1ED]">
            {l.completionRate}%
          </span>
        </div>
      ),
    },
    {
      header: 'Drop-off Index',
      accessorKey: 'dropOffRate',
      cell: (l) => (
        <span
          className={`text-xs font-mono ${
            l.dropOffRate > 20 ? 'text-rose-400' : 'text-[#9A9DA6]'
          }`}
        >
          {l.dropOffRate}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div className="text-xs text-[#9A9DA6] font-mono mb-1">
          Curriculum Telemetry
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">
          Analytics & Engagement
        </h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          Monitor video retention, playback patterns, and drop-off markers across all published curriculums.
        </p>
      </div>

      {/* Two Column Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)]">
            <h3 className="font-serif text-sm font-normal text-[#F2F1ED] mb-1">Weekly Stream Runtime (Hours)</h3>
            <p className="text-xs text-[#9A9DA6] mb-4">Total streaming playback volume per weekday</p>
            <WatchTimeChart data={analytics.dailyWatchTime} />
          </div>

          <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)]">
            <h3 className="font-serif text-sm font-normal text-[#F2F1ED] mb-1">Video Timeline Retention</h3>
            <p className="text-xs text-[#9A9DA6] mb-4">
              Cohort drop-off percentage relative to session runtime
            </p>
            <DropOffChart data={analytics.dropOffPoints} />
          </div>
        </div>
      )}

      {/* Geographic Distribution and Top Lessons */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Lessons Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="pb-2 border-b border-[rgba(242,241,237,0.08)]">
              <h3 className="font-serif text-base font-normal text-[#F2F1ED]">High-Engagement Sessions</h3>
              <p className="text-xs text-[#9A9DA6]">Most replayed and completed architectural lectures</p>
            </div>
            <Table
              id="analytics-top-lessons-table"
              columns={lessonColumns}
              data={analytics.topLessons}
              keyExtractor={(l) => l.lessonId}
              isLoading={isLoading}
            />
          </div>

          {/* Student Regional Breakdown */}
          <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)] space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#4C63D2]" />
              <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Learner Distribution</h3>
            </div>
            <p className="text-xs text-[#9A9DA6]">Active cohort distribution by country</p>

            <div className="space-y-3 pt-2">
              {analytics.countryBreakdown.map((item) => (
                <div key={item.country} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#F2F1ED]">{item.country}</span>
                    <span className="font-mono text-[#9A9DA6]">
                      {item.percentage}% ({item.students} members)
                    </span>
                  </div>
                  <ProgressBar value={item.percentage} size="xs" variant="indigo" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
