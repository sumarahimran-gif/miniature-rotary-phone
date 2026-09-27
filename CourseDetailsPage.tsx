import React from 'react';
import {
  Clock,
  BookOpen,
  Star,
  Users,
  Check,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { Course, Lesson } from '../../types';
import { formatCurrency, formatDurationMinutes } from '../../utils/formatters';
import { ModuleAccordion } from '../../components/course/ModuleAccordion';

interface CourseDetailsProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: (course: Course) => void;
  onResume: (courseId: string, lessonId?: string) => void;
  onPreviewLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsProps> = ({
  course,
  isEnrolled,
  onEnroll,
  onResume,
  onPreviewLesson,
  onBack,
}) => {
  return (
    <div className="space-y-8 pb-16">
      {/* Back link */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Curriculums Catalog</span>
      </button>

      {/* Hero Banner Card */}
      <div className="bg-[#16181D] border border-[rgba(242,241,237,0.08)] p-6 sm:p-8 md:p-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 border border-[rgba(242,241,237,0.08)] text-[#9A9DA6] text-xs font-mono">
                {course.category}
              </span>
              <span className="px-2 py-0.5 border border-[rgba(242,241,237,0.08)] text-[#9A9DA6] text-xs font-mono">
                {course.level}
              </span>
              {isEnrolled && (
                <span className="px-2 py-0.5 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                  Enrolled & Active
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#F2F1ED] leading-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#9A9DA6] leading-relaxed max-w-2xl">
              {course.fullDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-[#9A9DA6]">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{course.rating.toFixed(2)}</span>
                <span className="text-[#9A9DA6]">({course.reviewsCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#9A9DA6]" />
                <span>{formatDurationMinutes(course.totalDurationMinutes)} total runtime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#9A9DA6]" />
                <span>{course.lessonsCount} sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#9A9DA6]" />
                <span>{course.enrolledStudentsCount} members enrolled</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 pt-4 border-t border-[rgba(242,241,237,0.08)]">
              <img
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 object-cover border border-[rgba(242,241,237,0.08)]"
              />
              <div>
                <div className="text-xs font-medium text-[#F2F1ED]">{course.instructor.name}</div>
                <div className="text-[11px] text-[#9A9DA6]">{course.instructor.title}</div>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Card */}
          <div className="bg-[#0E0F12] p-6 border border-[rgba(242,241,237,0.08)] flex flex-col justify-between space-y-5">
            <div className="relative aspect-16/9 overflow-hidden bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale-[10%]"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[#9A9DA6] font-mono">Seat Access</span>
              <div className="font-mono text-2xl font-medium text-[#F2F1ED]">
                {formatCurrency(course.price, course.currency)}
              </div>
              <p className="text-[11px] text-[#9A9DA6]">
                Includes future curriculum updates and reference repositories
              </p>
            </div>

            {isEnrolled ? (
              <button
                id="course-start-learning-button"
                onClick={() => onResume(course.id)}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center"
              >
                Enter Learning Room
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  id="course-enroll-now-button"
                  onClick={() => onEnroll(course)}
                  className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center"
                >
                  Enroll in Curriculum
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9A9DA6]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4C63D2]" />
                  <span>Verified session token & immediate access</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Outcomes & Prerequisites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Outcomes */}
        {course.learningOutcomes && (
          <div className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)] space-y-4">
            <h3 className="font-serif text-base font-normal text-[#F2F1ED]">
              Core Competencies & Objectives
            </h3>
            <ul className="space-y-2.5">
              {course.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#9A9DA6] leading-relaxed">
                  <div className="w-4 h-4 bg-[#4C63D2]/15 text-[#4C63D2] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequisites */}
        {course.prerequisites && (
          <div className="p-6 bg-[#16181D] border border-[rgba(242,241,237,0.08)] space-y-4">
            <h3 className="font-serif text-base font-normal text-[#F2F1ED]">
              Required Foundation
            </h3>
            <ul className="space-y-2.5">
              {course.prerequisites.map((pre, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#9A9DA6] leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-[#4C63D2] shrink-0 mt-2" />
                  <span>{pre}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Curriculum Syllabus Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(242,241,237,0.08)]">
          <div>
            <h3 className="font-serif text-lg font-normal text-[#F2F1ED]">Curriculum Syllabus</h3>
            <p className="text-xs text-[#9A9DA6] mt-0.5">
              {course.modules?.length || 0} modules · {course.lessonsCount} sessions · Click preview sessions to inspect
            </p>
          </div>
        </div>

        {course.modules && (
          <ModuleAccordion
            modules={course.modules}
            onSelectLesson={(lesson) => {
              if (isEnrolled || lesson.isFreePreview) {
                onPreviewLesson(lesson);
              }
            }}
            allowPreviewsOnly={!isEnrolled}
          />
        )}
      </div>
    </div>
  );
};
