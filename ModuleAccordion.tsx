import React, { useState } from 'react';
import { ChevronDown, Play, Check, Lock, FileText } from 'lucide-react';
import { Module, Lesson } from '../../types';
import { formatDurationMinutes } from '../../utils/formatters';

interface ModuleAccordionProps {
  id?: string;
  modules: Module[];
  currentLessonId?: string;
  completedLessonIds?: string[];
  onSelectLesson: (lesson: Lesson) => void;
  allowPreviewsOnly?: boolean;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  id = 'module-accordion',
  modules,
  currentLessonId,
  completedLessonIds = [],
  onSelectLesson,
  allowPreviewsOnly = false,
}) => {
  const [openModuleIds, setOpenModuleIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach((mod, idx) => {
      const hasCurrent = mod.lessons.some((l) => l.id === currentLessonId);
      initial[mod.id] = hasCurrent || idx === 0;
    });
    return initial;
  });

  const toggleModule = (modId: string) => {
    setOpenModuleIds((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  return (
    <div id={id} className="border border-[rgba(242,241,237,0.08)] bg-[#16181D]">
      {modules.map((module, modIndex) => {
        const isOpen = !!openModuleIds[module.id];
        const moduleDuration = module.lessons.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
        const moduleCompleted = module.lessons.filter((l) => completedLessonIds.includes(l.id)).length;

        return (
          <div key={module.id} id={`module-item-${module.id}`} className="border-b last:border-b-0 border-[rgba(242,241,237,0.08)]">
            {/* Module header button */}
            <button
              type="button"
              id={`module-header-${module.id}`}
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-4 text-left bg-[#16181D] hover:bg-[#1C1F26] transition-colors cursor-pointer"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center gap-2 text-xs text-[#9A9DA6] mb-1">
                  <span>Part {modIndex + 1}</span>
                  <span aria-hidden="true" className="text-[rgba(242,241,237,0.2)]">·</span>
                  <span>
                    {module.lessons.length} sessions ({formatDurationMinutes(moduleDuration)})
                  </span>
                  {moduleCompleted > 0 && (
                    <>
                      <span aria-hidden="true" className="text-[rgba(242,241,237,0.2)]">·</span>
                      <span className="text-[#4C63D2] font-mono">
                        {moduleCompleted}/{module.lessons.length} completed
                      </span>
                    </>
                  )}
                </div>
                <h4 className="font-serif text-sm font-normal text-[#F2F1ED]">{module.title}</h4>
              </div>

              <div className="p-1 text-[#9A9DA6]">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Lessons list */}
            {isOpen && (
              <div className="divide-y divide-[rgba(242,241,237,0.08)] bg-[#111317]">
                {module.lessons.map((lesson, lessonIdx) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isLocked = allowPreviewsOnly && !lesson.isFreePreview;

                  return (
                    <div
                      key={lesson.id}
                      id={`lesson-item-${lesson.id}`}
                      onClick={() => {
                        if (!isLocked) onSelectLesson(lesson);
                      }}
                      className={`flex items-center justify-between p-3.5 sm:px-5 transition-colors ${
                        isCurrent
                          ? 'bg-[#16181D] border-l-2 border-[#4C63D2] text-[#F2F1ED]'
                          : isLocked
                          ? 'opacity-50 cursor-not-allowed text-[#9A9DA6]'
                          : 'hover:bg-[#16181D] cursor-pointer text-[#9A9DA6] hover:text-[#F2F1ED]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div className="shrink-0">
                          {isCompleted ? (
                            <div className="w-4 h-4 rounded-xs bg-[#4C63D2] flex items-center justify-center lesson-check-animated text-[#F2F1ED]">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          ) : isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-[#9A9DA6]" />
                          ) : isCurrent ? (
                            <Play className="w-3.5 h-3.5 text-[#4C63D2] fill-[#4C63D2]" />
                          ) : (
                            <span className="w-4 h-4 border border-[rgba(242,241,237,0.16)] flex items-center justify-center text-[10px] text-[#9A9DA6] font-mono">
                              {lessonIdx + 1}
                            </span>
                          )}
                        </div>

                        <div className="truncate">
                          <p className="text-xs font-normal truncate">{lesson.title}</p>
                          {lesson.attachments && lesson.attachments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#9A9DA6]">
                              <FileText className="w-3 h-3" /> {lesson.attachments.length} attachment
                              {lesson.attachments.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lesson.isFreePreview && (
                          <span className="text-[10px] font-medium text-[#4C63D2] px-1.5 py-0.5 border border-[#4C63D2]/30">
                            Preview
                          </span>
                        )}
                        <span className="text-xs text-[#9A9DA6] font-mono">
                          {lesson.durationMinutes}m
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
