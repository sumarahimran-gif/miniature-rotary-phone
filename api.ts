/**
 * Mock API Service Layer
 * Fully abstracted asynchronous functions returning promises.
 * Designed so that the backend can seamlessly replace this file later
 * without modifying any component or page business logic.
 */

import {
  Course,
  Enrollment,
  Lesson,
  Order,
  Payment,
  Coupon,
  AccessCode,
  AccessCodeRedemption,
  AppNotification,
  Analytics,
  AnalyticsSummary,
  CourseProgress,
  User,
} from '../types';

import {
  mockCourses,
  mockEnrollments,
  mockOrders,
  mockPayments,
  mockCoupons,
  mockAccessCodes,
  mockAccessCodeRedemptions,
  mockNotifications,
  mockAnalyticsData,
  mockStudentsList,
  mockCurrentUserStudent,
  mockCurrentUserAdmin,
} from '../mock/mockData';

// Simulated realistic network latency helper
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory clones to allow simulated client mutations during the session
let coursesState: Course[] = JSON.parse(JSON.stringify(mockCourses));
let enrollmentsState: Enrollment[] = JSON.parse(JSON.stringify(mockEnrollments));
let ordersState: Order[] = JSON.parse(JSON.stringify(mockOrders));
let paymentsState: Payment[] = JSON.parse(JSON.stringify(mockPayments));
let couponsState: Coupon[] = JSON.parse(JSON.stringify(mockCoupons));
let accessCodesState: AccessCode[] = JSON.parse(JSON.stringify(mockAccessCodes));
let accessCodeRedemptionsState: AccessCodeRedemption[] = JSON.parse(JSON.stringify(mockAccessCodeRedemptions));
let notificationsState: AppNotification[] = JSON.parse(JSON.stringify(mockNotifications));
let studentsState = JSON.parse(JSON.stringify(mockStudentsList));

