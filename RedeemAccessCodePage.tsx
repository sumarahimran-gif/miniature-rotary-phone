import React, { useState } from 'react';
import { Key, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { Input } from '../../components/common/FormFields';
import { apiService } from '../../services/api';
import { Course } from '../../types';

interface RedeemAccessCodeProps {
  onSuccessRedeem: (course: Course) => void;
  onBrowseCourses: () => void;
}

export const RedeemAccessCodePage: React.FC<RedeemAccessCodeProps> = ({
  onSuccessRedeem,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; course?: Course } | null>(
    null
  );

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await apiService.redeemAccessCode(code);
      setResult(res);
    } catch {
      setResult({
        success: false,
        message: 'Network error communicating with access verification service.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 bg-[#16181D] border border-[rgba(242,241,237,0.08)] text-[#4C63D2] flex items-center justify-center mx-auto mb-2">
          <Key className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Redeem Access Code</h1>
        <p className="text-xs text-[#9A9DA6] max-w-md mx-auto leading-relaxed">
          Enter an employer voucher, sponsorship token, or cohort pass to unlock lifetime curriculum authorization.
        </p>
      </div>

      <div className="bg-[#16181D] p-6 sm:p-8 border border-[rgba(242,241,237,0.08)] space-y-6">
        <form onSubmit={handleRedeem} className="space-y-4">
          <Input
            id="redeem-code-input"
            label="Access Voucher Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. CLOUD-PATRON-8841"
            leftIcon={<Key className="w-4 h-4" />}
            helperText="Codes are case-insensitive and format-tolerant."
            required
          />

          <button
            id="redeem-submit-button"
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] disabled:opacity-40 transition-colors cursor-pointer text-center"
          >
            {isLoading ? (
              <span>Validating with DRM server...</span>
            ) : (
              <span>Activate Curriculum Access</span>
            )}
          </button>
        </form>

        {/* Result Message */}
        {result && (
          <div
            className={`p-4 border flex items-start gap-3 ${
              result.success
                ? 'bg-[#1C2028] border-emerald-500/30 text-emerald-300'
                : 'bg-[#1C2028] border-rose-500/30 text-rose-300'
            }`}
          >
            {result.success ? (
              <div className="w-4 h-4 bg-[#4C63D2] text-[#F2F1ED] flex items-center justify-center shrink-0 mt-0.5 lesson-check-animated">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-medium">{result.message}</div>
              {result.course && (
                <div className="mt-3 pt-3 border-t border-[rgba(242,241,237,0.08)] flex items-center justify-between">
                  <span className="font-serif text-[#F2F1ED]">{result.course.title}</span>
                  <button
                    onClick={() => onSuccessRedeem(result.course!)}
                    className="px-3 py-1 bg-[#4C63D2] hover:bg-[#4055BA] text-[#F2F1ED] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Start Learning
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demo Codes */}
        <div className="pt-4 border-t border-[rgba(242,241,237,0.08)]">
          <p className="text-[11px] text-[#9A9DA6] mb-2 font-mono">
            Demo Available Codes:
          </p>
          <div className="flex flex-wrap gap-2">
            {['CLOUD-PATRON-8841', 'CORP-BULK-2026-001', 'DESIGNSYS-STUDENT-4412'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCode(c)}
                className="text-[11px] font-mono bg-[#0E0F12] hover:border-[rgba(242,241,237,0.2)] border border-[rgba(242,241,237,0.08)] text-[#9A9DA6] hover:text-[#F2F1ED] px-2.5 py-1 transition-colors cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-[#9A9DA6]">
        <ShieldCheck className="w-4 h-4 text-[#4C63D2]" />
        <span>Cryptographically verified access authorization tokens</span>
      </div>
    </div>
  );
};
