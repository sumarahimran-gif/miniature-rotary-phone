import React from 'react';
import { PlayCircle, BookOpen } from 'lucide-react';
import { Course, Enrollment, User as UserType } from '../../types';
import { CourseProgressCard } from '../../components/course/CourseProgressCard';
import { CourseCard } from '../../components/course/CourseCard';

interface StudentDashboardProps {
  user: UserType | null;
  enrollments: Enrollment[];
  catalogCourses: Course[];
  onNavigate: (view: string, payload?: unknown) => void;
  onResumeLesson: (courseId: string, lessonId?: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardProps> = ({
  user,
  enrollments,
  catalogCourses,
  onNavigate,
  onResumeLesson,
}) => {
  const activeEnrollment = enrollments[0];
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const suggestedCourses = catalogCourses.filter((c) => !enrolledCourseIds.has(c.id)).slice(0, 3);

  const totalLessonsDone = enrollments.reduce(
    (sum, e) => sum + (e.progress?.completedLessonIds?.length || 0),
    0
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Panel */}
      <div className="bg-[#16181D] border border-[rgba(242,241,237,0.08)] p-6 sm:p-8 text-[#F2F1ED]">
        <div className="max-w-2xl">
          <div className="text-xs text-[#9A9DA6] mb-2 font-mono">
            Enrolled Cohort Member
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#F2F1ED]">
            Welcome back, {user?.name || 'Student'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#9A9DA6] leading-relaxed">
            {totalLessonsDone} sessions completed across {enrollments.length} enrolled curriculums.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {activeEnrollment && (
              <button
                id="dashboard-resume-hero"
                onClick={() => onResumeLesson(activeEnrollment.courseId, activeEnrollment.progress?.lastLessonId)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4C63D2] hover:bg-[#4055BA] text-[#F2F1ED] text-xs font-medium transition-colors cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Resume: {activeEnrollment.course?.title.split('&')[0]}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('student_browse')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] text-[#9A9DA6] hover:text-[#F2F1ED] text-xs font-medium transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(242,241,237,0.08)]">
          <div>
            <h2 className="font-serif text-lg font-normal text-[#F2F1ED]">Active Programs</h2>
            <p className="text-xs text-[#9A9DA6] mt-0.5">Resume your recent video lectures</p>
          </div>
          <button
            onClick={() => onNavigate('student_my_courses')}
            className="text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
          >
            All Programs ({enrollments.length})
          </button>
        </div>

        <div className="space-y-3">
          {enrollments.map((enr) => (
            <CourseProgressCard
              key={enr.id}
              enrollment={enr}
              onResume={onResumeLesson}
            />
          ))}
        </div>
      </div>

      {/* Suggested Curriculums */}
      {suggestedCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(242,241,237,0.08)]">
            <div>
              <h2 className="font-serif text-lg font-normal text-[#F2F1ED]">Available Curriculums</h2>
              <p className="text-xs text-[#9A9DA6] mt-0.5">Deepen technical specialization</p>
            </div>
            <button
              onClick={() => onNavigate('student_browse')}
              className="text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
            >
              View Full Catalog
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={() => onNavigate('student_course_details', { courseId: course.id })}
                isEnrolled={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
