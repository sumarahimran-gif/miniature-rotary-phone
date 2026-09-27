import React, { useState, useMemo } from 'react';
import { Course } from '../../types';
import { CourseCard } from '../../components/course/CourseCard';
import { SearchInput } from '../../components/common/SearchInput';
import { FilterPills } from '../../components/common/Filters';
import { EmptyState } from '../../components/common/EmptyState';
import { BookOpen } from 'lucide-react';

interface BrowseCoursesProps {
  courses: Course[];
  enrolledCourseIds: Set<string>;
  onSelectCourse: (course: Course) => void;
}

export const BrowseCoursesPage: React.FC<BrowseCoursesProps> = ({
  courses,
  enrolledCourseIds,
  onSelectCourse,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.category));
    return [
      { value: 'All', label: 'All Domains' },
      ...Array.from(set).map((cat) => ({ value: cat, label: cat })),
    ];
  }, [courses]);

  const levels = [
    { value: 'All', label: 'All Levels' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.shortDescription.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || c.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, search, selectedCategory, selectedLevel]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="text-xs text-[#9A9DA6] font-mono mb-1">
          Engineering Curriculum
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Browse Curriculums</h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          In-depth technical programs with verified access authorization.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#16181D] p-4 border border-[rgba(242,241,237,0.08)] space-y-3.5">
        <div className="max-w-md">
          <SearchInput
            id="browse-search"
            value={search}
            onChange={setSearch}
            placeholder="Filter by keyword, topic, or architecture..."
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(242,241,237,0.08)]">
          <FilterPills
            id="category-filters"
            label="Domain"
            options={categories}
            selectedValue={selectedCategory}
            onChange={setSelectedCategory}
          />

          <FilterPills
            id="level-filters"
            label="Level"
            options={levels}
            selectedValue={selectedLevel}
            onChange={setSelectedLevel}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses matched your filters"
          description="Try clearing your search query or switching to 'All Domains' to discover available programs."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
            setSelectedLevel('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
              isEnrolled={enrolledCourseIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
