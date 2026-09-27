import React, { useState } from 'react';
import { TimeActivityMetric, CountryMetric, AnalyticsLessonMetric } from '../../types';
import { Users, Eye, TrendingDown, Globe } from 'lucide-react';

// Activity by Hour Bar Chart
export const HourlyActivityChart: React.FC<{ data: TimeActivityMetric[]; id?: string }> = ({
  data,
  id = 'hourly-activity-chart',
}) => {
  const max = Math.max(...data.map((d) => d.activeCount), 1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div id={id} className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Activity by Hour (UTC)</h3>
          <p className="text-xs text-[#9A9DA6] mt-0.5">Peak concurrency throughout 24-hour cycle</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#4C63D2] font-mono px-2 py-0.5 border border-[rgba(242,241,237,0.08)] bg-[#0E0F12]">
          <Users className="w-3.5 h-3.5" />
          <span>Active Concurrency</span>
        </div>
      </div>

      <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-1 border-b border-[rgba(242,241,237,0.08)]">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.activeCount / max) * 100);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.hourOrDay}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 bg-[#0E0F12] border border-[rgba(242,241,237,0.15)] text-[#F2F1ED] text-[11px] py-1 px-2 z-20 pointer-events-none whitespace-nowrap">
                  <div className="font-mono">{item.activeCount} active learners</div>
                  <div className="text-[10px] text-[#9A9DA6] font-mono">At {item.hourOrDay}</div>
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full transition-all duration-150 ${
                  isHovered ? 'bg-[#4C63D2]' : 'bg-[#4C63D2]/40 group-hover:bg-[#4C63D2]/80'
                }`}
                style={{ height: `${Math.max(8, heightPercent)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between items-center text-[10px] text-[#9A9DA6] font-mono pt-2">
        {data.map((item) => (
          <span key={item.hourOrDay} className="flex-1 text-center truncate">
            {item.hourOrDay}
          </span>
        ))}
      </div>
    </div>
  );
};

// Activity by Day Bar Chart
export const DailyActivityChart: React.FC<{ data: TimeActivityMetric[]; id?: string }> = ({
  data,
  id = 'daily-activity-chart',
}) => {
  const max = Math.max(...data.map((d) => d.activeCount), 1);

  return (
    <div id={id} className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Activity by Day</h3>
          <p className="text-xs text-[#9A9DA6] mt-0.5">Aggregated student study sessions</p>
        </div>
      </div>

      <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[rgba(242,241,237,0.08)]">
        {data.map((item) => {
          const heightPercent = Math.round((item.activeCount / max) * 100);

          return (
            <div key={item.hourOrDay} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              <div className="text-[10px] font-mono text-[#9A9DA6] mb-1 group-hover:text-[#4C63D2] transition-colors">
                {item.activeCount}
              </div>
              <div
                className="w-full bg-[#4C63D2]/50 group-hover:bg-[#4C63D2] transition-colors"
                style={{ height: `${Math.max(10, heightPercent)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-[#9A9DA6] pt-2">
        {data.map((item) => (
          <span key={item.hourOrDay} className="flex-1 text-center">
            {item.hourOrDay}
          </span>
        ))}
      </div>
    </div>
  );
};

// Daily Watch Time Bar Chart for Dashboard
export const WatchTimeChart: React.FC<{
  data: { label: string; hours: number }[];
  id?: string;
}> = ({ data, id = 'watch-time-chart' }) => {
  const max = Math.max(...data.map((d) => d.hours), 1);

  return (
    <div id={id} className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Streaming Watch Time (Hours)</h3>
          <p className="text-xs text-[#9A9DA6] mt-0.5">Platform streaming playback metrics</p>
        </div>
      </div>

      <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-[rgba(242,241,237,0.08)]">
        {data.map((item) => {
          const heightPercent = Math.round((item.hours / max) * 100);

          return (
            <div key={item.label} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              <div className="text-[10px] font-mono text-[#9A9DA6] mb-1 group-hover:text-[#4C63D2] transition-colors">
                {item.hours}h
              </div>
              <div
                className="w-full bg-[#4C63D2]/60 group-hover:bg-[#4C63D2] transition-colors"
                style={{ height: `${Math.max(10, heightPercent)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-[#9A9DA6] pt-2">
        {data.map((item) => (
          <span key={item.label} className="flex-1 text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Drop-Off Points Curve Visualization
export const DropOffPointsChart: React.FC<{
  data: { minuteMark: number; dropPercentage: number; lessonTitle: string }[];
  id?: string;
}> = ({ data, id = 'drop-off-chart' }) => {
  return (
    <div id={id} className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Drop-off Points Analysis</h3>
            <span className="text-xs font-mono px-2 py-0.5 border border-rose-500/30 text-rose-400">
              Retention Alert
            </span>
          </div>
          <p className="text-xs text-[#9A9DA6] mt-0.5">
            Key video minute timestamps where learners exit stream
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.minuteMark} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F2F1ED]">
                Minute {item.minuteMark}:00 — <span className="text-[#9A9DA6] font-serif">{item.lessonTitle}</span>
              </span>
              <span className="font-mono text-rose-400">-{item.dropPercentage}% drop</span>
            </div>
            <div className="w-full h-1.5 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${item.dropPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DropOffChart: React.FC<{
  data: { time: string; retention: number }[];
  id?: string;
}> = ({ data, id = 'drop-off-summary-chart' }) => {
  return (
    <div id={id} className="space-y-3 pt-2">
      <div className="h-44 w-full flex items-end gap-3 pb-2 px-2 border-b border-[rgba(242,241,237,0.08)]">
        {data.map((item) => (
          <div key={item.time} className="flex-1 flex flex-col items-center h-full justify-end group">
            <div className="text-[10px] font-mono text-[#9A9DA6] mb-1 group-hover:text-[#4C63D2]">
              {item.retention}%
            </div>
            <div
              className="w-full bg-[#4C63D2]/60 group-hover:bg-[#4C63D2] transition-colors"
              style={{ height: `${Math.max(8, item.retention)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-[#9A9DA6]">
        {data.map((item) => (
          <span key={item.time} className="flex-1 text-center font-mono text-[11px]">
            {item.time}
          </span>
        ))}
      </div>
    </div>
  );
};

// Country Distribution Breakdown
export const CountryDistributionChart: React.FC<{
  data: CountryMetric[];
  id?: string;
}> = ({ data, id = 'country-distribution-chart' }) => {
  return (
    <div id={id} className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Geographic Distribution</h3>
          <p className="text-xs text-[#9A9DA6] mt-0.5">Active learners worldwide</p>
        </div>
        <Globe className="w-4 h-4 text-[#9A9DA6]" />
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.countryCode} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F2F1ED]">{item.country}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9A9DA6] font-mono text-[11px]">
                  {item.activeStudents} students
                </span>
                <span className="font-mono text-[#F2F1ED] w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] h-1.5 overflow-hidden">
              <div
                className="bg-[#4C63D2] h-full transition-all"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Most Watched vs Least Watched Lessons List
export const LessonWatchMetrics: React.FC<{
  mostWatched: AnalyticsLessonMetric[];
  leastWatched: AnalyticsLessonMetric[];
  id?: string;
}> = ({ mostWatched, leastWatched, id = 'lesson-watch-metrics' }) => {
  return (
    <div id={id} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Most Watched */}
      <div className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-serif text-sm font-normal text-[#F2F1ED] flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Most Watched Lessons
            </h4>
            <p className="text-xs text-[#9A9DA6] mt-0.5">High learner engagement & completion</p>
          </div>
        </div>

        <div className="divide-y divide-[rgba(242,241,237,0.08)]">
          {mostWatched.map((les) => (
            <div key={les.lessonId} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h5 className="font-serif text-xs font-normal text-[#F2F1ED] truncate">{les.lessonTitle}</h5>
                <p className="text-[11px] text-[#9A9DA6] truncate">{les.courseTitle}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-xs text-[#F2F1ED]">{les.watchCount} views</div>
                <div className="font-mono text-[11px] text-emerald-400">
                  {les.averageWatchPercentage}% avg finish
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Least Watched / Needing Review */}
      <div className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-serif text-sm font-normal text-[#F2F1ED] flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              Least Watched Lessons
            </h4>
            <p className="text-xs text-[#9A9DA6] mt-0.5">Candidates for syllabus refinement</p>
          </div>
        </div>

        <div className="divide-y divide-[rgba(242,241,237,0.08)]">
          {leastWatched.map((les) => (
            <div key={les.lessonId} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h5 className="font-serif text-xs font-normal text-[#F2F1ED] truncate">{les.lessonTitle}</h5>
                <p className="text-[11px] text-[#9A9DA6] truncate">{les.courseTitle}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-xs text-[#F2F1ED]">{les.watchCount} views</div>
                <div className="font-mono text-[11px] text-amber-400">
                  {les.averageWatchPercentage}% avg finish
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
