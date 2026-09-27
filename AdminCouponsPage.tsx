import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Copy, Check } from 'lucide-react';
import { Coupon } from '../../types';
import { apiService } from '../../services/api';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input, Select } from '../../components/common/FormFields';
import { formatDate } from '../../utils/formatters';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [maxUses, setMaxUses] = useState('100');

  useEffect(() => {
    apiService.getCoupons().then((data) => {
      setCoupons(data);
      setIsLoading(false);
    });
  }, []);

  const handleCopy = (couponCode: string) => {
    navigator.clipboard?.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const newCoupon: Omit<Coupon, 'id'> = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      usageCount: 0,
      usedCount: 0,
      maxUses: parseInt(maxUses, 10) || 100,
      isActive: true,
      expiresAt: expiry,
      validUntil: expiry,
      createdAt: new Date().toISOString(),
    };

    const created = await apiService.createCoupon(newCoupon);
    setCoupons([created, ...coupons]);
    setShowCreateModal(false);
    setCode('');
  };

  const handleDelete = async (id: string) => {
    await apiService.deleteCoupon(id);
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  const columns: Column<Coupon>[] = [
    {
      header: 'Code',
      accessorKey: 'code',
      cell: (coupon) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#F2F1ED] bg-[#0E0F12] border border-[rgba(242,241,237,0.08)] px-2 py-0.5">
            {coupon.code}
          </span>
          <button
            onClick={() => handleCopy(coupon.code)}
            className="p-1 text-[#9A9DA6] hover:text-[#F2F1ED] transition-colors cursor-pointer"
            title="Copy promo code"
          >
            {copiedCode === coupon.code ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
    },
    {
      header: 'Discount',
      cell: (coupon) => (
        <span className="font-mono text-xs text-[#F2F1ED]">
          {coupon.discountType === 'percentage'
            ? `${coupon.discountValue}% OFF`
            : `$${coupon.discountValue} OFF`}
        </span>
      ),
    },
    {
      header: 'Redemptions',
      cell: (coupon) => (
        <span className="font-mono text-xs text-[#9A9DA6]">
          {coupon.usedCount} / {coupon.maxUses || '∞'}
        </span>
      ),
    },
    {
      header: 'Expires',
      accessorKey: 'validUntil',
      cell: (coupon) => (
        <span className="text-xs text-[#9A9DA6] font-mono">
          {coupon.validUntil ? formatDate(coupon.validUntil) : 'Never'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (coupon) => (
        <Badge variant={coupon.isActive ? 'success' : 'default'}>
          {coupon.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (coupon) => (
        <button
          onClick={() => handleDelete(coupon.id)}
          className="p-1.5 border border-[rgba(242,241,237,0.08)] hover:border-rose-500/40 text-[#9A9DA6] hover:text-rose-400 bg-[#16181D] transition-colors cursor-pointer"
          title="Delete Coupon"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            Promotional Engine
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Coupons & Discounts</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Issue percentage or fixed-amount discount codes for marketing campaigns.
          </p>
        </div>

        <button
          id="create-coupon-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <Table
        id="admin-coupons-table"
        columns={columns}
        data={coupons}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Create Discount Coupon"
          maxWidth="md"
        >
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <Input
              id="new-coupon-code"
              label="Coupon Code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ARCH2026"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                id="new-coupon-type"
                label="Discount Type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as typeof discountType)}
                options={[
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'fixed', label: 'Fixed Amount ($)' },
                ]}
              />

              <Input
                id="new-coupon-value"
                label="Value"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="20"
                required
              />
            </div>

            <Input
              id="new-coupon-max-uses"
              label="Maximum Redemptions"
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="100"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(242,241,237,0.08)]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 text-xs text-[#9A9DA6] hover:text-[#F2F1ED] border border-[rgba(242,241,237,0.08)] bg-[#16181D] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium text-[#F2F1ED] bg-[#4C63D2] hover:bg-[#4055BA] cursor-pointer"
              >
                Create Promo Code
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
