import React, { useState } from 'react';
import { User as UserType, Enrollment } from '../../types';
import { BookOpen, Check, Award } from 'lucide-react';
import { Input, Textarea } from '../../components/common/FormFields';
import { formatDate } from '../../utils/formatters';

interface StudentProfileProps {
  user: UserType | null;
  enrollments: Enrollment[];
}

export const StudentProfilePage: React.FC<StudentProfileProps> = ({ user, enrollments }) => {
  const [name, setName] = useState(user?.name || 'Student');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const totalLessonsDone = enrollments.reduce(
    (sum, e) => sum + (e.progress?.completedLessonIds?.length || 0),
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div className="text-xs text-[#9A9DA6] font-mono mb-1">
          Identity & Credentials
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Student Profile</h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          Account authorization and cohort enrollment verification.
        </p>
      </div>

      {/* Header Info Banner */}
      <div className="bg-[#16181D] p-6 sm:p-8 border border-[rgba(242,241,237,0.08)] flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {user?.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 object-cover border border-[rgba(242,241,237,0.08)] shrink-0 grayscale-[10%]"
          />
        )}

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="font-serif text-xl font-normal text-[#F2F1ED]">{user?.name}</h2>
            <span className="px-2 py-0.5 text-[11px] border border-[rgba(242,241,237,0.08)] text-[#4C63D2] font-mono">
              Verified Student
            </span>
          </div>

          <p className="text-xs text-[#9A9DA6] font-medium">{user?.headline}</p>
          <p className="text-xs text-[#9A9DA6] max-w-xl">{user?.bio}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-[#9A9DA6]">
            <span>Member since {user?.joinedAt ? formatDate(user.joinedAt) : 'Recent'}</span>
            <span aria-hidden="true" className="text-[rgba(242,241,237,0.2)]">·</span>
            <span className="font-mono">{user?.timezone || 'UTC'}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0E0F12] text-[#4C63D2]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#9A9DA6]">Enrolled Curriculums</span>
              <div className="font-mono text-xl font-medium text-[#F2F1ED]">{enrollments.length}</div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0E0F12] text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#9A9DA6]">Completed Sessions</span>
              <div className="font-mono text-xl font-medium text-[#F2F1ED]">{totalLessonsDone}</div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0E0F12] text-[#4C63D2]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#9A9DA6]">Certificates Earned</span>
              <div className="font-mono text-xl font-medium text-[#F2F1ED]">
                {enrollments.filter((e) => (e.progress?.completedPercentage || 0) >= 100).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-[#16181D] p-6 sm:p-8 border border-[rgba(242,241,237,0.08)] space-y-6">
        <h3 className="font-serif text-base font-normal text-[#F2F1ED]">Edit Profile Information</h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="profile-name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="profile-email"
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Managed by organization identity provider."
            />
          </div>

          <Input
            id="profile-headline"
            label="Professional Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Staff Distributed Systems Engineer"
          />

          <Textarea
            id="profile-bio"
            label="Background"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Technical focus areas and cohort context..."
          />

          <div className="flex items-center justify-between pt-2">
            {isSaved && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[2.5]" /> Profile changes recorded.
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
