import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  LogOut,
  Sliders,
  ChevronDown,
  Shield,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { User as UserType, AppNotification } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';
import { isUserAdmin } from '../../services/supabase';

interface NavbarProps {
  id?: string;
  currentUser: UserType | null;
  currentRole: 'student' | 'admin';
  onNavigate: (view: string, payload?: unknown) => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  activeView: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  id = 'app-navbar',
  currentUser,
  currentRole,
  onNavigate,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  activeView,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  // Authoritative admin check based on authenticated user's database profile (role = ADMIN, status = ACTIVE)
  const isActualAdminUser = isUserAdmin(currentUser);

  return (
    <header
      id={id}
      className="sticky top-0 z-40 w-full bg-[#0E0F12] border-b border-[rgba(242,241,237,0.08)] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onNavigate(isActualAdminUser && currentRole === 'admin' ? 'admin_dashboard' : 'student_dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-8 h-8 rounded-sm bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex items-center justify-center text-[#F2F1ED] group-hover:border-[#4C63D2] transition-colors">
              <BookOpen className="w-4 h-4 text-[#4C63D2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-normal tracking-tight text-[#F2F1ED]">
                  Creator Hub
                </span>
                {currentUser?.id === 'dev-admin' && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 bg-purple-500/15 text-purple-300 border border-purple-500/40">
                    DEV MODE — ADMIN
                  </span>
                )}
                {currentUser?.id === 'dev-student' && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/40">
                    DEV MODE — STUDENT
                  </span>
                )}
                <span className="text-xs text-[#9A9DA6] font-sans hidden sm:inline">
                  Private Curriculum
                </span>
              </div>
            </div>
          </div>

          {/* Quick Nav Links (Student specific shortcuts) */}
          {currentUser && currentRole === 'student' && (
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('student_dashboard')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeView === 'student_dashboard'
                    ? 'text-[#F2F1ED] border-b-2 border-[#4C63D2]'
                    : 'text-[#9A9DA6] hover:text-[#F2F1ED]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('student_my_courses')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeView === 'student_my_courses'
                    ? 'text-[#F2F1ED] border-b-2 border-[#4C63D2]'
                    : 'text-[#9A9DA6] hover:text-[#F2F1ED]'
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => onNavigate('student_browse')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeView === 'student_browse'
                    ? 'text-[#F2F1ED] border-b-2 border-[#4C63D2]'
                    : 'text-[#9A9DA6] hover:text-[#F2F1ED]'
                }`}
              >
                Browse Catalog
              </button>
              <button
                onClick={() => onNavigate('student_redeem_code')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeView === 'student_redeem_code'
                    ? 'text-[#F2F1ED] border-b-2 border-[#4C63D2]'
                    : 'text-[#9A9DA6] hover:text-[#F2F1ED]'
                }`}
              >
                Redeem Code
              </button>
            </nav>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Static Portal Indicator - Never an interactive role toggle */}
          {isActualAdminUser ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#16181D] border border-[#4C63D2]/30 text-xs text-[#F2F1ED]">
              <Shield className="w-3.5 h-3.5 text-[#4C63D2]" />
              <span className="font-medium text-[#4C63D2]">Admin Portal</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#16181D] border border-[rgba(242,241,237,0.08)] text-xs text-[#9A9DA6]">
              <GraduationCap className="w-3.5 h-3.5 text-[#4C63D2]" />
              <span>Student Portal</span>
            </div>
          )}

          {/* Theme Switcher Button */}
          <button
            id="theme-switcher-button"
            data-testid="theme-toggle-button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] hover:bg-[#1C1F26] border border-[rgba(242,241,237,0.08)] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Currently in ${theme} mode. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px] font-mono">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#4C63D2]" />
                <span className="hidden md:inline text-[11px] font-mono">Dark</span>
              </>
            )}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              id="notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#9A9DA6] hover:text-[#F2F1ED] hover:bg-[#16181D] transition-colors border border-[rgba(242,241,237,0.08)]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4C63D2]" />
              )}
            </button>

            {showNotifications && (
              <div
                id="notifications-popover"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#16181D] border border-[rgba(242,241,237,0.08)] z-50 p-4 shadow-lg"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(242,241,237,0.08)]">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-medium text-[#F2F1ED]">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[11px] text-[#4C63D2] font-mono">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-xs text-[#9A9DA6] hover:text-[#F2F1ED]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[rgba(242,241,237,0.08)] max-h-80 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#9A9DA6]">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onMarkNotificationAsRead(item.id);
                          if (item.actionUrl === 'orders') {
                            onNavigate(isActualAdminUser && currentRole === 'admin' ? 'admin_orders' : 'student_orders');
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-3 transition-colors cursor-pointer ${
                          item.isRead ? 'hover:bg-[#1C1F26]' : 'bg-[rgba(76,99,210,0.08)] hover:bg-[rgba(76,99,210,0.12)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-medium text-[#F2F1ED]">{item.title}</h5>
                          <span className="text-[11px] text-[#9A9DA6] shrink-0 font-mono">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#9A9DA6] mt-1 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {currentUser && (
            <div className="relative">
              <button
                id="user-profile-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 border border-[rgba(242,241,237,0.08)] bg-[#16181D] hover:border-[rgba(242,241,237,0.16)] transition-colors"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 object-cover"
                />
                <span className="text-xs text-[#F2F1ED] hidden sm:block max-w-[110px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9A9DA6] mr-1" />
              </button>

              {showUserMenu && (
                <div
                  id="user-menu-popover"
                  className="absolute right-0 mt-2 w-64 bg-[#16181D] border border-[rgba(242,241,237,0.08)] z-50 p-2 text-xs shadow-lg"
                >
                  <div className="p-3 border-b border-[rgba(242,241,237,0.08)] mb-1">
                    <div className="font-medium text-[#F2F1ED] truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-[#9A9DA6] truncate">{currentUser.email}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {isActualAdminUser ? (
                        <span className="text-[11px] text-[#4C63D2] font-mono flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Admin (Full Access)
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> Student
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Navigation based on user permissions */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate(isActualAdminUser && currentRole === 'admin' ? 'admin_dashboard' : 'student_dashboard');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#9A9DA6] hover:text-[#F2F1ED] hover:bg-[#1C1F26] transition-colors text-left cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#9A9DA6]" />
                    <span>{isActualAdminUser && currentRole === 'admin' ? 'Creator Studio' : 'Learning Dashboard'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate(isActualAdminUser && currentRole === 'admin' ? 'admin_settings' : 'student_settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#9A9DA6] hover:text-[#F2F1ED] hover:bg-[#1C1F26] transition-colors text-left cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-[#9A9DA6]" />
                    <span>Settings & Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate(isActualAdminUser && currentRole === 'admin' ? 'admin_notifications' : 'student_notifications');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[#9A9DA6] hover:text-[#F2F1ED] hover:bg-[#1C1F26] transition-colors text-left cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#9A9DA6]" />
                    <span>Notifications Center</span>
                  </button>

                  <div className="my-1 border-t border-[rgba(242,241,237,0.08)]" />

                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-[#9A9DA6] hover:text-[#F2F1ED] hover:bg-[#1C1F26] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#4C63D2]" />
                      )}
                      <span>Appearance</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#4C63D2]">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  <div className="my-1 border-t border-[rgba(242,241,237,0.08)]" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) {
                        onLogout();
                      } else {
                        onNavigate('auth_login');
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-[#1C1F26] transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
