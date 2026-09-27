import React, { useState } from 'react';
import { Building, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';

export const AdminPaymentsPage: React.FC = () => {
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const availableBalance = 14250.0;
  const pendingBalance = 2390.0;

  const handleRequestPayout = () => {
    setIsRequestingPayout(true);
    setTimeout(() => {
      setIsRequestingPayout(false);
      setPayoutSuccess(true);
      setTimeout(() => setPayoutSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div className="text-xs text-[#9A9DA6] font-mono mb-1">
          Settlement Architecture
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Payments & Settlement</h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          Review settlement balances, reserve funds, and gateway clearing rails.
        </p>
      </div>

      {/* Payout Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#16181D] text-[#F2F1ED] p-6 border border-[rgba(242,241,237,0.08)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9DA6] font-mono">Available Payout</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono border border-emerald-500/30 text-emerald-400">
              Settled
            </span>
          </div>
          <div className="font-mono text-3xl font-medium text-[#F2F1ED]">{formatCurrency(availableBalance, 'USD')}</div>
          <button
            onClick={handleRequestPayout}
            disabled={isRequestingPayout}
            className="w-full py-2 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center"
          >
            <span>{isRequestingPayout ? 'Dispatching Wire...' : 'Initiate Bank Transfer'}</span>
          </button>
          {payoutSuccess && (
            <p className="text-xs text-emerald-400 font-mono text-center flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Wire dispatched: {formatCurrency(availableBalance, 'USD')}
            </p>
          )}
        </div>

        <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)] space-y-2">
          <span className="text-xs text-[#9A9DA6] font-mono">In-Flight / Pending Clearing</span>
          <div className="font-mono text-2xl font-medium text-[#F2F1ED]">
            {formatCurrency(pendingBalance, 'USD')}
          </div>
          <p className="text-[11px] text-[#9A9DA6] pt-2">
            Settles on rolling 2-day schedule into reserve account.
          </p>
        </div>

        <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)] space-y-2">
          <span className="text-xs text-[#9A9DA6] font-mono">Lifetime Gross Volume</span>
          <div className="font-mono text-2xl font-medium text-[#F2F1ED]">$189,420.00</div>
          <p className="text-[11px] text-[#9A9DA6] pt-2">
            Processed via 256-bit TLS encrypted mock gateway interfaces.
          </p>
        </div>
      </div>

      {/* Connected Gateways Status */}
      <div className="bg-[#16181D] p-6 sm:p-8 border border-[rgba(242,241,237,0.08)] space-y-6">
        <div>
          <h3 className="font-serif text-base font-normal text-[#F2F1ED]">Configured Acquiring Rails</h3>
          <p className="text-xs text-[#9A9DA6] mt-0.5">
            Frontend representation of connected merchant acquiring facilities
          </p>
        </div>

        <div className="divide-y divide-[rgba(242,241,237,0.08)]">
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] flex items-center justify-center text-[#4C63D2] font-mono font-medium text-xs">
                S
              </div>
              <div>
                <div className="font-serif text-xs text-[#F2F1ED]">Stripe Connect Custom</div>
                <div className="text-[11px] text-[#9A9DA6]">
                  Direct card acquiring, Apple Pay & Google Pay
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Operational (Mock)</Badge>
            </div>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] flex items-center justify-center text-[#4C63D2] font-mono font-medium text-xs">
                P
              </div>
              <div>
                <div className="font-serif text-xs text-[#F2F1ED]">PayPal Commerce</div>
                <div className="text-[11px] text-[#9A9DA6]">
                  Digital wallets and regional installment methods
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Operational (Mock)</Badge>
            </div>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] flex items-center justify-center text-[#4C63D2]">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif text-xs text-[#F2F1ED]">Corporate Wire / ACH</div>
                <div className="text-[11px] text-[#9A9DA6]">
                  B2B enterprise purchase orders with net-30 terms
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Enabled</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
