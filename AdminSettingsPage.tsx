import React, { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { Input, Select } from '../../components/common/FormFields';

export const AdminSettingsPage: React.FC = () => {
  const [platformName, setPlatformName] = useState('Creator Hub Private Learning');
  const [supportEmail, setSupportEmail] = useState('support@creatorhub.internal');
  const [watermarkOpacity, setWatermarkOpacity] = useState('0.15');
  const [includeUserEmail, setIncludeUserEmail] = useState(true);
  const [includeIpAddress, setIncludeIpAddress] = useState(true);
  const [watermarkInterval, setWatermarkInterval] = useState('45');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div className="text-xs text-[#9A9DA6] font-mono mb-1">
          Platform Configuration
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Admin & Security Controls</h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          Configure anti-piracy video watermark overlays, platform identity, and compliance preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Anti-Piracy Video Protection (Frontend DRM controls) */}
        <div className="bg-[#16181D] p-6 sm:p-7 border border-[rgba(242,241,237,0.08)] space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(242,241,237,0.08)]">
            <Shield className="w-4 h-4 text-[#4C63D2]" />
            <div>
              <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">
                Dynamic Video Forensic Watermarking
              </h3>
              <p className="text-[11px] text-[#9A9DA6]">
                Anti-rip floating forensic overlay rendered client-side on player stream
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 border border-[rgba(242,241,237,0.08)] bg-[#0E0F12]">
              <div>
                <span className="text-xs font-medium text-[#F2F1ED]">
                  Embed Viewer Email in Stream
                </span>
                <p className="text-[11px] text-[#9A9DA6]">
                  Displays authenticated student&apos;s email floating randomly across playback canvas
                </p>
              </div>
              <input
                type="checkbox"
                checked={includeUserEmail}
                onChange={(e) => setIncludeUserEmail(e.target.checked)}
                className="w-4 h-4 accent-[#4C63D2] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 border border-[rgba(242,241,237,0.08)] bg-[#0E0F12]">
              <div>
                <span className="text-xs font-medium text-[#F2F1ED]">
                  Embed IP & Timestamp Fingerprint
                </span>
                <p className="text-[11px] text-[#9A9DA6]">
                  Adds client socket IP and cryptographic token to deter screen recorders
                </p>
              </div>
              <input
                type="checkbox"
                checked={includeIpAddress}
                onChange={(e) => setIncludeIpAddress(e.target.checked)}
                className="w-4 h-4 accent-[#4C63D2] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Select
                id="watermark-opacity-select"
                label="Watermark Overlay Opacity"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(e.target.value)}
                options={[
                  { value: '0.08', label: '8% (Subtle / Ghost)' },
                  { value: '0.15', label: '15% (Recommended)' },
                  { value: '0.25', label: '25% (High Visibility)' },
                ]}
              />

              <Input
                id="watermark-interval-input"
                label="Position Jitter Interval (Seconds)"
                type="number"
                value={watermarkInterval}
                onChange={(e) => setWatermarkInterval(e.target.value)}
                placeholder="45"
              />
            </div>
          </div>
        </div>

        {/* General Branding */}
        <div className="bg-[#16181D] p-6 sm:p-7 border border-[rgba(242,241,237,0.08)] space-y-4">
          <h3 className="font-serif text-sm font-normal text-[#F2F1ED] border-b border-[rgba(242,241,237,0.08)] pb-2">
            Platform Identity & Support
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="settings-platform-name"
              label="Platform Display Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              required
            />

            <Input
              id="settings-support-email"
              label="Support / Escalation Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[2.5]" /> Platform preferences persisted.
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
