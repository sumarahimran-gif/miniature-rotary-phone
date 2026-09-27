import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Course } from '../../types';
import { apiService } from '../../services/api';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/Modal';
import { formatCurrency, formatDurationMinutes } from '../../utils/formatters';

interface AdminCoursesProps {
  onNavigate: (view: string, payload?: unknown) => void;
  onEditCourse: (course: Course) => void;
}

export const AdminCoursesPage: React.FC<AdminCoursesProps> = ({ onNavigate, onEditCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    apiService.getCourses().then((data) => {
      setCourses(data);
      setIsLoading(false);
    });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    await apiService.deleteCourse(courseToDelete.id);
    setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
    setCourseToDelete(null);
  };

  const columns: Column<Course>[] = [
    {
      header: 'Curriculum',
      accessorKey: 'title',
      cell: (course) => (
        <div className="flex items-center gap-3">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            referrerPolicy="no-referrer"
            className="w-12 h-8 object-cover bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] shrink-0"
          />
          <div>
            <div className="font-serif text-xs text-[#F2F1ED] line-clamp-1">{course.title}</div>
            <div className="text-[11px] text-[#9A9DA6]">
              {course.category} · {course.level}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Seat Price',
      accessorKey: 'price',
      cell: (course) => (
        <span className="font-mono text-xs text-[#F2F1ED]">
          {formatCurrency(course.price, course.currency)}
        </span>
      ),
    },
    {
      header: 'Curriculum Scope',
      accessorKey: 'lessonsCount',
      cell: (course) => (
        <span className="text-xs text-[#9A9DA6]">
          {course.modules?.length || 0} modules · {course.lessonsCount} sessions ({formatDurationMinutes(course.totalDurationMinutes)})
        </span>
      ),
    },
    {
      header: 'Enrolled',
      accessorKey: 'enrolledStudentsCount',
      cell: (course) => (
        <span className="font-mono text-xs text-[#F2F1ED]">
          {course.enrolledStudentsCount}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (course) => (
        <Badge variant={course.status === 'published' ? 'success' : 'default'}>
          {course.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (course) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEditCourse(course)}
            className="p-1.5 border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.25)] text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] transition-colors cursor-pointer"
            title="Edit Curriculum"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCourseToDelete(course)}
            className="p-1.5 border border-[rgba(242,241,237,0.08)] hover:border-rose-500/40 text-[#9A9DA6] hover:text-rose-400 bg-[#16181D] transition-colors cursor-pointer"
            title="Delete Curriculum"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            Curriculum Inventory
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Curriculums & Programs</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Build, publish, and maintain structured engineering masterclasses and module trees.
          </p>
        </div>

        <button
          id="admin-create-course-btn"
          onClick={() => onNavigate('admin_create_course')}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Curriculum</span>
        </button>
      </div>

      <Table
        id="admin-courses-table"
        columns={columns}
        data={courses}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      {courseToDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Course Curriculum"
          message={`Are you sure you want to delete "${courseToDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete Program"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onClose={() => setCourseToDelete(null)}
        />
      )}
    </div>
  );
};
