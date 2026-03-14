'use client';

import { cn } from '@/lib/utils';
import { ModuleStatus } from '@/lib/store';
import { Check, AlertTriangle, X, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: ModuleStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  complete: {
    icon: Check,
    label: '완료',
    bgColor: 'bg-[#2ECC71]',
    textColor: 'text-[#0F1923]',
  },
  warning: {
    icon: AlertTriangle,
    label: '주의',
    bgColor: 'bg-[#F39C12]',
    textColor: 'text-[#0F1923]',
  },
  error: {
    icon: X,
    label: '필요',
    bgColor: 'bg-[#E74C3C]',
    textColor: 'text-white',
  },
  pending: {
    icon: Circle,
    label: '미확인',
    bgColor: 'bg-[#2A3A4A]',
    textColor: 'text-[#A0B0C0]',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizeConfig = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StatusBadge({ status, showLabel = true, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeConfig[size]
      )}
    >
      <Icon className={iconSizeConfig[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
