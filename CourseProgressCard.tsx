import React from 'react';
import { PlayCircle, Clock, CheckCircle } from 'lucide-react';
import { Enrollment } from '../../types';
import { ProgressBar } from '../common/ProgressBar';

interface CourseProgressCardProps {
  id?: string;
  enrollment: Enrollment;
  onResume: (courseId: string, lessonId?: string) => void;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  id,
  enrollment,
  onResume,
}) => {
  const { course, progress } = enrollment;
  if (!course) return null;

  const percentage = progress?.completedPercentage ?? 0;
  const isCompleted = percentage >= 100;

  return (
    <div
      id={id || `enrolled-course-${course.id}`}
      className="flex flex-col sm:flex-row bg-[#16181D] border border-[rgba(242,241,237,0.08)] overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative sm:w-60 aspect-16/9 sm:aspect-auto bg-[#0E0F12] shrink-0 border-b sm:border-b-0 sm:border-r border-[rgba(242,241,237,0.08)]">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale-[15%] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-[#0E0F12]/40 flex items-center justify-center">
          <button
            onClick={() => onResume(course.id, progress?.lastLessonId)}
            className="w-10 h-10 bg-[#16181D]/90 border border-[rgba(242,241,237,0.12)] text-[#F2F1ED] flex items-center justify-center hover:bg-[#4C63D2] transition-colors cursor-pointer"
            aria-label="Resume course"
          >
            <PlayCircle className="w-5 h-5 text-[#F2F1ED]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-[#9A9DA6]">
            <span>{course.category}</span>
            <span aria-hidden="true" className="text-[rgba(242,241,237,0.2)]">·</span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#9A9DA6]">
                <Clock className="w-3.5 h-3.5" /> In Progress
              </span>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg font-normal text-[#F2F1ED] leading-snug">
            {course.title}
          </h3>
          <p className="text-xs text-[#9A9DA6] mt-1 line-clamp-1">{course.shortDescription}</p>
        </div>

        <div className="mt-5 pt-4 border-t border-[rgba(242,241,237,0.08)] flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between text-xs text-[#9A9DA6] mb-1.5">
              <span>Curriculum Progress</span>
              <span className="font-mono text-[#F2F1ED]">{percentage}%</span>
            </div>
            <ProgressBar value={percentage} variant={isCompleted ? 'emerald' : 'primary'} size="sm" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#9A9DA6]">
              {progress?.completedLessonIds?.length || 0} of {course.lessonsCount} sessions completed
            </span>
            <button
              id={`resume-btn-${course.id}`}
              onClick={() => onResume(course.id, progress?.lastLessonId)}
              className="px-4 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
            >
              {percentage > 0 ? 'Resume Lesson' : 'Begin Learning'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
