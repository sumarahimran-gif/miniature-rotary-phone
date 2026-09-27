import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  PlusCircle,
  Key,
  Ticket,
} from 'lucide-react';
import { AnalyticsSummary, Order, Course } from '../../types';
import { apiService } from '../../services/api';
import { AnalyticsCard } from '../../components/analytics/AnalyticsCard';
import { WatchTimeChart } from '../../components/analytics/Charts';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';

interface AdminDashboardProps {
  onNavigate: (view: string, payload?: unknown) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getAnalyticsSummary(),
      apiService.getOrders(),
      apiService.getCourses(),
    ]).then(([analyticsData, ordersData, coursesData]) => {
      setAnalytics(analyticsData);
      setOrders(ordersData);
      setCourses(coursesData);
      setIsLoading(false);
    });
  }, []);

  const recentOrders = orders.slice(0, 5);

  const orderColumns: Column<Order>[] = [
    {
      header: 'Receipt #',
      accessorKey: 'orderNumber',
      cell: (order) => <span className="font-mono text-xs text-[#F2F1ED]">{order.orderNumber}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'studentEmail',
      cell: (order) => (
        <div>
          <div className="text-xs font-medium text-[#F2F1ED]">{order.studentName || order.userName}</div>
          <div className="text-[11px] text-[#9A9DA6] font-mono">{order.studentEmail || order.userEmail}</div>
        </div>
      ),
    },
    {
      header: 'Curriculum',
      accessorKey: 'courseTitle',
      cell: (order) => (
        <span className="font-serif text-xs text-[#F2F1ED] max-w-[200px] truncate block">
          {order.courseTitle}
        </span>
      ),
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (order) => (
        <span className="font-mono text-xs text-[#F2F1ED]">
          {formatCurrency(order.total, order.currency)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (order) => (
        <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>{order.status}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            Studio Administration
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Platform Control Center</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Enrollment velocity, creator revenues, and DRM stream playback telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-quick-create-course"
            onClick={() => onNavigate('admin_create_course')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Curriculum</span>
          </button>

          <button
            onClick={() => onNavigate('admin_access_codes')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-[#9A9DA6]" />
            <span>Access Codes</span>
          </button>

          <button
            onClick={() => onNavigate('admin_coupons')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] transition-colors cursor-pointer"
          >
            <Ticket className="w-3.5 h-3.5 text-[#9A9DA6]" />
            <span>Coupons</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Gross Revenue"
          value={analytics ? formatCurrency(analytics.totalRevenue, 'USD') : '$0'}
          change="+18.4% vs last mo"
          isPositive={true}
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Total Students"
          value={analytics ? analytics.totalStudents.toLocaleString() : '0'}
          change="+12.5% this month"
          isPositive={true}
          icon={Users}
        />
        <AnalyticsCard
          title="Playback Runtime"
          value={analytics ? `${analytics.totalWatchTimeHours} hrs` : '0'}
          change="+24.1% cohort engagement"
          isPositive={true}
          icon={Clock}
        />
        <AnalyticsCard
          title="Avg Completion"
          value={analytics ? `${analytics.averageCompletionRate}%` : '0%'}
          change="+3.2% vs baseline"
          isPositive={true}
          icon={TrendingUp}
        />
      </div>

      {/* Watch Time Trend Chart */}
      {analytics && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(242,241,237,0.08)]">
            <div>
              <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Weekly Stream Runtime</h3>
              <p className="text-xs text-[#9A9DA6]">Cumulative weekly authorized playback hours</p>
            </div>
            <button
              onClick={() => onNavigate('admin_analytics')}
              className="text-xs text-[#4C63D2] hover:text-[#4C63D2]/80 transition-colors cursor-pointer"
            >
              Full Analytics Breakdown
            </button>
          </div>
          <WatchTimeChart data={analytics.dailyWatchTime} />
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(242,241,237,0.08)]">
          <div>
            <h3 className="font-serif text-base font-normal text-[#F2F1ED]">Recent Enrolled Orders</h3>
            <p className="text-xs text-[#9A9DA6]">Latest direct payments and access code redemptions</p>
          </div>
          <button
            onClick={() => onNavigate('admin_orders')}
            className="text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
          >
            All Orders ({orders.length})
          </button>
        </div>

        <Table
          id="admin-recent-orders-table"
          columns={orderColumns}
          data={recentOrders}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
