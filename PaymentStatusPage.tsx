import React from 'react';
import { Check, AlertCircle, RotateCcw, Receipt } from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PaymentStatusProps {
  status: 'success' | 'failure';
  order?: Order;
  errorMessage?: string;
  onEnterCourse: (courseId: string) => void;
  onRetryCheckout: () => void;
  onViewOrders: () => void;
}

export const PaymentStatusPage: React.FC<PaymentStatusProps> = ({
  status,
  order,
  errorMessage = 'The card issuer declined the transaction.',
  onEnterCourse,
  onRetryCheckout,
  onViewOrders,
}) => {
  if (status === 'failure') {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6">
        <div className="w-12 h-12 bg-rose-950/40 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Payment Unsuccessful</h1>
          <p className="text-xs text-[#9A9DA6] leading-relaxed">
            Your payment provider did not authorize the transaction. No charges were made.
          </p>
        </div>

        <div className="p-4 bg-[#16181D] border border-rose-500/30 text-left text-xs text-rose-300 space-y-1">
          <div className="font-medium text-[#F2F1ED]">Reason Reported by Gateway:</div>
          <div>{errorMessage}</div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            id="retry-payment-button"
            onClick={onRetryCheckout}
            className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Another Payment Method</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-12 space-y-6">
      <div className="w-12 h-12 bg-[#4C63D2] text-[#F2F1ED] flex items-center justify-center mx-auto lesson-check-animated">
        <Check className="w-6 h-6 stroke-[2.5]" />
      </div>

      <div className="text-center space-y-1">
        <div className="text-xs font-mono text-[#4C63D2]">
          Transaction Confirmed
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Enrollment Complete</h1>
        <p className="text-xs text-[#9A9DA6] max-w-sm mx-auto leading-relaxed">
          Your receipt has been issued. Lifetime access token is now activated for this account.
        </p>
      </div>

      {order && (
        <div className="bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)] space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(242,241,237,0.08)]">
            <span className="text-[#9A9DA6]">Receipt Reference</span>
            <span className="font-mono text-[#F2F1ED]">{order.orderNumber}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[rgba(242,241,237,0.08)]">
            <span className="text-[#9A9DA6]">Curriculum</span>
            <span className="font-serif text-[#F2F1ED] max-w-[220px] text-right truncate">
              {order.courseTitle}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[rgba(242,241,237,0.08)]">
            <span className="text-[#9A9DA6]">Timestamp</span>
            <span className="text-[#9A9DA6] font-mono">{formatDate(order.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[rgba(242,241,237,0.08)]">
            <span className="text-[#9A9DA6]">Payment Routing</span>
            <span className="text-[#9A9DA6]">{order.paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[#F2F1ED] font-medium">Total Paid</span>
            <span className="font-mono text-sm font-medium text-[#4C63D2]">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {order && (
          <button
            id="go-to-learning-room-button"
            onClick={() => onEnterCourse(order.courseId)}
            className="w-full sm:flex-1 py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center"
          >
            Enter Learning Room
          </button>
        )}

        <button
          onClick={onViewOrders}
          className="w-full sm:w-auto py-2.5 px-4 text-xs font-medium text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>Receipts Archive</span>
        </button>
      </div>
    </div>
  );
};
