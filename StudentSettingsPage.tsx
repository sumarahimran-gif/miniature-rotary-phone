import React, { useState } from 'react';
import { Play, Bell, Check } from 'lucide-react';
import { Select } from '../../components/common/FormFields';

export const StudentSettingsPage: React.FC = () => {
  const [autoplay, setAutoplay] = useState(true);
  const [defaultSpeed, setDefaultSpeed] = useState('1');
  const [defaultQuality, setDefaultQuality] = useState('1080p');
  const [emailDigest, setEmailDigest] = useState(true);
  const [newLessonAlerts, setNewLessonAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div className="text-xs text-[#9A9DA6] font-mono mb-1">
          Preferences & Environment
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Student Settings</h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          Configure video streaming bitrate, playback parameters, and notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Playback Preferences */}
        <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(242,241,237,0.08)]">
            <Play className="w-4 h-4 text-[#4C63D2]" />
            <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Streaming & Playback</h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-medium text-[#F2F1ED]">Auto-advance to next session</div>
              <div className="text-[11px] text-[#9A9DA6]">
                Automatically advance when a video lecture concludes
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
              className="w-4 h-4 accent-[#4C63D2] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Select
              id="pref-speed"
              label="Default Playback Rate"
              value={defaultSpeed}
              onChange={(e) => setDefaultSpeed(e.target.value)}
              options={[
                { value: '1', label: '1.0x Normal' },
                { value: '1.25', label: '1.25x' },
                { value: '1.5', label: '1.5x' },
                { value: '2', label: '2.0x' },
              ]}
            />

            <Select
              id="pref-quality"
              label="Default Stream Resolution"
              value={defaultQuality}
              onChange={(e) => setDefaultQuality(e.target.value)}
              options={[
                { value: 'auto', label: 'Auto (Bandwidth Adaptive)' },
                { value: '1080p', label: '1080p HD' },
                { value: '720p', label: '720p' },
              ]}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(242,241,237,0.08)]">
            <Bell className="w-4 h-4 text-[#4C63D2]" />
            <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Notification Rules</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[rgba(242,241,237,0.08)]">
              <div>
                <div className="text-xs font-medium text-[#F2F1ED]">New Session Publications</div>
                <div className="text-[11px] text-[#9A9DA6]">
                  Receive alerts when instructor publishes syllabus expansions
                </div>
              </div>
              <input
                type="checkbox"
                checked={newLessonAlerts}
                onChange={(e) => setNewLessonAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#4C63D2] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-xs font-medium text-[#F2F1ED]">Weekly Progress Digest</div>
                <div className="text-[11px] text-[#9A9DA6]">
                  Summary of watch time and completed modules
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 accent-[#4C63D2] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[2.5]" /> Preferences saved.
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-4 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
