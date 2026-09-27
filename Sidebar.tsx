import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Users,
  CreditCard,
  Receipt,
  Ticket,
  Key,
  Bell,
  Settings,
  PlusCircle,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  id?: string;
  role: 'student' | 'admin';
  activeView: string;
  onNavigate: (view: string, payload?: unknown) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  id = 'app-sidebar',
  role,
  activeView,
  onNavigate,
  className = '',
}) => {
  const adminNav = [
    {
      label: 'Overview',
      items: [
        { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin_analytics', label: 'Analytics & Watch Time', icon: BarChart3 },
      ],
    },
    {
      label: 'Curriculum',
      items: [
        { id: 'admin_courses', label: 'Courses & Curriculum', icon: BookOpen },
        { id: 'admin_create_course', label: 'Create New Course', icon: PlusCircle },
      ],
    },
    {
      label: 'Audience & Growth',
      items: [
        { id: 'admin_students', label: 'Students Directory', icon: Users },
        { id: 'admin_coupons', label: 'Coupons & Discounts', icon: Ticket },
        { id: 'admin_access_codes', label: 'Access Codes', icon: Key },
      ],
    },
    {
      label: 'Finance & System',
      items: [
        { id: 'admin_orders', label: 'Orders & Receipts', icon: Receipt },
        { id: 'admin_payments', label: 'Payments & Payouts', icon: CreditCard },
        { id: 'admin_notifications', label: 'Notifications', icon: Bell },
        { id: 'admin_settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const studentNav = [
    {
      label: 'Learning Space',
      items: [
        { id: 'student_dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
        { id: 'student_my_courses', label: 'My Enrolled Courses', icon: GraduationCap },
        { id: 'student_browse', label: 'Browse Curriculum', icon: BookOpen },
      ],
    },
    {
      label: 'Account & Orders',
      items: [
        { id: 'student_redeem_code', label: 'Redeem Access Code', icon: Key },
        { id: 'student_orders', label: 'Order History & Receipts', icon: Receipt },
        { id: 'student_notifications', label: 'Notifications', icon: Bell },
        { id: 'student_profile', label: 'Student Profile', icon: Users },
        { id: 'student_settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const sections = role === 'admin' ? adminNav : studentNav;

  return (
    <aside
      id={id}
      className={`w-64 bg-[#0E0F12] border-r border-[rgba(242,241,237,0.08)] p-4 flex flex-col justify-between shrink-0 ${className}`}
    >
      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {/* No ALL-CAPS eyebrow label */}
            <div className="px-3 text-xs font-medium text-[#9A9DA6] mb-2">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-link-${item.id}`}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-[#16181D] text-[#F2F1ED] border-l-2 border-[#4C63D2]'
                        : 'text-[#9A9DA6] hover:text-[#F2F1ED] hover:bg-[#16181D]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#4C63D2]' : 'text-[#9A9DA6]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[rgba(242,241,237,0.08)]">
        <div className="px-3 py-2 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#4C63D2] shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-[#F2F1ED]">
              {role === 'admin' ? 'Creator Suite' : 'Private Student'}
            </div>
            <div className="text-[10px] text-[#9A9DA6]">DRM & Watermark Active</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
