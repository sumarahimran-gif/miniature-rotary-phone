import React, { useState } from 'react';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Upload,
  Video,
  Check,
} from 'lucide-react';
import { Course, CourseModule, Lesson } from '../../types';
import { Input, Textarea, Select } from '../../components/common/FormFields';
import { apiService } from '../../services/api';
import { Modal } from '../../components/common/Modal';

interface CourseEditorProps {
  initialCourse?: Course | null;
  onSave: (course: Course) => void;
  onCancel: () => void;
}

export const CourseEditorPage: React.FC<CourseEditorProps> = ({
  initialCourse,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(initialCourse);

  // Form State
  const [title, setTitle] = useState(initialCourse?.title || '');
  const [shortDescription, setShortDescription] = useState(initialCourse?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialCourse?.fullDescription || '');
  const [price, setPrice] = useState(initialCourse?.price ? String(initialCourse.price) : '249');
  const [category, setCategory] = useState(initialCourse?.category || 'Cloud Architecture');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>(
    initialCourse?.level || 'Intermediate'
  );
  const [isPublished, setIsPublished] = useState(
    initialCourse?.status ? initialCourse.status === 'published' : true
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialCourse?.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'
  );

  const courseId = initialCourse?.id || 'new-course';

  // Modules & Lessons State
  const [modules, setModules] = useState<CourseModule[]>(
    initialCourse?.modules || [
      {
        id: `mod-${Date.now()}-1`,
        courseId,
        title: 'Module 1: Architectural Fundamentals',
        order: 1,
        lessons: [
          {
            id: `les-${Date.now()}-1`,
            moduleId: `mod-${Date.now()}-1`,
            courseId,
            title: '1.1 System Boundaries & Topology',
            durationMinutes: 18,
            order: 1,
            isFreePreview: true,
            description: 'Core concepts of stateless distributed designs.',
          },
        ],
      },
    ]
  );

  // Modal for editing/uploading lesson video
  const [activeEditingLesson, setActiveEditingLesson] = useState<{
    moduleId: string;
    lesson: Lesson;
  } | null>(null);

  // Mock Upload state
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handlers for modules
  const handleAddModule = () => {
    const newMod: CourseModule = {
      id: `mod-${Date.now()}`,
      courseId,
      title: `Module ${modules.length + 1}: New Section`,
      order: modules.length + 1,
      lessons: [],
    };
    setModules([...modules, newMod]);
  };

  const handleRemoveModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const handleUpdateModuleTitle = (moduleId: string, newTitle: string) => {
    setModules(
      modules.map((m) => (m.id === moduleId ? { ...m, title: newTitle } : m))
    );
  };

  const handleMoveModule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;
    const copy = [...modules];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setModules(copy.map((m, i) => ({ ...m, order: i + 1 })));
  };

  // Handlers for lessons
  const handleAddLesson = (moduleId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        const newLesson: Lesson = {
          id: `les-${Date.now()}`,
          moduleId,
          courseId,
          title: `Lesson ${m.lessons.length + 1}: Untitled Session`,
          durationMinutes: 15,
          order: m.lessons.length + 1,
          isFreePreview: false,
          description: '',
        };
        return { ...m, lessons: [...m.lessons, newLesson] };
      })
    );
  };

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.filter((l: Lesson) => l.id !== lessonId),
        };
      })
    );
  };

  const handleSaveLessonModal = () => {
    if (!activeEditingLesson) return;
    const { moduleId, lesson } = activeEditingLesson;

    setModules(
      modules.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l: Lesson) => (l.id === lesson.id ? lesson : l)),
        };
      })
    );
    setActiveEditingLesson(null);
  };

  // Simulated Video Asset Upload
  const handleSimulateVideoUpload = () => {
    setIsUploadingVideo(true);
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingVideo(false);
          if (activeEditingLesson) {
            setActiveEditingLesson({
              ...activeEditingLesson,
              lesson: {
                ...activeEditingLesson.lesson,
                videoAssetId: `asset_enc_${Date.now()}`,
              },
            });
          }
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Save the entire course
  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalMinutes = modules.reduce(
      (sum, m) => sum + m.lessons.reduce((lSum: number, l: Lesson) => lSum + l.durationMinutes, 0),
      0
    );

    const payload: Partial<Course> = {
      title,
      shortDescription,
      fullDescription,
      price: parseFloat(price) || 0,
      currency: 'USD',
      category,
      level,
      status: isPublished ? 'published' : 'draft',
      isPublished,
      thumbnailUrl,
      lessonsCount: totalLessons,
      totalDurationMinutes: totalMinutes,
      modules,
      instructor: initialCourse?.instructor || {
        id: 'inst-1',
        name: 'Dr. Elena Vance',
        title: 'Principal Systems Architect',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
        bio: 'Distinguished Fellow & former infrastructure lead.',
      },
    };

    if (isEditing && initialCourse) {
      const updated = await apiService.updateCourse(initialCourse.id, payload);
      if (updated) {
        onSave(updated);
      } else {
        onSave({ ...initialCourse, ...payload } as Course);
      }
    } else {
      const created = await apiService.createCourse(payload);
      onSave(created);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.25)] text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-[#9A9DA6] font-mono mb-1">
              Curriculum Authoring
            </div>
            <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">
              {isEditing ? `Edit: ${initialCourse?.title}` : 'Create New Curriculum'}
            </h1>
            <p className="text-xs text-[#9A9DA6]">
              Configure streaming metadata, hierarchical module structures, and seat pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-medium text-[#9A9DA6] hover:text-[#F2F1ED] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] bg-[#16181D] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save-course-button"
            onClick={handleSubmitAll}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Curriculum</span>
          </button>
        </div>
      </div>

      {/* Main Course Info Form */}
      <div className="bg-[#16181D] p-6 sm:p-8 border border-[rgba(242,241,237,0.08)] space-y-6">
        <h2 className="font-serif text-base font-normal text-[#F2F1ED] border-b border-[rgba(242,241,237,0.08)] pb-3">
          Curriculum Specification
        </h2>

        <div className="space-y-4">
          <Input
            id="course-title-input"
            label="Curriculum Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Distributed Consensus & High-Scale Systems"
            required
          />

          <Input
            id="course-short-desc-input"
            label="Short Subtitle / Synopsis"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief 1-sentence synopsis for catalog cards"
            required
          />

          <Textarea
            id="course-full-desc-input"
            label="Full Overview & Syllabus Description"
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Provide exhaustive syllabus details, engineering targets, and lab expectations..."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="course-price-input"
              label="Seat Price (USD)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="249"
              required
            />

            <Select
              id="course-category-select"
              label="Domain Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Cloud Architecture', label: 'Cloud Architecture' },
                { value: 'Backend Engineering', label: 'Backend Engineering' },
                { value: 'DevOps & SRE', label: 'DevOps & SRE' },
                { value: 'Full-Stack Systems', label: 'Full-Stack Systems' },
              ]}
            />

            <Select
              id="course-level-select"
              label="Audience Level"
              value={level}
              onChange={(e) => setLevel(e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels')}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
                { value: 'All Levels', label: 'All Levels' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              id="course-thumbnail-input"
              label="Thumbnail Cover URL"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />

            <div className="flex items-center justify-between p-3 border border-[rgba(242,241,237,0.08)] bg-[#0E0F12] mt-6">
              <div>
                <span className="text-xs font-medium text-[#F2F1ED]">Publish Immediately</span>
                <p className="text-[11px] text-[#9A9DA6]">Directly index in the public course catalog</p>
              </div>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-[#4C63D2] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modules & Lessons Hierarchy Builder */}
      <div className="bg-[#16181D] p-6 sm:p-8 border border-[rgba(242,241,237,0.08)] space-y-6">
        <div className="flex items-center justify-between border-b border-[rgba(242,241,237,0.08)] pb-3">
          <div>
            <h2 className="font-serif text-base font-normal text-[#F2F1ED]">Curriculum Structure & Sessions</h2>
            <p className="text-xs text-[#9A9DA6] mt-0.5">
              Organize modules, upload DRM video streams, and toggle preview access
            </p>
          </div>
          <button
            type="button"
            id="add-module-button"
            onClick={handleAddModule}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Module</span>
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className="p-5 border border-[rgba(242,241,237,0.08)] bg-[#0E0F12] space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-mono text-[#9A9DA6]">#{modIdx + 1}</span>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => handleUpdateModuleTitle(mod.id, e.target.value)}
                    className="font-serif text-sm text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.08)] px-3 py-1.5 flex-1 max-w-md focus:outline-none focus:border-[#4C63D2]"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveModule(modIdx, 'up')}
                    disabled={modIdx === 0}
                    className="p-1.5 border border-[rgba(242,241,237,0.08)] bg-[#16181D] hover:border-[rgba(242,241,237,0.25)] text-[#9A9DA6] hover:text-[#F2F1ED] disabled:opacity-30 cursor-pointer"
                    title="Move Module Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveModule(modIdx, 'down')}
                    disabled={modIdx === modules.length - 1}
                    className="p-1.5 border border-[rgba(242,241,237,0.08)] bg-[#16181D] hover:border-[rgba(242,241,237,0.25)] text-[#9A9DA6] hover:text-[#F2F1ED] disabled:opacity-30 cursor-pointer"
                    title="Move Module Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(mod.id)}
                    className="p-1.5 border border-[rgba(242,241,237,0.08)] bg-[#16181D] hover:border-rose-500/40 text-[#9A9DA6] hover:text-rose-400 cursor-pointer"
                    title="Delete Module"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Lessons within this module */}
              <div className="space-y-2 pl-4 border-l border-[rgba(242,241,237,0.08)]">
                {mod.lessons.map((lesson: Lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 p-3 bg-[#16181D] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.18)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Video className="w-4 h-4 text-[#4C63D2] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-xs text-[#F2F1ED] truncate">
                            {lesson.title}
                          </span>
                          {lesson.isFreePreview && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono border border-emerald-500/30 text-emerald-400 shrink-0">
                              Preview
                            </span>
                          )}
                          {lesson.videoAssetId && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono border border-[rgba(242,241,237,0.08)] text-[#9A9DA6] shrink-0">
                              Encrypted HLS
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#9A9DA6] font-mono">
                          {lesson.durationMinutes} mins · {lesson.attachments?.length || 0} files
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveEditingLesson({
                            moduleId: mod.id,
                            lesson: { ...lesson },
                          })
                        }
                        className="px-2.5 py-1 border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.25)] text-[#9A9DA6] hover:text-[#F2F1ED] text-xs cursor-pointer"
                      >
                        Video & Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(mod.id, lesson.id)}
                        className="p-1 text-[#9A9DA6] hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddLesson(mod.id)}
                  className="w-full py-2 border border-dashed border-[rgba(242,241,237,0.15)] hover:border-[#4C63D2] text-[#9A9DA6] hover:text-[#F2F1ED] text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Session to {mod.title.split(':')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson Edit / Video Upload Asset Management Modal */}
      {activeEditingLesson && (
        <Modal
          isOpen={true}
          onClose={() => setActiveEditingLesson(null)}
          title={`Edit Session: ${activeEditingLesson.lesson.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <Input
              id="lesson-modal-title"
              label="Session Title"
              value={activeEditingLesson.lesson.title}
              onChange={(e) =>
                setActiveEditingLesson({
                  ...activeEditingLesson,
                  lesson: { ...activeEditingLesson.lesson, title: e.target.value },
                })
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="lesson-modal-duration"
                label="Duration (Minutes)"
                type="number"
                value={String(activeEditingLesson.lesson.durationMinutes)}
                onChange={(e) =>
                  setActiveEditingLesson({
                    ...activeEditingLesson,
                    lesson: {
                      ...activeEditingLesson.lesson,
                      durationMinutes: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                required
              />

              <div className="flex items-center justify-between p-3 border border-[rgba(242,241,237,0.08)] bg-[#0E0F12] mt-6">
                <div>
                  <span className="text-xs font-medium text-[#F2F1ED]">Free Preview</span>
                  <p className="text-[10px] text-[#9A9DA6]">Allow non-enrolled members to stream</p>
                </div>
                <input
                  type="checkbox"
                  checked={activeEditingLesson.lesson.isFreePreview}
                  onChange={(e) =>
                    setActiveEditingLesson({
                      ...activeEditingLesson,
                      lesson: {
                        ...activeEditingLesson.lesson,
                        isFreePreview: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#4C63D2] cursor-pointer"
                />
              </div>
            </div>

            <Textarea
              id="lesson-modal-desc"
              label="Session Notes & Syllabus Key Takeaways"
              rows={3}
              value={activeEditingLesson.lesson.description || ''}
              onChange={(e) =>
                setActiveEditingLesson({
                  ...activeEditingLesson,
                  lesson: { ...activeEditingLesson.lesson, description: e.target.value },
                })
              }
              placeholder="Outline architectural decisions demonstrated in this session..."
            />

            {/* Video Asset Management UI */}
            <div className="p-4 border border-[rgba(242,241,237,0.08)] bg-[#0E0F12] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#4C63D2]" />
                  <span className="text-xs font-medium text-[#F2F1ED]">
                    Encrypted HLS Stream
                  </span>
                </div>
                <span className="text-[10px] text-[#9A9DA6] font-mono">DRM Multi-Bitrate</span>
              </div>

              {activeEditingLesson.lesson.videoAssetId ? (
                <div className="p-3 bg-[#16181D] border border-[rgba(242,241,237,0.08)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    <div>
                      <div className="font-mono text-xs text-[#F2F1ED]">
                        master_hls_stream_4k_enc.m3u8
                      </div>
                      <div className="text-[10px] font-mono text-[#9A9DA6]">
                        Asset ID: {activeEditingLesson.lesson.videoAssetId} · Protected
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveEditingLesson({
                        ...activeEditingLesson,
                        lesson: {
                          ...activeEditingLesson.lesson,
                          videoAssetId: undefined,
                        },
                      })
                    }
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Replace Video
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-[rgba(242,241,237,0.15)] p-5 text-center bg-[#16181D] space-y-2">
                  <Upload className="w-5 h-5 text-[#9A9DA6] mx-auto" />
                  <div className="text-xs font-medium text-[#F2F1ED]">
                    Ingest master video asset
                  </div>
                  <p className="text-[11px] text-[#9A9DA6]">
                    Files are transcoded into adaptive multi-bitrate HLS with dynamic forensic session watermarking.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateVideoUpload}
                    disabled={isUploadingVideo}
                    className="mt-2 px-3 py-1.5 bg-[#4C63D2] hover:bg-[#4055BA] text-[#F2F1ED] text-xs font-medium cursor-pointer"
                  >
                    {isUploadingVideo
                      ? `Transcoding Stream (${uploadProgress}%)...`
                      : 'Simulate Upload Asset'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(242,241,237,0.08)]">
              <button
                type="button"
                onClick={() => setActiveEditingLesson(null)}
                className="px-3.5 py-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] border border-[rgba(242,241,237,0.08)] bg-[#16181D] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLessonModal}
                className="px-4 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] cursor-pointer"
              >
                Done Editing Session
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
