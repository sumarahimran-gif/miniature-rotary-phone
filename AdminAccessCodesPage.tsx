import React, { useState, useEffect } from 'react';
import { PlusCircle, Copy, Check } from 'lucide-react';
import { AccessCode, Course } from '../../types';
import { apiService } from '../../services/api';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/FormFields';
import { formatDate } from '../../utils/formatters';

export const AdminAccessCodesPage: React.FC = () => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [generationType, setGenerationType] = useState<'single' | 'batch'>('single');
  const [batchCount, setBatchCount] = useState('5');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [clientLabel, setClientLabel] = useState('');

  useEffect(() => {
    Promise.all([apiService.getAccessCodes(), apiService.getCourses()]).then(
      ([codeList, courseList]) => {
        setCodes(codeList);
        setCourses(courseList);
        if (courseList.length > 0) setSelectedCourseId(courseList[0].id);
        setIsLoading(false);
      }
    );
  }, []);

  const handleCopy = (c: string) => {
    navigator.clipboard?.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = generationType === 'single' ? 1 : parseInt(batchCount, 10) || 5;

    const newCodes: AccessCode[] = [];
    const courseObj = courses.find((c) => c.id === selectedCourseId);

    for (let i = 0; i < count; i++) {
      const codeStr = `${clientLabel ? clientLabel.toUpperCase().replace(/\s+/g, '-') : 'VIP'}-${Math.floor(
        1000 + Math.random() * 9000
      )}-${Math.floor(1000 + Math.random() * 9000)}`;

      const created = await apiService.createAccessCode({
        code: codeStr,
        courseId: selectedCourseId,
        courseTitle: courseObj?.title || 'Course Access',
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      });
      newCodes.push(created);
    }

    setCodes([...newCodes, ...codes]);
    setShowGenerateModal(false);
    setClientLabel('');
  };

  const columns: Column<AccessCode>[] = [
    {
      header: 'Access Code',
      accessorKey: 'code',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#F2F1ED] bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] px-2 py-0.5">
            {item.code}
          </span>
          <button
            onClick={() => handleCopy(item.code)}
            className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
            title="Copy access token"
          >
            {copiedCode === item.code ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
    },
    {
      header: 'Curriculum',
      accessorKey: 'courseTitle',
      cell: (item) => (
        <span className="font-serif text-xs text-[#F2F1ED] max-w-[220px] truncate block">
          {item.courseTitle}
        </span>
      ),
    },
    {
      header: 'Redemption Status',
      cell: (item) =>
        item.isRedeemed ? (
          <div>
            <Badge variant="default">Redeemed</Badge>
            <div className="text-[10px] text-[#9A9DA6] font-mono mt-0.5">{item.redeemedByEmail}</div>
          </div>
        ) : (
          <Badge variant="success">Available</Badge>
        ),
    },
    {
      header: 'Expires',
      accessorKey: 'expiresAt',
      cell: (item) => (
        <span className="text-xs text-[#9A9DA6] font-mono">
          {item.expiresAt ? formatDate(item.expiresAt) : 'Never'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (item) => <span className="text-xs text-[#9A9DA6] font-mono">{formatDate(item.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            License Provisioning
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Access Codes</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Issue and audit cryptographically unique voucher tokens for corporate B2B cohorts.
          </p>
        </div>

        <button
          id="generate-codes-btn"
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Generate Codes</span>
        </button>
      </div>

      <Table
        id="admin-access-codes-table"
        columns={columns}
        data={codes}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      {showGenerateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowGenerateModal(false)}
          title="Generate Course Access Codes"
          maxWidth="md"
        >
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)]">
              <button
                type="button"
                onClick={() => setGenerationType('single')}
                className={`py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  generationType === 'single' ? 'bg-[#16181D] text-[#F2F1ED]' : 'text-[#9A9DA6]'
                }`}
              >
                Single Code
              </button>
              <button
                type="button"
                onClick={() => setGenerationType('batch')}
                className={`py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  generationType === 'batch' ? 'bg-[#16181D] text-[#F2F1ED]' : 'text-[#9A9DA6]'
                }`}
              >
                Batch (Corporate Cohort)
              </button>
            </div>

            {generationType === 'batch' && (
              <Input
                id="batch-count"
                label="Number of Codes to Issue"
                type="number"
                value={batchCount}
                onChange={(e) => setBatchCount(e.target.value)}
                placeholder="5"
                required
              />
            )}

            <Select
              id="code-course-select"
              label="Assigned Curriculum"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
              required
            />

            <Input
              id="code-client-label"
              label="Client / Cohort Identifier (Optional prefix)"
              value={clientLabel}
              onChange={(e) => setClientLabel(e.target.value)}
              placeholder="e.g. STRIPE-ENG or ACME-CORP"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(242,241,237,0.08)]">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-3.5 py-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] border border-[rgba(242,241,237,0.08)] bg-[#16181D] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] cursor-pointer"
              >
                Issue Codes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
