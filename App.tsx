import React, { useState, useEffect } from 'react';
import { User, Course, Enrollment, AppNotification, Lesson, Order, CourseProgress } from './types';
import { apiService } from './services/api';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { ThemeProvider } from './contexts/ThemeContext';
import { useToast } from './hooks/useToast';
import { Shield } from 'lucide-react';
import {
  supabase,
  isSupabaseConfigured,
  getDatabaseUserProfile,
  mapSupabaseUserToAppUser,
  signOutUser,
  isUserAdmin,
} from './services/supabase';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { BrowseCoursesPage } from './pages/student/BrowseCoursesPage';
import { CourseDetailsPage } from './pages/student/CourseDetailsPage';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { LearningVideoPage } from './pages/student/LearningVideoPage';
import { RedeemAccessCodePage } from './pages/student/RedeemAccessCodePage';
import { OrdersHistoryPage } from './pages/student/OrdersHistoryPage';
import { CheckoutPage } from './pages/student/CheckoutPage';
import { PaymentStatusPage } from './pages/student/PaymentStatusPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentSettingsPage } from './pages/student/StudentSettingsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { CourseEditorPage } from './pages/admin/CourseEditorPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminAccessCodesPage } from './pages/admin/AdminAccessCodesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function AppContent() {
  const { toast } = useToast();

  // Primary State - Unauthenticated by default, currentUser is null until DB profile is loaded
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isInitialRecovery =
    typeof window !== 'undefined' &&
    (window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery'));
  const [activeView, setActiveView] = useState<string>(
    isInitialRecovery ? 'auth_reset_password' : 'auth_login'
  );

  // App Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Entity Payloads for Detailed views
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string>('');

  // Initial Data Bootstrap & Auth Session Persistence on Page Load/Refresh
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        let initialUser: User | null = null;
        const isRecoveryUrl =
          typeof window !== 'undefined' &&
          (window.location.hash.includes('type=recovery') ||
            window.location.search.includes('type=recovery'));

        // 14. On page refresh, restore the Supabase session and then fetch the database profile again.
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            try {
              // Using that authenticated user's ID, query public.users (match auth_user_id = session.user.id)
              // Wait for this database profile query to finish BEFORE deciding which portal to show
              const dbProfile = await getDatabaseUserProfile(session.user.id, session.user.email);
              if (dbProfile) {
                const role = (dbProfile.role || '').toString().trim().toUpperCase();
                const status = (dbProfile.status || 'ACTIVE').toString().trim().toUpperCase();
                if (status === 'ACTIVE') {
                  initialUser = mapSupabaseUserToAppUser(session.user, dbProfile);
                }
              }
            } catch (profileErr) {
              console.warn('Notice loading profile for restored session:', profileErr);
            }
          }
        } else {
          // Fallback for offline testing
          initialUser = await apiService.getCurrentUser();
        }

        const [coursesData, enrollmentsData, notifsData] = await Promise.all([
          apiService.getCourses(),
          apiService.getEnrollments(),
          apiService.getNotifications(),
        ]);

        if (isMounted) {
          setCourses(coursesData);
          setEnrollments(enrollmentsData);
          setNotifications(notifsData);

          if (isRecoveryUrl) {
            // Dedicated password recovery flow takes absolute precedence
            setActiveView('auth_reset_password');
          } else if (initialUser) {
            // 7. If role === 'ADMIN' AND status === 'ACTIVE', route to Admin Portal
            // 8. If role === 'STUDENT' AND status === 'ACTIVE', route to Student Portal
            const isAdmin = isUserAdmin(initialUser);
            setCurrentUser(initialUser);
            if (isAdmin) {
              setActiveView('admin_dashboard');
            } else {
              setActiveView('student_dashboard');
            }
          } else {
            // Unauthenticated users are routed to login, unless an active user was already set
            setCurrentUser((prevUser) => {
              if (prevUser) {
                // An authenticated user is already active, preserve it!
                return prevUser;
              }
              setActiveView((prevView) =>
                prevView === 'auth_reset_password'
                  ? prevView
                  : prevView.startsWith('auth_')
                  ? 'auth_login'
                  : prevView
              );
              return null;
            });
          }
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    // Real-time Supabase Auth state listener across tabs and auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setActiveView('auth_reset_password');
        return;
      }

      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setActiveView((prev) => (prev === 'auth_reset_password' ? prev : 'auth_login'));
        return;
      }

      if (session?.user) {
        // If recovery URL parameters are detected, maintain the dedicated reset password view
        const isRecovery =
          typeof window !== 'undefined' &&
          (window.location.hash.includes('type=recovery') ||
            window.location.search.includes('type=recovery'));

        if (isRecovery) {
          setActiveView('auth_reset_password');
          return;
        }

        // Prevent duplicate fetches if the session's user is already the currentUser
        setCurrentUser((current) => {
          if (
            current &&
            (current.authUserId === session.user.id || current.id === session.user.id)
          ) {
            return current;
          }

          // Fetch authoritative profile from public.users using auth_user_id
          getDatabaseUserProfile(session.user.id, session.user.email)
            .then((dbProfile) => {
              if (!isMounted || !dbProfile) return;
              const role = (dbProfile.role || '').toString().trim().toUpperCase();
              const status = (dbProfile.status || 'ACTIVE').toString().trim().toUpperCase();

              if (status === 'ACTIVE') {
                const appUser = mapSupabaseUserToAppUser(session.user, dbProfile);
                const isAdmin = role === 'ADMIN';
                setCurrentUser(appUser);
                setActiveView((prev) => {
                  if (prev === 'auth_reset_password') {
                    return prev;
                  }
                  if (prev.startsWith('auth_')) {
                    return isAdmin ? 'admin_dashboard' : 'student_dashboard';
                  }
                  if (prev.startsWith('admin_') && !isAdmin) {
                    return 'student_dashboard';
                  }
                  return prev;
                });
              }
            })
            .catch((err) => {
              console.warn('onAuthStateChange profile notice:', err);
            });

          return current;
        });
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Router Navigation with Strict Frontend Access Control Gatekeeper
  const handleNavigate = (view: string, payload?: unknown) => {
    // Unauthenticated users cannot access any portal view
    if (!currentUser && !view.startsWith('auth_')) {
      setActiveView('auth_login');
      return;
    }

    const isActualAdmin = isUserAdmin(currentUser);

    // Authenticated STUDENT attempting an admin route -> redirect to Student Portal
    if (view.startsWith('admin_') && !isActualAdmin) {
      toast('Access Denied: Administrative portal is restricted to platform creators.', 'error');
      setActiveView('student_dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (payload && typeof payload === 'object' && 'courseId' in payload) {
      setSelectedCourseId((payload as { courseId: string }).courseId);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resume or start lesson
  const handleResumeLesson = (courseId: string, lessonId?: string) => {
    setSelectedCourseId(courseId);
    const targetCourse = courses.find((c) => c.id === courseId);
    if (targetCourse && targetCourse.modules && targetCourse.modules.length > 0) {
      const chosenLessonId =
        lessonId ||
        targetCourse.modules[0].lessons[0]?.id ||
        null;
      setActiveLessonId(chosenLessonId);
    }
    setActiveView('student_learning');
  };

  // Notification read handlers
  const handleMarkNotificationRead = async (id: string) => {
    await apiService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await apiService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast('All notifications marked as read', 'info');
  };

  // Lesson completion toggle
  const handleToggleLessonCompletion = async (lessonId: string, completed: boolean) => {
    if (!selectedCourseId) return;

    await apiService.updateLessonProgress(selectedCourseId, lessonId, completed, 0);
    const updatedEnrollments = await apiService.getEnrollments();
    setEnrollments(updatedEnrollments);

    toast(
      completed ? 'Lesson marked as completed!' : 'Lesson unmarked',
      completed ? 'success' : 'info'
    );
  };

  // Sign out handler connecting to Supabase Auth
  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured) {
        await signOutUser();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setActiveView('auth_login');
      toast('Signed out successfully.', 'info');
    }
  };

  // Fallback loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E0F12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#4C63D2] border-t-transparent animate-spin" />
          <span className="font-serif text-xs text-[#9A9DA6]">Loading curriculum platform...</span>
        </div>
      </div>
    );
  }

  // Dedicated Password Recovery View - Handled with highest priority during recovery flow
  if (activeView === 'auth_reset_password') {
    return (
      <>
        <ToastContainer />
        <ResetPasswordPage
          onSuccess={async () => {
            try {
              if (isSupabaseConfigured) {
                await signOutUser();
              }
            } catch (err) {
              console.warn('Notice signing out after password reset:', err);
            }
            if (typeof window !== 'undefined' && window.history.replaceState) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            setCurrentUser(null);
            setActiveView('auth_login');
            toast('Password updated successfully! Please sign in with your new password.', 'success');
          }}
          onNavigate={(view) => {
            if (typeof window !== 'undefined' && window.history.replaceState) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            setActiveView(view);
          }}
        />
      </>
    );
  }

  // Auth Views - Unauthenticated Users are restricted strictly to Auth Pages
  if (!currentUser) {
    if (activeView === 'auth_register') {
      return (
        <>
          <ToastContainer />
          <RegisterPage
            onRegisterSuccess={(targetRole, userPayload) => {
              if (userPayload) {
                // Authoritatively determine role from database profile (role = ADMIN, status = ACTIVE)
                const isAdmin = isUserAdmin(userPayload) || targetRole === 'admin';
                setCurrentUser(userPayload);
                setActiveView(isAdmin ? 'admin_dashboard' : 'student_dashboard');
                toast(`Welcome to Creator Hub, ${userPayload.name}!`, 'success');
              } else {
                setActiveView('auth_login');
              }
            }}
            onNavigate={(view) => setActiveView(view)}
          />
        </>
      );
    }

    if (activeView === 'auth_forgot_password') {
      return (
        <>
          <ToastContainer />
          <ForgotPasswordPage onNavigate={(view) => setActiveView(view)} />
        </>
      );
    }

    // Default unauthenticated view: Login page
    return (
      <>
        <ToastContainer />
        <LoginPage
          onLoginSuccess={(targetRole, userPayload) => {
            if (userPayload) {
              // Authoritatively determine role from database profile (role = ADMIN, status = ACTIVE)
              const isAdmin = isUserAdmin(userPayload) || targetRole === 'admin';
              setCurrentUser(userPayload);
              setActiveView(isAdmin ? 'admin_dashboard' : 'student_dashboard');
              toast(`Signed in as ${userPayload.name}`, 'success');
            }
          }}
          onNavigate={(view) => setActiveView(view)}
        />
      </>
    );
  }

  // Selected entities resolution
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const activeEnrollment = enrollments.find((e) => e.courseId === selectedCourse?.id);
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  // Find active lesson
  let currentLesson: Lesson | null = null;
  let allCourseLessons: Lesson[] = [];

  if (selectedCourse?.modules) {
    allCourseLessons = selectedCourse.modules.flatMap((m) => m.lessons);
    if (activeLessonId) {
      currentLesson = allCourseLessons.find((l) => l.id === activeLessonId) || allCourseLessons[0];
    } else {
      currentLesson = allCourseLessons[0] || null;
    }
  }

  const currentLessonIndex = currentLesson
    ? allCourseLessons.findIndex((l) => l.id === currentLesson?.id)
    : -1;
  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < allCourseLessons.length - 1;
  const hasPrevLesson = currentLessonIndex > 0;

  // Learning Video Page - renders full-screen immersive view
  if (activeView === 'student_learning' && selectedCourse && currentLesson) {
    const dummyProgress: CourseProgress = activeEnrollment?.progress || {
      courseId: selectedCourse.id,
      totalLessons: selectedCourse.lessonsCount || allCourseLessons.length || 1,
      completedLessonIds: [],
      completedPercentage: 0,
      resumeSeconds: 0,
      lastLessonId: currentLesson.id,
      updatedAt: new Date().toISOString(),
    };

    return (
      <>
        <ToastContainer />
        <div className="min-h-screen bg-slate-950 flex flex-col">
          <LearningVideoPage
            course={selectedCourse}
            currentLesson={currentLesson}
            progress={dummyProgress}
            onSelectLesson={(lesson) => setActiveLessonId(lesson.id)}
            onToggleLessonCompletion={handleToggleLessonCompletion}
            onNextLesson={() => {
              if (hasNextLesson) {
                setActiveLessonId(allCourseLessons[currentLessonIndex + 1].id);
              }
            }}
            onPrevLesson={() => {
              if (hasPrevLesson) {
                setActiveLessonId(allCourseLessons[currentLessonIndex - 1].id);
              }
            }}
            hasNextLesson={hasNextLesson}
            hasPrevLesson={hasPrevLesson}
            onBackToCourse={() => setActiveView('student_course_details')}
            onProgressUpdate={() => {}}
          />
        </div>
      </>
    );
  }

  // Determine effective role for sidebar and portal layout
  // Authoritative admin check: role === 'ADMIN' and status === 'ACTIVE'
  const isActualAdmin = isUserAdmin(currentUser);
  const effectiveRole: 'student' | 'admin' = isActualAdmin ? 'admin' : 'student';

  return (
    <div className="min-h-screen bg-[#0E0F12] flex flex-col text-[#F2F1ED] antialiased font-sans transition-colors">
      <ToastContainer />

      {/* Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentRole={effectiveRole}
        onNavigate={handleNavigate}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsRead}
        activeView={activeView}
        onLogout={handleLogout}
      />

      {/* Main Body with Sidebar Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar - Strictly follows effectiveRole */}
        <Sidebar
          role={effectiveRole}
          activeView={activeView}
          onNavigate={handleNavigate}
          className="hidden md:flex"
        />

        {/* Dynamic View Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Access Denied View for Unauthorized Student Access Attempt */}
          {(activeView === 'access_denied' || (activeView.startsWith('admin_') && !isActualAdmin)) && (
            <AccessDeniedView
              currentUser={currentUser}
              onReturnToDashboard={() => {
                setActiveView('student_dashboard');
              }}
              onLogout={handleLogout}
            />
          )}

          {/* ================= STUDENT VIEWS ================= */}
          {activeView === 'student_dashboard' && (
            <StudentDashboardPage
              user={currentUser}
              enrollments={enrollments}
              catalogCourses={courses}
              onNavigate={handleNavigate}
              onResumeLesson={handleResumeLesson}
            />
          )}

          {activeView === 'student_browse' && (
            <BrowseCoursesPage
              courses={courses}
              enrolledCourseIds={enrolledCourseIds}
              onSelectCourse={(c) => {
                setSelectedCourseId(c.id);
                setActiveView('student_course_details');
              }}
            />
          )}

          {activeView === 'student_course_details' && selectedCourse && (
            <CourseDetailsPage
              course={selectedCourse}
              isEnrolled={enrolledCourseIds.has(selectedCourse.id)}
              onEnroll={(c) => {
                setSelectedCourseId(c.id);
                setActiveView('student_checkout');
              }}
              onResume={(cId, lId) => handleResumeLesson(cId, lId)}
              onPreviewLesson={(lesson) => {
                setActiveLessonId(lesson.id);
                setActiveView('student_learning');
              }}
              onBack={() => setActiveView('student_browse')}
            />
          )}

          {activeView === 'student_my_courses' && (
            <MyCoursesPage
              enrollments={enrollments}
              onResumeLesson={handleResumeLesson}
              onBrowseCourses={() => setActiveView('student_browse')}
            />
          )}

          {activeView === 'student_redeem_code' && (
            <RedeemAccessCodePage
              onSuccessRedeem={async (course) => {
                const updated = await apiService.getEnrollments();
                setEnrollments(updated);
                toast(`Access unlocked for "${course.title}"!`, 'success');
                handleResumeLesson(course.id);
              }}
              onBrowseCourses={() => setActiveView('student_browse')}
            />
          )}

          {activeView === 'student_orders' && <OrdersHistoryPage />}

          {activeView === 'student_checkout' && selectedCourse && (
            <CheckoutPage
              course={selectedCourse}
              onBack={() => setActiveView('student_course_details')}
              onPaymentComplete={async (order) => {
                setCompletedOrder(order);
                const updated = await apiService.getEnrollments();
                setEnrollments(updated);
                setActiveView('student_payment_status');
                toast('Enrollment confirmed!', 'success');
              }}
              onPaymentFail={(errorMsg) => {
                setPaymentErrorMessage(errorMsg);
                setActiveView('student_payment_failure');
              }}
            />
          )}

          {activeView === 'student_payment_status' && (
            <PaymentStatusPage
              status="success"
              order={completedOrder || undefined}
              onEnterCourse={(cId) => handleResumeLesson(cId)}
              onRetryCheckout={() => setActiveView('student_checkout')}
              onViewOrders={() => setActiveView('student_orders')}
            />
          )}

          {activeView === 'student_payment_failure' && (
            <PaymentStatusPage
              status="failure"
              errorMessage={paymentErrorMessage}
              onEnterCourse={() => {}}
              onRetryCheckout={() => setActiveView('student_checkout')}
              onViewOrders={() => setActiveView('student_orders')}
            />
          )}

          {activeView === 'student_profile' && (
            <StudentProfilePage user={currentUser} enrollments={enrollments} />
          )}

          {activeView === 'student_settings' && <StudentSettingsPage />}

          {activeView === 'student_notifications' && (
            <StudentNotificationsPage
              notifications={notifications}
              onMarkAsRead={handleMarkNotificationRead}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onNavigate={handleNavigate}
            />
          )}

          {/* ================= ADMIN / CREATOR VIEWS (Only accessible to currentUser role = ADMIN and status = ACTIVE) ================= */}
          {isActualAdmin && (
            <>
              {activeView === 'admin_dashboard' && (
                <AdminDashboardPage onNavigate={handleNavigate} />
              )}

              {activeView === 'admin_analytics' && <AdminAnalyticsPage />}

              {activeView === 'admin_courses' && (
                <AdminCoursesPage
                  onNavigate={handleNavigate}
                  onEditCourse={(course) => {
                    setEditingCourse(course);
                    setActiveView('admin_edit_course');
                  }}
                />
              )}

              {activeView === 'admin_create_course' && (
                <CourseEditorPage
                  initialCourse={null}
                  onSave={(newCourse) => {
                    setCourses([newCourse, ...courses]);
                    toast(`Created course "${newCourse.title}"`, 'success');
                    setActiveView('admin_courses');
                  }}
                  onCancel={() => setActiveView('admin_courses')}
                />
              )}

              {activeView === 'admin_edit_course' && (
                <CourseEditorPage
                  initialCourse={editingCourse}
                  onSave={(updated) => {
                    setCourses(courses.map((c) => (c.id === updated.id ? updated : c)));
                    toast(`Updated course "${updated.title}"`, 'success');
                    setActiveView('admin_courses');
                  }}
                  onCancel={() => setActiveView('admin_courses')}
                />
              )}

              {activeView === 'admin_students' && <AdminStudentsPage />}

              {activeView === 'admin_orders' && <AdminOrdersPage />}

              {activeView === 'admin_payments' && <AdminPaymentsPage />}

              {activeView === 'admin_coupons' && <AdminCouponsPage />}

              {activeView === 'admin_access_codes' && <AdminAccessCodesPage />}

              {activeView === 'admin_notifications' && (
                <StudentNotificationsPage
                  notifications={notifications}
                  onMarkAsRead={handleMarkNotificationRead}
                  onMarkAllAsRead={handleMarkAllNotificationsRead}
                  onNavigate={handleNavigate}
                />
              )}

              {activeView === 'admin_settings' && <AdminSettingsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
