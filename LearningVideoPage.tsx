import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { Course, Lesson, CourseProgress } from '../../types';
import { VideoPlayerPlaceholder } from '../../components/course/VideoPlayerPlaceholder';
import { ModuleAccordion } from '../../components/course/ModuleAccordion';
import { ProgressBar } from '../../components/common/ProgressBar';

interface LearningVideoPageProps {
  course: Course;
  currentLesson: Lesson;
  progress: CourseProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onToggleLessonCompletion: (lessonId: string, completed: boolean) => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNextLesson: boolean;
  hasPrevLesson: boolean;
  onBackToCourse: () => void;
  onProgressUpdate: (seconds: number) => void;
}

export const LearningVideoPage: React.FC<LearningVideoPageProps> = ({
  course,
  currentLesson,
  progress,
  onSelectLesson,
  onToggleLessonCompletion,
  onNextLesson,
  onPrevLesson,
  hasNextLesson,
  hasPrevLesson,
  onBackToCourse,
  onProgressUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'discussion'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isCompleted = progress.completedLessonIds.includes(currentLesson.id);

  return (
    <div className="flex flex-col min-h-screen bg-[#0E0F12] text-[#F2F1ED]">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-[rgba(242,241,237,0.08)] bg-[#0E0F12] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="learning-back-button"
            onClick={onBackToCourse}
            className="flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors p-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Curriculum</span>
          </button>
          <div className="h-4 w-px bg-[rgba(242,241,237,0.08)] hidden sm:block" />
          <div className="truncate">
            <h1 className="font-serif text-sm font-normal text-[#F2F1ED] truncate max-w-md">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Course Progress Mini Display */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2.5">
            <span className="text-xs text-[#9A9DA6]">
              {progress.completedLessonIds.length} of {course.lessonsCount} sessions
            </span>
            <div className="w-24">
              <ProgressBar value={progress.completedPercentage} size="xs" variant="primary" />
            </div>
            <span className="text-xs font-mono text-[#F2F1ED]">
              {progress.completedPercentage}%
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.08)] px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{sidebarOpen ? 'Hide Syllabus' : 'Show Syllabus'}</span>
          </button>
        </div>
      </header>

      {/* Main Learning Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Player & Notes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* The Video Player Component */}
            <VideoPlayerPlaceholder
              id="active-lesson-video"
              lesson={currentLesson}
              courseTitle={course.title}
              playbackToken={`auth_session_${currentLesson.id}_${Date.now()}`}
              resumeSeconds={progress.resumeSeconds}
              isCompleted={isCompleted}
              onToggleComplete={() => onToggleLessonCompletion(currentLesson.id, !isCompleted)}
              onNextLesson={onNextLesson}
              onPrevLesson={onPrevLesson}
              hasNextLesson={hasNextLesson}
              hasPrevLesson={hasPrevLesson}
              onProgressUpdate={onProgressUpdate}
            />

            {/* Navigation & Completion Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* One deliberate moment: lesson-complete checkmark filling in */}
                <button
                  id="toggle-complete-lesson"
                  onClick={() => onToggleLessonCompletion(currentLesson.id, !isCompleted)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors cursor-pointer border ${
                    isCompleted
                      ? 'bg-[#1C2028] border-[#4C63D2]/40 text-[#F2F1ED]'
                      : 'bg-[#16181D] border-[rgba(242,241,237,0.12)] text-[#9A9DA6] hover:border-[rgba(242,241,237,0.25)] hover:text-[#F2F1ED]'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <div className="w-4 h-4 bg-[#4C63D2] flex items-center justify-center lesson-check-animated">
                        <svg
                          className="w-3 h-3 text-[#F2F1ED]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" className="lesson-check-stroke" />
                        </svg>
                      </div>
                      <span className="font-medium text-[#F2F1ED]">Completed</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border border-[rgba(242,241,237,0.25)] bg-transparent" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>

                <span className="text-xs text-[#9A9DA6] font-mono">
                  {currentLesson.durationMinutes} min runtime
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  id="learning-prev-lesson"
                  onClick={onPrevLesson}
                  disabled={!hasPrevLesson}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.08)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  id="learning-next-lesson"
                  onClick={onNextLesson}
                  disabled={!hasNextLesson}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lesson Details Tabs */}
            <div className="bg-[#16181D] border border-[rgba(242,241,237,0.08)]">
              <div className="flex items-center gap-6 px-6 border-b border-[rgba(242,241,237,0.08)] text-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-[#4C63D2] text-[#F2F1ED] font-medium'
                      : 'border-transparent text-[#9A9DA6] hover:text-[#F2F1ED]'
                  }`}
                >
                  Session Overview
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'resources'
                      ? 'border-[#4C63D2] text-[#F2F1ED] font-medium'
                      : 'border-transparent text-[#9A9DA6] hover:text-[#F2F1ED]'
                  }`}
                >
                  <span>Code & Resources</span>
                  {currentLesson.attachments && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-[#0E0F12] text-[#9A9DA6] border border-[rgba(242,241,237,0.08)]">
                      {currentLesson.attachments.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'discussion'
                      ? 'border-[#4C63D2] text-[#F2F1ED] font-medium'
                      : 'border-transparent text-[#9A9DA6] hover:text-[#F2F1ED]'
                  }`}
                >
                  Cohort Discussion
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-normal text-[#F2F1ED]">{currentLesson.title}</h3>
                    <p className="text-xs sm:text-sm text-[#9A9DA6] leading-relaxed">
                      {currentLesson.description ||
                        'In this session, we examine distributed synchronization models, state consensus properties, and network boundary conditions.'}
                    </p>

                    <div className="p-4 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-xs text-[#9A9DA6] space-y-1.5">
                      <div className="font-medium text-[#F2F1ED]">
                        Core Takeaway
                      </div>
                      <p className="leading-relaxed">
                        Stateless processes decouple throughput from node instance memory limits. Always isolate idempotent mutations before crossing network boundaries.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#9A9DA6]">
                      Companion downloads for this session:
                    </p>
                    {currentLesson.attachments && currentLesson.attachments.length > 0 ? (
                      currentLesson.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#16181D] text-[#4C63D2]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs text-[#F2F1ED]">{file.name}</div>
                              <div className="text-[11px] text-[#9A9DA6] font-mono">
                                {file.type} · {file.size}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {}}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-[#9A9DA6]" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-xs text-[#9A9DA6]">
                        No downloadable attachments attached to this lesson.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'discussion' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex items-center justify-center font-mono text-[10px] text-[#F2F1ED]">
                            MK
                          </span>
                          <span className="font-medium text-[#F2F1ED]">Michael K. (Cohort Member)</span>
                        </div>
                        <span className="text-[10px] text-[#9A9DA6] font-mono">2 days ago</span>
                      </div>
                      <p className="text-[#9A9DA6] leading-relaxed">
                        Did you test this with sub-millisecond edge replicas? How does clock drift affect your idempotency token validity?
                      </p>
                    </div>

                    <div className="p-3 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)]">
                      <textarea
                        rows={2}
                        placeholder="Post a query to the private cohort..."
                        className="w-full bg-transparent text-xs text-[#F2F1ED] placeholder:text-[#9A9DA6]/50 focus:outline-none resize-none"
                      />
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          className="px-3.5 py-1.5 bg-[#4C63D2] hover:bg-[#4055BA] text-[#F2F1ED] text-xs font-medium transition-colors cursor-pointer"
                        >
                          Submit Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Syllabus Drawer */}
        {sidebarOpen && (
          <aside className="w-80 lg:w-96 border-l border-[rgba(242,241,237,0.08)] bg-[#0E0F12] overflow-y-auto p-4 shrink-0 flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(242,241,237,0.08)]">
              <h3 className="text-xs font-medium text-[#9A9DA6]">
                Course Syllabus
              </h3>
              <span className="text-xs font-mono text-[#9A9DA6]">
                {course.lessonsCount} Sessions
              </span>
            </div>

            {course.modules && (
              <ModuleAccordion
                id="learning-syllabus-accordion"
                modules={course.modules}
                currentLessonId={currentLesson.id}
                completedLessonIds={progress.completedLessonIds}
                onSelectLesson={onSelectLesson}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
