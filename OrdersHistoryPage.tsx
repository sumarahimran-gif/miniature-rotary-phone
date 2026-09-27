import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Order } from '../../types';
import { apiService } from '../../services/api';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const OrdersHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiService.getOrders().then((data) => {
      setOrders(data);
      setIsLoading(false);
    });
  }, []);

  const columns: Column<Order>[] = [
    {
      header: 'Receipt #',
      accessorKey: 'orderNumber',
      cell: (order) => (
        <span className="font-mono text-xs text-[#F2F1ED]">{order.orderNumber}</span>
      ),
    },
    {
      header: 'Curriculum',
      accessorKey: 'courseTitle',
      cell: (order) => (
        <div>
          <div className="font-serif text-xs text-[#F2F1ED] line-clamp-1">{order.courseTitle}</div>
          <div className="text-[11px] text-[#9A9DA6]">{order.paymentMethod}</div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: (order) => <span className="text-xs text-[#9A9DA6] font-mono">{formatDate(order.createdAt)}</span>,
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: (order) => (
        <div>
          <div className="font-mono text-xs text-[#F2F1ED]">
            {formatCurrency(order.total, order.currency)}
          </div>
          {order.discountAmount > 0 && (
            <div className="text-[10px] text-emerald-400 font-mono">
              Saved {formatCurrency(order.discountAmount, order.currency)} ({order.couponCode})
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (order) => {
        const variant =
          order.status === 'completed'
            ? 'success'
            : order.status === 'pending'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant}>{order.status}</Badge>;
      },
    },
    {
      header: 'Invoice',
      cell: (order) => (
        <button
          onClick={() => {}}
          className="p-1.5 border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.2)] text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] transition-colors inline-flex items-center gap-1 text-xs cursor-pointer"
          title="Download PDF receipt"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Receipt</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div className="text-xs text-[#9A9DA6] font-mono mb-1">
          Financial Records
        </div>
        <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Order History & Receipts</h1>
        <p className="text-xs text-[#9A9DA6] mt-1">
          Invoices and purchase records for tax reporting and employer reimbursement.
        </p>
      </div>

      <Table
        id="student-orders-table"
        columns={columns}
        data={orders}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No billing orders found for your profile."
      />
    </div>
  );
};
