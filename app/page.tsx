'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowRight } from 'lucide-react';

export default function CoverPage() {
  return (
    <div className="min-h-screen bg-[#FFF5F1] flex flex-col items-center justify-center px-[400px]">
      <div className="text-center max-w-2xl">
        <h1 className="font-display text-6xl md:text-8xl tracking-wider text-[#FF7F50] mb-6">
          MoveViz
        </h1>
        <p className="text-xl md:text-2xl text-[#2D3436] mb-4">
          이사 당일, 완벽하게
        </p>
        <p className="text-[#636E72] text-lg mb-12">
          사다리차·경로·배치도·비교 — 4가지 분석으로
          <br />
          이사를 한눈에 파악하세요
        </p>
        <Button
          asChild
          className="w-full max-w-md min-h-[56px] bg-[#FF7F50] text-white hover:bg-[#E66E3D] text-lg font-semibold rounded-xl"
        >
          <Link href="/onboarding">
            시작하기
            <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </Button>
      </div>
      <footer className="absolute bottom-8 text-[#636E72] text-sm">
        이사 당일 현장 지원 서비스
      </footer>
    </div>
  );
}
