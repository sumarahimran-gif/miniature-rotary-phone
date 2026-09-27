import React, { useState } from 'react';
import { Bell, BookOpen, CreditCard, Shield } from 'lucide-react';
import { AppNotification } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface StudentNotificationsProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (view: string, payload?: unknown) => void;
}

export const StudentNotificationsPage: React.FC<StudentNotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            Dispatch Center
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Notifications</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Curriculum updates, DRM authorizations, and cohort announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            className="px-3 py-1 text-xs border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] bg-[#16181D] text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
          >
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </button>
          <button
            onClick={onMarkAllAsRead}
            className="px-3 py-1 text-xs text-[#4C63D2] hover:text-[#4C63D2]/80 border border-[#4C63D2]/30 bg-transparent transition-colors cursor-pointer"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="bg-[#16181D] border border-[rgba(242,241,237,0.08)] divide-y divide-[rgba(242,241,237,0.08)]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#9A9DA6]">
            No notifications in this folder.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onMarkAsRead(item.id);
                if (item.actionUrl === 'orders') onNavigate('student_orders');
              }}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                item.isRead ? 'hover:bg-[#1C2028]' : 'bg-[#1C2028]/70 hover:bg-[#1C2028]'
              }`}
            >
              <div className="p-2 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-[#9A9DA6] shrink-0">
                {item.type === 'course' && <BookOpen className="w-4 h-4 text-[#4C63D2]" />}
                {item.type === 'payment' && <CreditCard className="w-4 h-4 text-emerald-400" />}
                {item.type === 'access' && <Shield className="w-4 h-4 text-amber-400" />}
                {item.type === 'system' && <Bell className="w-4 h-4 text-[#9A9DA6]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif text-xs sm:text-sm font-normal text-[#F2F1ED]">{item.title}</h4>
                  <span className="text-[11px] text-[#9A9DA6] font-mono shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#9A9DA6] mt-1 leading-relaxed">{item.message}</p>
              </div>

              {!item.isRead && (
                <div className="w-1.5 h-1.5 bg-[#4C63D2] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
