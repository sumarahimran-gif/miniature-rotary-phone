import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Tag,
  ChevronLeft,
  Building,
  Lock,
} from 'lucide-react';
import { Course, Order } from '../../types';
import { Input } from '../../components/common/FormFields';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

interface CheckoutPageProps {
  course: Course;
  onBack: () => void;
  onPaymentComplete: (order: Order) => void;
  onPaymentFail: (errorMessage: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  course,
  onBack,
  onPaymentComplete,
  onPaymentFail,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const finalTotal = Math.max(0, course.price - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponFeedback(null);

    const res = await apiService.applyCoupon(couponCode, course.id);
    setIsApplyingCoupon(false);
    setCouponFeedback(res);
    if (res.success) {
      setDiscountAmount(res.discountAmount);
      setAppliedCoupon(couponCode.toUpperCase());
    } else {
      setDiscountAmount(0);
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (simulateFailure) {
      setTimeout(() => {
        setIsSubmitting(false);
        onPaymentFail('Card was declined by issuing bank (Simulated Test Scenario: 0002 Decline)');
      }, 500);
      return;
    }

    try {
      const methodLabel =
        paymentMethod === 'card'
          ? `Credit Card (${cardNumber.slice(-4)})`
          : paymentMethod === 'wire'
          ? 'Corporate Invoice / Wire'
          : 'PayPal Account';

      const res = await apiService.processCheckout({
        courseId: course.id,
        couponCode: appliedCoupon || undefined,
        paymentMethod: methodLabel,
      });

      if (res.success && res.order) {
        onPaymentComplete(res.order);
      } else {
        onPaymentFail(res.message);
      }
    } catch {
      onPaymentFail('Connection timeout with mock gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 pb-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Curriculum Details</span>
      </button>

      <div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Checkout & Access Provisioning</h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          Complete enrollment to immediately provision curriculum authorization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Method */}
        <div className="lg:col-span-7 bg-[#16181D] p-6 sm:p-7 border border-[rgba(242,241,237,0.08)] space-y-6">
          <div>
            <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Payment Routing</h3>
            <p className="text-xs text-[#9A9DA6] mt-0.5">Frontend prototype mock billing interface</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-[#4C63D2] bg-[#1C2028] text-[#F2F1ED]'
                  : 'border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] text-[#9A9DA6]'
              }`}
            >
              <CreditCard className="w-5 h-5 text-[#4C63D2]" />
              <span className="text-xs font-medium">Credit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('wire')}
              className={`p-3 border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                paymentMethod === 'wire'
                  ? 'border-[#4C63D2] bg-[#1C2028] text-[#F2F1ED]'
                  : 'border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] text-[#9A9DA6]'
              }`}
            >
              <Building className="w-5 h-5 text-[#4C63D2]" />
              <span className="text-xs font-medium">Corporate PO</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('paypal')}
              className={`p-3 border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                paymentMethod === 'paypal'
                  ? 'border-[#4C63D2] bg-[#1C2028] text-[#F2F1ED]'
                  : 'border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] text-[#9A9DA6]'
              }`}
            >
              <Lock className="w-5 h-5 text-[#4C63D2]" />
              <span className="text-xs font-medium">PayPal</span>
            </button>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4 pt-2">
            {paymentMethod === 'card' && (
              <>
                <Input
                  id="checkout-card-num"
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  placeholder="4242 4242 4242 4242"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="checkout-card-exp"
                    label="Expiration"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                  <Input
                    id="checkout-card-cvc"
                    label="CVC / Security Code"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
              </>
            )}

            {paymentMethod === 'wire' && (
              <div className="p-4 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-xs text-[#9A9DA6] space-y-1.5">
                <div className="font-medium text-[#F2F1ED]">Corporate PO & Wire Instructions:</div>
                <p>
                  An authorized company purchase order invoice will be dispatched to your email with net-30 payment routing credentials.
                </p>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="p-4 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-xs text-[#9A9DA6] space-y-1.5">
                <div className="font-medium text-[#F2F1ED]">PayPal Authorization:</div>
                <p>
                  You will be securely routed through PayPal sandbox upon placing order.
                </p>
              </div>
            )}

            {/* Test Toggle to simulate Payment Failure */}
            <div className="p-3 bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-[#F2F1ED]">Simulate Payment Failure</span>
                <p className="text-[11px] text-[#9A9DA6]">Toggle on to verify decline handling flow</p>
              </div>
              <input
                type="checkbox"
                id="simulate-payment-failure-toggle"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </div>

            <button
              id="place-order-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors cursor-pointer text-center"
            >
              {isSubmitting ? (
                <span>Communicating with gateway...</span>
              ) : (
                <span>
                  Confirm & Authorize ({formatCurrency(finalTotal, course.currency)})
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-[#9A9DA6] pt-2 border-t border-[rgba(242,241,237,0.08)]">
            <ShieldCheck className="w-4 h-4 text-[#4C63D2]" />
            <span>256-bit TLS encrypted transmission · Zero raw credentials stored</span>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-[#16181D] p-6 border border-[rgba(242,241,237,0.08)] space-y-5">
          <h3 className="font-serif text-sm font-normal text-[#F2F1ED]">Order Summary</h3>

          {/* Item details */}
          <div className="flex items-start gap-3 pb-4 border-b border-[rgba(242,241,237,0.08)]">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              referrerPolicy="no-referrer"
              className="w-16 h-12 object-cover bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-serif text-xs font-normal text-[#F2F1ED] leading-snug line-clamp-2">
                {course.title}
              </h4>
              <p className="text-[11px] text-[#9A9DA6] mt-0.5 font-mono">
                {course.lessonsCount} sessions · Lifetime Access
              </p>
            </div>
            <div className="text-xs font-mono text-[#F2F1ED] shrink-0">
              {formatCurrency(course.price, course.currency)}
            </div>
          </div>

          {/* Coupon Input */}
          <div className="space-y-2">
            <label className="text-xs text-[#9A9DA6]">Coupon Code</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9A9DA6]" />
                <input
                  type="text"
                  id="checkout-coupon-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LAUNCH50"
                  className="w-full pl-8 pr-3 py-1.5 text-xs uppercase bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] text-[#F2F1ED] focus:outline-none focus:border-[#4C63D2] font-mono"
                />
              </div>
              <button
                type="button"
                id="apply-coupon-button"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="px-3 py-1.5 text-xs text-[#F2F1ED] bg-[#16181D] border border-[rgba(242,241,237,0.12)] hover:border-[rgba(242,241,237,0.25)] transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isApplyingCoupon ? '...' : 'Apply'}
              </button>
            </div>

            {couponFeedback && (
              <p
                className={`text-xs ${
                  couponFeedback.success ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {couponFeedback.message}
              </p>
            )}

            <div className="text-[11px] text-[#9A9DA6] pt-0.5">
              Available promo codes: <code className="text-[#4C63D2] font-mono">LAUNCH50</code>,{' '}
              <code className="text-[#4C63D2] font-mono">SPRING20</code>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-2 pt-3 border-t border-[rgba(242,241,237,0.08)] text-xs">
            <div className="flex justify-between text-[#9A9DA6]">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(course.price, course.currency)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Discount ({appliedCoupon})</span>
                <span className="font-mono">-{formatCurrency(discountAmount, course.currency)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#9A9DA6]">
              <span>Estimated Tax (0%)</span>
              <span className="font-mono">$0.00</span>
            </div>

            <div className="flex justify-between text-xs text-[#F2F1ED] pt-2 border-t border-[rgba(242,241,237,0.08)]">
              <span>Total Due</span>
              <span className="font-mono text-sm text-[#4C63D2] font-medium">
                {formatCurrency(finalTotal, course.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
