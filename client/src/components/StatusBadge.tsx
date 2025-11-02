// Status Badge Component - colored badges for order/voucher status

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, ShoppingBag } from "lucide-react";

type Status = 'PAID' | 'PENDING' | 'EXPIRED' | 'USED' | 'ACTIVE' | 'CANCELLED';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  PAID: {
    label: 'Paid',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  PENDING: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  },
  EXPIRED: {
    label: 'Expired',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  },
  USED: {
    label: 'Used',
    icon: ShoppingBag,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  ACTIVE: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-3 py-1 rounded-full uppercase text-xs font-medium ${config.className} ${className}`}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
