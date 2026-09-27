import React, { useState, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import { Order } from '../../types';
import { apiService } from '../../services/api';
import { Table, Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  useEffect(() => {
    apiService.getOrders().then((data) => {
      setOrders(data);
      setIsLoading(false);
    });
  }, []);

  const handleExport = (order: Order) => {
    setDownloadedId(order.id);
    setTimeout(() => setDownloadedId(null), 2000);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.studentName || o.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.studentEmail || o.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      o.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Order>[] = [
    {
      header: 'Receipt #',
      accessorKey: 'orderNumber',
      cell: (order) => (
        <span className="font-mono text-xs text-[#F2F1ED]">{order.orderNumber}</span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'studentName',
      cell: (order) => (
        <div>
          <div className="font-serif text-xs text-[#F2F1ED]">{order.studentName || order.userName}</div>
          <div className="text-[11px] text-[#9A9DA6] font-mono">{order.studentEmail || order.userEmail}</div>
        </div>
      ),
    },
    {
      header: 'Curriculum',
      accessorKey: 'courseTitle',
      cell: (order) => (
        <span className="font-serif text-xs text-[#F2F1ED] max-w-[200px] truncate block">
          {order.courseTitle}
        </span>
      ),
    },
    {
      header: 'Payment Rail',
      accessorKey: 'paymentMethod',
      cell: (order) => <span className="text-xs text-[#9A9DA6]">{order.paymentMethod}</span>,
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
              -{formatCurrency(order.discountAmount, order.currency)} ({order.couponCode})
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (order) => (
        <Badge variant={order.status === 'completed' ? 'success' : 'warning'}>{order.status}</Badge>
      ),
    },
    {
      header: 'Invoice',
      cell: (order) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleExport(order)}
            className="p-1.5 border border-[rgba(242,241,237,0.08)] hover:border-[rgba(242,241,237,0.25)] text-[#9A9DA6] hover:text-[#F2F1ED] bg-[#16181D] transition-colors cursor-pointer"
            title="Download PDF Invoice"
          >
            {downloadedId === order.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(242,241,237,0.08)]">
        <div>
          <div className="text-xs text-[#9A9DA6] font-mono mb-1">
            Financial Ledger
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#F2F1ED] tracking-tight">Orders & Invoices</h1>
          <p className="text-xs text-[#9A9DA6] mt-1">
            Audit customer payments, applied coupons, receipts, and access code allocations.
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <SearchInput
          id="orders-search"
          value={search}
          onChange={setSearch}
          placeholder="Filter by receipt #, name, or email..."
        />
      </div>

      <Table
        id="admin-orders-table"
        columns={columns}
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />
    </div>
  );
};