export const apiService = {
  // ==========================================
  // STUDENT SERVICES
  // ==========================================

  async getCourses(filters?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    await delay();
    let result = [...coursesState.filter((c) => c.status === 'published')];
    if (filters?.category && filters.category !== 'All') {
      result = result.filter((c) => c.category.toLowerCase().includes(filters.category!.toLowerCase()));
    }
    if (filters?.level && filters.level !== 'All') {
      result = result.filter((c) => c.level === filters.level);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.shortDescription.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getCourse(id: string): Promise<Course | null> {
    await delay();
    const course = coursesState.find((c) => c.id === id || c.slug === id);
    return course ? JSON.parse(JSON.stringify(course)) : null;
  },

  async getMyCourses(): Promise<Enrollment[]> {
    await delay();
    return JSON.parse(JSON.stringify(enrollmentsState));
  },

  async getLesson(courseId: string, lessonId: string): Promise<{ lesson: Lesson; nextLessonId?: string; prevLessonId?: string } | null> {
    await delay();
    const course = coursesState.find((c) => c.id === courseId);
    if (!course || !course.modules) return null;

    const allLessons: Lesson[] = [];
    course.modules.forEach((mod) => {
      mod.lessons.forEach((les) => allLessons.push(les));
    });

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    if (currentIndex === -1) {
      return allLessons.length > 0 ? { lesson: allLessons[0], nextLessonId: allLessons[1]?.id } : null;
    }

    return {
      lesson: JSON.parse(JSON.stringify(allLessons[currentIndex])),
      prevLessonId: currentIndex > 0 ? allLessons[currentIndex - 1].id : undefined,
      nextLessonId: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : undefined,
    };
  },

  async getMyProgress(courseId: string): Promise<CourseProgress | null> {
    await delay();
    const enrollment = enrollmentsState.find((e) => e.courseId === courseId);
    return enrollment?.progress ? JSON.parse(JSON.stringify(enrollment.progress)) : null;
  },

  async updateLessonProgress(courseId: string, lessonId: string, completed: boolean, resumeSeconds: number): Promise<CourseProgress> {
    await delay(100);
    let enrollment = enrollmentsState.find((e) => e.courseId === courseId);
    if (!enrollment) {
      // create fallback enrollment
      const course = coursesState.find((c) => c.id === courseId);
      enrollment = {
        id: `enr_${Date.now()}`,
        studentId: mockCurrentUserStudent.id,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        accessSource: 'purchase',
        course,
        progress: {
          courseId,
          completedLessonIds: [],
          lastLessonId: lessonId,
          resumeSeconds: 0,
          totalLessons: 10,
          completedPercentage: 0,
          updatedAt: new Date().toISOString(),
        },
      };
      enrollmentsState.push(enrollment);
    }

    if (!enrollment.progress) {
      enrollment.progress = {
        courseId,
        completedLessonIds: [],
        lastLessonId: lessonId,
        resumeSeconds,
        totalLessons: 10,
        completedPercentage: 0,
        updatedAt: new Date().toISOString(),
      };
    }

    const currentCompleted = new Set(enrollment.progress.completedLessonIds);
    if (completed) {
      currentCompleted.add(lessonId);
    } else {
      currentCompleted.delete(lessonId);
    }

    enrollment.progress.completedLessonIds = Array.from(currentCompleted);
    enrollment.progress.lastLessonId = lessonId;
    enrollment.progress.resumeSeconds = resumeSeconds;
    enrollment.progress.completedPercentage = Math.round(
      (enrollment.progress.completedLessonIds.length / (enrollment.progress.totalLessons || 1)) * 100
    );
    enrollment.progress.updatedAt = new Date().toISOString();

    return JSON.parse(JSON.stringify(enrollment.progress));
  },

  async redeemAccessCode(code: string): Promise<{ success: boolean; message: string; course?: Course }> {
    await delay(300);
    const cleanedCode = code.trim().toUpperCase();
    const accessCode = accessCodesState.find(
      (c) => c.code.toUpperCase() === cleanedCode && c.isActive
    );

    if (!accessCode) {
      return { success: false, message: 'Invalid or inactive access code. Please check and try again.' };
    }

    if (new Date(accessCode.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'This access code has expired.' };
    }

    if (accessCode.usageCount >= accessCode.maxUses) {
      return { success: false, message: 'This access code has reached its maximum redemptions.' };
    }

    // Check if already enrolled
    const alreadyEnrolled = enrollmentsState.some((e) => e.courseId === accessCode.courseId);
    if (alreadyEnrolled) {
      return { success: false, message: 'You already hold active lifetime access to this course.' };
    }

    const course = coursesState.find((c) => c.id === accessCode.courseId);
    if (!course) {
      return { success: false, message: 'Associated course was not found.' };
    }

    // Register access
    accessCode.usageCount += 1;
    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      studentId: mockCurrentUserStudent.id,
      courseId: course.id,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      accessSource: 'access_code',
      course,
      progress: {
        courseId: course.id,
        completedLessonIds: [],
        lastLessonId: course.modules?.[0]?.lessons?.[0]?.id || '',
        resumeSeconds: 0,
        totalLessons: course.lessonsCount || 10,
        completedPercentage: 0,
        updatedAt: new Date().toISOString(),
      },
    };
    enrollmentsState.unshift(newEnrollment);

    // Create notification
    notificationsState.unshift({
      id: `notif_${Date.now()}`,
      title: 'Course Access Activated',
      message: `Access code successfully redeemed. You now have access to "${course.title}".`,
      type: 'access',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Congratulations! You now have full access to ${course.title}.`,
      course,
    };
  },

  async applyCoupon(code: string, courseId: string): Promise<{ success: boolean; message: string; discountAmount: number; finalTotal: number }> {
    await delay(200);
    const cleaned = code.trim().toUpperCase();
    const coupon = couponsState.find((c) => c.code.toUpperCase() === cleaned && c.isActive);
    const course = coursesState.find((c) => c.id === courseId);

    if (!course) {
      return { success: false, message: 'Course not found', discountAmount: 0, finalTotal: 0 };
    }

    if (!coupon) {
      return { success: false, message: 'Invalid coupon code', discountAmount: 0, finalTotal: course.price };
    }

    if (coupon.applicableCourseId && coupon.applicableCourseId !== courseId) {
      return { success: false, message: `Coupon is only valid for: ${coupon.applicableCourseTitle || 'another course'}`, discountAmount: 0, finalTotal: course.price };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((course.price * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, course.price);
    const finalTotal = Math.max(0, course.price - discount);

    return {
      success: true,
      message: `Coupon applied: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}`,
      discountAmount: discount,
      finalTotal,
    };
  },

  async processCheckout(data: {
    courseId: string;
    couponCode?: string;
    paymentMethod: string;
  }): Promise<{ success: boolean; order?: Order; message: string }> {
    await delay(400);
    const course = coursesState.find((c) => c.id === data.courseId);
    if (!course) {
      return { success: false, message: 'Course not found' };
    }

    let discount = 0;
    if (data.couponCode) {
      const cRes = await this.applyCoupon(data.couponCode, data.courseId);
      if (cRes.success) {
        discount = cRes.discountAmount;
      }
    }

    const total = Math.max(0, course.price - discount);
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      studentId: mockCurrentUserStudent.id,
      studentName: mockCurrentUserStudent.name,
      studentEmail: mockCurrentUserStudent.email,
      courseId: course.id,
      courseTitle: course.title,
      subtotal: course.price,
      discountAmount: discount,
      total,
      currency: course.currency,
      couponCode: data.couponCode,
      status: 'completed',
      paymentMethod: data.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    ordersState.unshift(newOrder);

    // Add payment
    paymentsState.unshift({
      id: `pay_${Date.now()}`,
      orderId: newOrder.id,
      studentId: mockCurrentUserStudent.id,
      studentName: mockCurrentUserStudent.name,
      amount: total,
      currency: course.currency,
      status: 'succeeded',
      provider: 'mock_stripe',
      transactionReference: `ch_mock_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
    });

    // Add enrollment
    const existing = enrollmentsState.find((e) => e.courseId === course.id);
    if (!existing) {
      enrollmentsState.unshift({
        id: `enr_${Date.now()}`,
        studentId: mockCurrentUserStudent.id,
        courseId: course.id,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        accessSource: 'purchase',
        course,
        progress: {
          courseId: course.id,
          completedLessonIds: [],
          lastLessonId: course.modules?.[0]?.lessons?.[0]?.id || '',
          resumeSeconds: 0,
          totalLessons: course.lessonsCount || 10,
          completedPercentage: 0,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return {
      success: true,
      order: newOrder,
      message: 'Order processed successfully.',
    };
  },

  async getOrders(): Promise<Order[]> {
    await delay();
    return JSON.parse(JSON.stringify(ordersState));
  },

  async getPayments(): Promise<Payment[]> {
    await delay();
    return JSON.parse(JSON.stringify(paymentsState));
  },

  async getNotifications(): Promise<AppNotification[]> {
    await delay();
    return JSON.parse(JSON.stringify(notificationsState));
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await delay(50);
    const n = notificationsState.find((item) => item.id === id);
    if (n) n.isRead = true;
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await delay(50);
    notificationsState.forEach((item) => (item.isRead = true));
  },

  // ==========================================
  // ADMIN & CREATOR SERVICES
  // ==========================================

  async getAdminAnalytics(): Promise<Analytics> {
    await delay();
    return JSON.parse(JSON.stringify(mockAnalyticsData));
  },

  async getAllCoursesAdmin(): Promise<Course[]> {
    await delay();
    return JSON.parse(JSON.stringify(coursesState));
  },

  async getStudents(): Promise<typeof mockStudentsList> {
    await delay();
    return JSON.parse(JSON.stringify(studentsState));
  },

  async getStudentDetails(id: string): Promise<(typeof mockStudentsList)[0] | null> {
    await delay();
    const student = studentsState.find((s: { id: string }) => s.id === id);
    return student ? JSON.parse(JSON.stringify(student)) : null;
  },

  async getCoupons(): Promise<Coupon[]> {
    await delay();
    return JSON.parse(JSON.stringify(couponsState));
  },

  async createCoupon(coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>): Promise<Coupon> {
    await delay(200);
    const newCoupon: Coupon = {
      ...coupon,
      id: `cpn_${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    couponsState.unshift(newCoupon);
    return JSON.parse(JSON.stringify(newCoupon));
  },

  async toggleCouponStatus(id: string): Promise<Coupon | null> {
    await delay(100);
    const target = couponsState.find((c) => c.id === id);
    if (target) {
      target.isActive = !target.isActive;
      return JSON.parse(JSON.stringify(target));
    }
    return null;
  },

  async getAccessCodes(): Promise<AccessCode[]> {
    await delay();
    return JSON.parse(JSON.stringify(accessCodesState));
  },

  async generateAccessCodes(data: {
    courseId: string;
    count: number;
    maxUses: number;
    expiresAt: string;
    batchTag?: string;
  }): Promise<AccessCode[]> {
    await delay(300);
    const course = coursesState.find((c) => c.id === data.courseId);
    const courseTitle = course ? course.title : 'Course';
    const generated: AccessCode[] = [];

    for (let i = 0; i < data.count; i++) {
      const codePart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const codeNumber = Math.floor(1000 + Math.random() * 9000);
      const codePrefix = (course?.slug?.substring(0, 5) || 'PASS').toUpperCase();
      const code = `${codePrefix}-${codePart}-${codeNumber}`;

      const item: AccessCode = {
        id: `acc_${Date.now()}_${i}`,
        code,
        courseId: data.courseId,
        courseTitle,
        usageCount: 0,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
        isActive: true,
        batchTag: data.batchTag || 'Generated-Batch',
        createdAt: new Date().toISOString(),
      };
      generated.push(item);
      accessCodesState.unshift(item);
    }

    return JSON.parse(JSON.stringify(generated));
  },

  async toggleAccessCodeStatus(id: string): Promise<AccessCode | null> {
    await delay(100);
    const target = accessCodesState.find((c) => c.id === id);
    if (target) {
      target.isActive = !target.isActive;
      return JSON.parse(JSON.stringify(target));
    }
    return null;
  },

  /**
   * Authoritative backend verification of an admin-issued registration/invite code.
   * Checks existence, active status, expiration date, and redemption limits.
   */
  async verifyRegistrationCode(code: string): Promise<{
    valid: boolean;
    error?: string;
    codeData?: AccessCode;
  }> {
    await delay(150);
    const cleaned = (code || '').trim().toUpperCase();
    if (!cleaned) {
      return {
        valid: false,
        error: 'A valid admin-issued registration code is required to register.',
      };
    }

    const found = accessCodesState.find((c) => c.code.toUpperCase() === cleaned);
    if (!found) {
      return {
        valid: false,
        error: 'Invalid registration code. Please enter a valid admin-issued invite code.',
      };
    }

    if (!found.isActive) {
      return {
        valid: false,
        error: 'This registration code has been disabled by an administrator.',
      };
    }

    if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
      return {
        valid: false,
        error: 'This registration code has expired.',
      };
    }

    if (found.usageCount >= found.maxUses) {
      return {
        valid: false,
        error: 'This registration code has reached its maximum redemptions limit.',
      };
    }

    return {
      valid: true,
      codeData: JSON.parse(JSON.stringify(found)),
    };
  },

  /**
   * Authoritative backend recording of code redemption upon successful account creation.
   * Increments access_code usage count and appends to access_code_redemptions.
   */
  async recordAccessCodeRedemption(data: {
    codeId: string;
    code?: string;
    userId: string;
    userEmail?: string;
    courseId?: string;
  }): Promise<AccessCodeRedemption> {
    await delay(120);
    const target = accessCodesState.find((c) => c.id === data.codeId || (data.code && c.code.toUpperCase() === data.code.toUpperCase()));
    if (target) {
      target.usageCount = (target.usageCount || 0) + 1;
    }

    const redemption: AccessCodeRedemption = {
      id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      codeId: target?.id || data.codeId,
      code: target?.code || data.code,
      userId: data.userId,
      userEmail: data.userEmail,
      courseId: target?.courseId || data.courseId,
      redeemedAt: new Date().toISOString(),
    };

    accessCodeRedemptionsState.unshift(redemption);
    return JSON.parse(JSON.stringify(redemption));
  },

  async getAccessCodeRedemptions(): Promise<AccessCodeRedemption[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(accessCodeRedemptionsState));
  },

  /**
   * Simulated Edge Function response for local fallback / development without Supabase credentials.
   * Authoritatively checks the registration code before creating the user.
   */
  async registerWithCode(params: {
    name: string;
    email: string;
    password: string;
    registrationCode: string;
  }): Promise<{
    user: any;
    session: any;
    error: Error | null;
    message?: string;
    appUser?: User;
  }> {
    await delay(250);
    const verification = await this.verifyRegistrationCode(params.registrationCode);
    if (!verification.valid || !verification.codeData) {
      return {
        user: null,
        session: null,
        error: new Error(verification.error || 'Invalid registration code.'),
      };
    }

    const mockId = `usr_std_${Date.now()}`;
    const newStudentUser: User = {
      id: mockId,
      name: params.name.trim(),
      email: params.email.trim(),
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
      role: 'student',
      headline: 'Enrolled Student',
      joinedAt: new Date().toISOString(),
      enrolledCourseIds: verification.codeData.courseId ? [verification.codeData.courseId] : ['course_01'],
    };

    await this.recordAccessCodeRedemption({
      codeId: verification.codeData.id,
      code: verification.codeData.code,
      userId: mockId,
      userEmail: params.email.trim(),
      courseId: verification.codeData.courseId,
    });

    return {
      user: null,
      session: null,
      error: null,
      message: 'Student account successfully registered and verified with invite code.',
      appUser: newStudentUser,
    };
  },

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    await delay(250);
    const id = `course_${Date.now()}`;
    const slug = (courseData.title || 'new-course')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newCourse: Course = {
      id,
      title: courseData.title || 'Untitled Course',
      slug,
      shortDescription: courseData.shortDescription || 'A new curriculum awaiting modules and lessons.',
      fullDescription: courseData.fullDescription || 'Detailed syllabus and course overview.',
      thumbnailUrl: courseData.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      price: courseData.price ?? 199,
      currency: courseData.currency || 'USD',
      status: courseData.status || 'draft',
      instructor: {
        id: 'usr_admin_01',
        name: 'Elena Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
        title: 'Principal Systems Architect',
      },
      category: courseData.category || 'Engineering',
      level: courseData.level || 'Intermediate',
      totalDurationMinutes: 0,
      modulesCount: 0,
      lessonsCount: 0,
      enrolledStudentsCount: 0,
      rating: 5.0,
      reviewsCount: 0,
      updatedAt: new Date().toISOString(),
      modules: [],
    };

    coursesState.unshift(newCourse);
    return JSON.parse(JSON.stringify(newCourse));
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    await delay(200);
    const index = coursesState.findIndex((c) => c.id === id);
    if (index === -1) return null;

    coursesState[index] = {
      ...coursesState[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return JSON.parse(JSON.stringify(coursesState[index]));
  },

  async createModule(courseId: string, title: string, description?: string): Promise<Course | null> {
    await delay(150);
    const course = coursesState.find((c) => c.id === courseId);
    if (!course) return null;
    if (!course.modules) course.modules = [];

    course.modules.push({
      id: `mod_${Date.now()}`,
      courseId,
      title,
      description,
      order: course.modules.length + 1,
      lessons: [],
    });
    course.modulesCount = course.modules.length;
    course.updatedAt = new Date().toISOString();

    return JSON.parse(JSON.stringify(course));
  },

  async createLesson(courseId: string, moduleId: string, lessonData: Partial<Lesson>): Promise<Course | null> {
    await delay(150);
    const course = coursesState.find((c) => c.id === courseId);
    if (!course || !course.modules) return null;
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return null;

    const newLesson: Lesson = {
      id: `les_${Date.now()}`,
      moduleId,
      courseId,
      title: lessonData.title || 'Untitled Lesson',
      description: lessonData.description,
      order: mod.lessons.length + 1,
      durationMinutes: lessonData.durationMinutes || 15,
      isFreePreview: !!lessonData.isFreePreview,
      video: {
        id: `vid_${Date.now()}`,
        title: lessonData.title || 'Lesson Video',
        durationSeconds: (lessonData.durationMinutes || 15) * 60,
        isProcessed: true,
        resolution: '1080p',
        watermarkText: 'STUDENT PROTECTED STREAM',
      },
    };

    mod.lessons.push(newLesson);
    course.lessonsCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    course.totalDurationMinutes = course.modules.reduce(
      (sum, m) => sum + m.lessons.reduce((lSum, l) => lSum + l.durationMinutes, 0),
      0
    );
    course.updatedAt = new Date().toISOString();

    return JSON.parse(JSON.stringify(course));
  },

  async reorderModules(courseId: string, moduleIds: string[]): Promise<Course | null> {
    await delay(150);
    const course = coursesState.find((c) => c.id === courseId);
    if (!course || !course.modules) return null;

    const modMap = new Map(course.modules.map((m) => [m.id, m]));
    const reordered: typeof course.modules = [];
    moduleIds.forEach((id, index) => {
      const mod = modMap.get(id);
      if (mod) {
        mod.order = index + 1;
        reordered.push(mod);
      }
    });

    course.modules = reordered;
    course.updatedAt = new Date().toISOString();
    return JSON.parse(JSON.stringify(course));
  },

  /**
   * Authenticates user against backend/mock database during fallback.
   * Derives role strictly from the user profile.
   */
  async authenticateUser(
    email: string,
    password?: string
  ): Promise<{ user: User | null; error: string | null }> {
    await delay(180);
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { user: null, error: 'Email and password are required.' };
    }

    if (cleanEmail === 'alyaimran089@gmail.com' || cleanEmail === mockCurrentUserAdmin.email.toLowerCase()) {
      const adminUser: User = {
        ...JSON.parse(JSON.stringify(mockCurrentUserAdmin)),
        email: cleanEmail,
        role: 'ADMIN',
        status: 'ACTIVE',
      };
      return { user: adminUser, error: null };
    }
    if (cleanEmail === mockCurrentUserStudent.email.toLowerCase()) {
      return { user: JSON.parse(JSON.stringify(mockCurrentUserStudent)), error: null };
    }

    const foundStudent = studentsState.find((s: any) => s.email.toLowerCase() === cleanEmail);
    if (foundStudent) {
      const studentUser: User = {
        id: foundStudent.id,
        name: foundStudent.name,
        email: foundStudent.email,
        avatarUrl: foundStudent.avatarUrl,
        role: 'student',
        headline: 'Enrolled Student',
        joinedAt: foundStudent.joinedAt,
        enrolledCourseIds: ['course_01'],
      };
      return { user: studentUser, error: null };
    }

    return { user: null, error: 'Invalid email or password. Please verify your credentials.' };
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(50);
    return null;
  },

  async getEnrollments(): Promise<Enrollment[]> {
    await delay();
    return JSON.parse(JSON.stringify(enrollmentsState));
  },

  async enrollStudent(courseId: string, studentEmail?: string): Promise<Enrollment> {
    await delay(150);
    const course = coursesState.find((c) => c.id === courseId);
    const newEnrollment: Enrollment = {
      id: `enr_${Date.now()}`,
      studentId: mockCurrentUserStudent.id,
      userId: mockCurrentUserStudent.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      accessSource: 'admin_grant',
      course,
      progress: {
        courseId,
        completedLessonIds: [],
        lastLessonId: course?.modules?.[0]?.lessons?.[0]?.id || '',
        resumeSeconds: 0,
        totalLessons: course?.lessonsCount || 10,
        completedPercentage: 0,
        updatedAt: new Date().toISOString(),
      },
    };
    enrollmentsState.unshift(newEnrollment);
    return JSON.parse(JSON.stringify(newEnrollment));
  },

  async deleteCourse(id: string): Promise<boolean> {
    await delay(150);
    coursesState = coursesState.filter((c) => c.id !== id);
    return true;
  },

  async deleteCoupon(id: string): Promise<boolean> {
    await delay(100);
    couponsState = couponsState.filter((c) => c.id !== id);
    return true;
  },

  async deleteAccessCode(id: string): Promise<boolean> {
    await delay(100);
    accessCodesState = accessCodesState.filter((c) => c.id !== id);
    return true;
  },

  async createAccessCode(codeData: {
    code: string;
    courseId: string;
    courseTitle: string;
    isActive: boolean;
    expiresAt: string;
  }): Promise<AccessCode> {
    await delay(150);
    const newCode: AccessCode = {
      id: `acc_${Date.now()}`,
      code: codeData.code,
      courseId: codeData.courseId,
      courseTitle: codeData.courseTitle,
      usageCount: 0,
      maxUses: 1,
      expiresAt: codeData.expiresAt,
      isActive: codeData.isActive,
      createdAt: new Date().toISOString(),
    };
    accessCodesState.unshift(newCode);
    return JSON.parse(JSON.stringify(newCode));
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    await delay();
    return {
      totalRevenue: 28450,
      totalStudents: 1420,
      totalWatchTimeHours: mockAnalyticsData.totalWatchTimeHours,
      averageCompletionRate: mockAnalyticsData.averageCompletionRatePercent,
      dailyWatchTime: [
        { label: 'Mon', hours: 42 },
        { label: 'Tue', hours: 58 },
        { label: 'Wed', hours: 75 },
        { label: 'Thu', hours: 64 },
        { label: 'Fri', hours: 82 },
        { label: 'Sat', hours: 95 },
        { label: 'Sun', hours: 88 },
      ],
      dropOffPoints: mockAnalyticsData.dropOffPoints.map((d) => ({
        time: `${d.minuteMark}:00`,
        retention: 100 - d.dropPercentage,
      })),
      countryBreakdown: mockAnalyticsData.countryDistribution.map((c) => ({
        country: c.country,
        percentage: c.percentage,
        students: c.activeStudents,
      })),
      topLessons: mockAnalyticsData.mostWatchedLessons.map((l) => ({
        lessonId: l.lessonId,
        lessonTitle: l.lessonTitle,
        courseTitle: l.courseTitle,
        views: l.watchCount,
        completionRate: l.averageWatchPercentage,
        dropOffRate: 100 - l.averageWatchPercentage,
      })),
    };
  },
};
