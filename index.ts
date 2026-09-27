/**
 * TypeScript interfaces for the Private Online Course Platform UI.
 * Purely frontend domain contracts designed to align with eventual backend services.
 */

export type UserRole = 'student' | 'admin' | 'creator' | 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status?: string;
  authUserId?: string;
  headline?: string;
  bio?: string;
  joinedAt: string;
  timezone?: string;
  enrolledCourseIds: string[];
}

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Video {
  id: string;
  title: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  // Designed for short-lived authorized playback token rather than static URL
  playbackToken?: string;
  watermarkText?: string;
  resolution?: string;
  isProcessed: boolean;
}

export interface LessonAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  durationMinutes: number;
  video?: Video;
  videoAssetId?: string;
  isFreePreview?: boolean;
  resourcesCount?: number;
  attachments?: LessonAttachment[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export type CourseModule = Module;

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  thumbnailUrl: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  status: CourseStatus;
  isPublished?: boolean;
  instructor: {
    id: string;
    name: string;
    avatarUrl: string;
    title: string;
    bio?: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  totalDurationMinutes: number;
  modulesCount: number;
  lessonsCount: number;
  enrolledStudentsCount: number;
  rating: number;
  reviewsCount: number;
  updatedAt: string;
  modules?: Module[];
  learningOutcomes?: string[];
  prerequisites?: string[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  lastWatchedAt: string;
}

export interface CourseProgress {
  courseId: string;
  completedLessonIds: string[];
  lastLessonId: string;
  resumeSeconds: number;
  totalLessons: number;
  completedPercentage: number;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  userId?: string;
  courseId: string;
  enrolledAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
  accessSource: 'purchase' | 'access_code' | 'admin_grant';
  progress?: CourseProgress;
  course?: Course;
}

export type OrderStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  userName?: string;
  userEmail?: string;
  courseId: string;
  courseTitle: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  currency: string;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'failed' | 'refunded';
  provider: 'mock_stripe' | 'mock_paypal' | 'mock_wire';
  transactionReference: string;
  createdAt: string;
  failureReason?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableCourseId?: string; // empty means all courses
  applicableCourseTitle?: string;
  usageCount: number;
  usedCount?: number;
  maxUses?: number;
  expiresAt: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AccessCode {
  id: string;
  code: string;
  courseId: string;
  courseTitle: string;
  allocatedToEmail?: string;
  redeemedByEmail?: string;
  isRedeemed?: boolean;
  usageCount: number;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
  batchTag?: string;
  createdAt: string;
}

export interface AccessCodeRedemption {
  id: string;
  codeId: string;
  code?: string;
  userId: string;
  userEmail?: string;
  courseId?: string;
  redeemedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'course' | 'system' | 'payment' | 'access';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalStudents: number;
  totalWatchTimeHours: number;
  averageCompletionRate: number;
  dailyWatchTime: { label: string; hours: number }[];
  dropOffPoints: { time: string; retention: number }[];
  countryBreakdown: { country: string; percentage: number; students: number }[];
  topLessons: {
    lessonId: string;
    lessonTitle: string;
    courseTitle: string;
    views: number;
    completionRate: number;
    dropOffRate: number;
  }[];
}

export interface AnalyticsLessonMetric {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  watchCount: number;
  averageWatchPercentage: number;
  dropOffMinute: number;
}

export interface CountryMetric {
  country: string;
  countryCode: string;
  percentage: number;
  activeStudents: number;
}

export interface TimeActivityMetric {
  hourOrDay: string;
  activeCount: number;
}

export interface Analytics {
  totalWatchTimeHours: number;
  averageWatchDurationMinutes: number;
  averageCompletionRatePercent: number;
  totalCourseCompletions: number;
  activeStudentsToday: number;
  mostWatchedLessons: AnalyticsLessonMetric[];
  leastWatchedLessons: AnalyticsLessonMetric[];
  dropOffPoints: {
    minuteMark: number;
    dropPercentage: number;
    lessonTitle: string;
  }[];
  activityByHour: TimeActivityMetric[];
  activityByDay: TimeActivityMetric[];
  countryDistribution: CountryMetric[];
}
