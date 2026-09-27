import React from 'react';
import { Clock, BookOpen, Star } from 'lucide-react';
import { Course } from '../../types';
import { formatCurrency, formatDurationMinutes } from '../../utils/formatters';

interface CourseCardProps {
  id?: string;
  course: Course;
  onSelect: (course: Course) => void;
  isEnrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  course,
  onSelect,
  isEnrolled = false,
}) => {
  return (
    <div
      id={id || `course-card-${course.id}`}
      onClick={() => onSelect(course)}
      className="group flex flex-col bg-[#16181D] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] transition-colors cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-16/9 w-full bg-[#0E0F12] overflow-hidden border-b border-[rgba(242,241,237,0.08)]">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale-[15%] contrast-[1.05] group-hover:scale-102 transition-transform duration-300"
        />

        {/* Unboxed category & level indicators */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-sans font-medium bg-[#0E0F12]/90 text-[#F2F1ED] border border-[rgba(242,241,237,0.08)]">
            {course.category}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-sans font-medium bg-[#0E0F12]/90 text-[#9A9DA6] border border-[rgba(242,241,237,0.08)]">
            {course.level}
          </span>
        </div>

        {isEnrolled && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 text-[11px] font-medium bg-[#16181D] text-emerald-400 border border-emerald-500/30">
            Enrolled
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-base font-normal text-[#F2F1ED] group-hover:text-[#4C63D2] transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>
          <p className="text-xs text-[#9A9DA6] mt-2 line-clamp-2 leading-relaxed">
            {course.shortDescription}
          </p>
        </div>

        {/* Metadata stats */}
        <div className="pt-4 mt-4 border-t border-[rgba(242,241,237,0.08)] flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-[#9A9DA6]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#9A9DA6]" />
                {formatDurationMinutes(course.totalDurationMinutes)}
              </span>
              <span aria-hidden="true" className="text-[rgba(242,241,237,0.2)]">·</span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#9A9DA6]" />
                {course.lessonsCount} lessons
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{course.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Pricing & Instructor footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <img
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 object-cover border border-[rgba(242,241,237,0.08)]"
              />
              <span className="text-xs text-[#9A9DA6] truncate max-w-[130px]">
                {course.instructor.name}
              </span>
            </div>

            <div className="text-right">
              {isEnrolled ? (
                <span className="text-xs font-medium text-emerald-400">Enrolled</span>
              ) : (
                <span className="font-mono text-sm font-medium text-[#F2F1ED]">
                  {formatCurrency(course.price, course.currency)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
