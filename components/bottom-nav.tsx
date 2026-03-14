'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BottomNavProps {
  prevHref?: string;
  nextHref?: string;
  prevLabel?: string;
  nextLabel?: string;
  currentStep?: number;
  totalSteps?: number;
}

export function BottomNav({
  prevHref,
  nextHref,
  prevLabel = '이전',
  nextLabel = '다음',
  currentStep,
  totalSteps,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0F1923] border-t border-[#2A3A4A] px-4 py-3 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {prevHref ? (
          <Button
            asChild
            variant="outline"
            className="min-h-[48px] bg-transparent border-[#2A3A4A] text-white hover:bg-[#1A2733] hover:text-white"
          >
            <Link href={prevHref}>
              <ChevronLeft className="h-5 w-5 mr-1" />
              {prevLabel}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {currentStep && totalSteps && (
          <div className="flex items-center gap-2">
            <span className="font-mono-numeric text-[#F5A623]">{currentStep}</span>
            <span className="text-[#A0B0C0]">/</span>
            <span className="font-mono-numeric text-[#A0B0C0]">{totalSteps}</span>
          </div>
        )}

        {nextHref ? (
          <Button
            asChild
            className="min-h-[48px] bg-[#F5A623] text-[#0F1923] hover:bg-[#E09500] font-semibold"
          >
            <Link href={nextHref}>
              {nextLabel}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
