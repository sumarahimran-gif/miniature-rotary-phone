import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Course, Enrollment } from '../../types';
import { apiService } from '../../services/api';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/FormFields';
import { formatDate } from '../../utils/formatters';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Manual Enroll Modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    Promise.all([
      apiService.getStudents(),
      apiService.getCourses(),
      apiService.getEnrollments(),
    ]).then(([sData, cData, eData]) => {
      setStudents(sData);
      setCourses(cData);
      setEnrollments(eData);
      if (cData.length > 0) setSelectedCourseId(cData[0].id);
      setIsLoading(false);
    });
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    await apiService.enrollStudent(selectedCourseId);
    setShowEnrollModal(false);
    const updated = await apiService.getEnrollments();
    setEnrollments(updated);
  };

  const columns: Column<any>[] = [
    {
      header: 'Student',
      accessorKey: 'name',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 object-cover border border-[rgba(242,241,237,0.08)] bg-[#0E0F12] shrink-0"
          />
          <div>
            <div className="font-serif text-xs text-[#F2F1ED]">{user.name}</div>
            <div className="text-[11px] text-[#9A9DA6] font-mono">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Headline / Role',
      accessorKey: 'headline',
      cell: (user) => (
        <span className="text-xs text-[#9A9DA6] line-clamp-1">{user.headline || 'Engineer'}</span>
      ),
    },
    {
      header: 'Joined Date',
      accessorKey: 'joinedAt',
      cell: (user) => <span className="text-xs text-[#9A9DA6] font-mono">{formatDate(user.joinedAt)}</span>,
    },
    {
      header: 'Enrolled Programs',
      cell: (user) => {
        const studentEnrollments = enrollments.filter(
          (e) => e.studentId === user.id || e.userId === user.id
        );
        return (
          <div className="space-y-0.5">
            <span className="font-mono text-xs text-[#F2F1ED]">
              {studentEnrollments.length} Programs
            </span>
            <div className="text-[11px] text-[#9A9DA6] font-serif truncate max-w-xs">
              {studentEnrollments.map((e) => e.course?.title.split('&')[0]).join(', ')}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: () => <Badge variant="success">Active Member</Badge>,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            Cohort Directory
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Enrolled Students</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Browse verified member profiles, track completion milestones, and manually provision seats.
          </p>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Provision Seat</span>
        </button>
      </div>

      <div className="max-w-md">
        <SearchInput
          id="students-search"
          value={search}
          onChange={setSearch}
          placeholder="Filter by student name or email..."
        />
      </div>

      <Table
        id="admin-students-table"
        columns={columns}
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      {/* Manual Seat Provisioning Modal */}
      {showEnrollModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEnrollModal(false)}
          title="Manual Seat Provisioning"
          maxWidth="md"
        >
          <form onSubmit={handleManualEnroll} className="space-y-4">
            <p className="text-xs text-[#9A9DA6] leading-relaxed">
              Grant immediate lifetime access to a student without requiring a payment transaction.
            </p>

            <Input
              id="provision-student-email"
              label="Student Email Address"
              type="email"
              value={selectedStudentEmail}
              onChange={(e) => setSelectedStudentEmail(e.target.value)}
              placeholder="engineer@company.com"
              required
            />

            <Select
              id="provision-course-select"
              label="Curriculum Program"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
              required
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(242,241,237,0.08)]">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="px-3.5 py-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] border border-[rgba(242,241,237,0.08)] bg-[#16181D] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] cursor-pointer"
              >
                Provision Seat
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
