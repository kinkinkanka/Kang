'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ModuleInfo } from '@/lib/store';
import { StatusBadge } from './status-badge';
import { ChevronRight } from 'lucide-react';

interface ModuleCardProps {
  module: ModuleInfo;
  isActive?: boolean;
}

export function ModuleCard({ module, isActive = false }: ModuleCardProps) {
  const isCompleted = module.status === 'complete';

  return (
    <Link href={module.path}>
      <div
        className={cn(
          'module-card relative rounded-xl bg-[#1A2733] p-4 border-2 cursor-pointer',
          isActive
            ? 'border-[#F5A623] active'
            : isCompleted
            ? 'border-transparent completed'
            : 'border-transparent hover:border-[#2A3A4A]'
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono-numeric text-2xl font-bold text-[#F5A623]">
              {module.id}
            </span>
            <span className="text-white font-medium">{module.name}</span>
          </div>
          <StatusBadge status={module.status} size="sm" />
        </div>

        <p className="text-[#A0B0C0] text-sm mb-3">{module.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">{module.summary}</span>
          <ChevronRight className="h-5 w-5 text-[#A0B0C0]" />
        </div>
      </div>
    </Link>
  );
}
