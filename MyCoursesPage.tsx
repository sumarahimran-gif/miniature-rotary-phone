import React, { useState } from 'react';
import { Enrollment } from '../../types';
import { CourseProgressCard } from '../../components/course/CourseProgressCard';
import { EmptyState } from '../../components/common/EmptyState';
import { FilterPills } from '../../components/common/Filters';
import { BookOpen } from 'lucide-react';

interface MyCoursesPageProps {
  enrollments: Enrollment[];
  onResumeLesson: (courseId: string, lessonId?: string) => void;
  onBrowseCourses: () => void;
}

export const MyCoursesPage: React.FC<MyCoursesPageProps> = ({
  enrollments,
  onResumeLesson,
  onBrowseCourses,
}) => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filterOptions = [
    { value: 'all', label: `All (${enrollments.length})` },
    {
      value: 'in_progress',
      label: `In Progress (${
        enrollments.filter((e) => (e.progress?.completedPercentage || 0) < 100).length
      })`,
    },
    {
      value: 'completed',
      label: `Completed (${
        enrollments.filter((e) => (e.progress?.completedPercentage || 0) >= 100).length
      })`,
    },
  ];

  const filtered = enrollments.filter((e) => {
    const pct = e.progress?.completedPercentage || 0;
    if (filter === 'in_progress') return pct < 100;
    if (filter === 'completed') return pct >= 100;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            Student Enrollment Record
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">My Programs</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Track module completion, review lectures, and access attached architectures.
          </p>
        </div>

        <FilterPills
          id="my-courses-filter"
          options={filterOptions}
          selectedValue={filter}
          onChange={(val) => setFilter(val as typeof filter)}
        />
      </div>

      {/* Courses list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses in this view"
          description={
            filter === 'completed'
              ? 'No completed programs yet. Select an in-progress program to continue.'
              : 'You do not have any enrolled courses matching this filter.'
          }
          actionText="Browse Curriculums"
          onAction={onBrowseCourses}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((enr) => (
            <CourseProgressCard
              key={enr.id}
              enrollment={enr}
              onResume={onResumeLesson}
            />
          ))}
        </div>
      )}
    </div>
  );
};
