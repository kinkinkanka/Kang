'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { modules } from '@/lib/store';
import { Check, Home, Download, Share2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CompletePage() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('공유 링크가 복사되었습니다');
  };

  return (
    <div className="min-h-screen bg-[#FFF5F1] flex flex-col">
      {/* Header */}
      <header className="bg-[#FFF5F1] border-b border-[#2D3436]/20">
        <div className="max-w-[1600px] mx-auto px-[400px] h-16 flex items-center justify-center">
          <span className="font-display text-2xl text-[#FF7F50]">MoveViz</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-[400px] py-12">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-[#B2F2BB] flex items-center justify-center mb-8 animate-pulse">
          <Check className="h-12 w-12 text-[#FFF5F1]" />
        </div>

        {/* Title */}
        <h1 className="font-display text-5xl md:text-6xl text-[#2D3436] tracking-wider mb-4 text-center">
          이사 준비 완료!
        </h1>
        <p className="text-[#636E72] text-lg text-center mb-12 max-w-md">
          모든 분석이 완료되었습니다. 이사 당일 이 가이드를 참고하세요.
        </p>

        {/* Summary Card */}
        <div className="w-full max-w-md bg-[#FFFFFF] rounded-xl p-6 border border-[#2D3436]/20 mb-8">
          <h2 className="text-[#2D3436] font-semibold mb-4">분석 결과 요약</h2>
          <div className="space-y-3">
            {modules.map((module) => (
              <div key={module.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      module.status === 'complete'
                        ? 'bg-[#B2F2BB]/20'
                        : module.status === 'warning'
                        ? 'bg-[#F39C12]/20'
                        : 'bg-[#2D3436/20]'
                    }`}
                  >
                    <span className="font-mono-numeric text-sm font-bold text-[#FF7F50]">
                      {module.id}
                    </span>
                  </div>
                  <span className="text-[#2D3436]">{module.name}</span>
                </div>
                <span
                  className={`text-sm ${
                    module.status === 'complete'
                      ? 'text-[#B2F2BB]'
                      : module.status === 'warning'
                      ? 'text-[#F39C12]'
                      : 'text-[#636E72]'
                  }`}
                >
                  {module.summary}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Points */}
        <div className="w-full max-w-md bg-[#FFFFFF] rounded-xl p-6 border border-[#F39C12] mb-8">
          <h2 className="text-[#F39C12] font-semibold mb-4">이사 당일 체크리스트</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#F39C12]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#F39C12] text-xs font-bold">1</span>
              </div>
              <span className="text-[#2D3436]">
                사다리차 예약 확인 (장롱, 냉장고)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#F39C12]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#F39C12] text-xs font-bold">2</span>
              </div>
              <span className="text-[#2D3436]">
                냉장고 전원 차단 12시간 전 확인
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#F39C12]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#F39C12] text-xs font-bold">3</span>
              </div>
              <span className="text-[#2D3436]">
                장롱 조립 공구 별도 보관
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#F39C12]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#F39C12] text-xs font-bold">4</span>
              </div>
              <span className="text-[#2D3436]">
                이불/충전기/귀중품 마지막 반출
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3">
          <Button
            onClick={handleShare}
            className="w-full min-h-[56px] bg-[#FF7F50] text-white hover:bg-[#E66E3D] text-lg font-semibold rounded-xl"
          >
            <Share2 className="h-5 w-5 mr-2" />
            기사님에게 공유하기
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full min-h-[56px] border-[#2D3436]/20 text-[#2D3436] hover:bg-[#FFFFFF] text-lg rounded-xl"
          >
            <Link href="/dashboard">
              <ArrowRight className="h-5 w-5 mr-2" />
              대시보드로 돌아가기
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full min-h-[48px] text-[#636E72] hover:text-[#2D3436] hover:bg-[#FFFFFF]"
          >
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              홈으로
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-[400px] border-t border-[#2D3436]/20">
        <div className="max-w-[1600px] mx-auto text-center">
          <span className="font-display text-xl text-[#FF7F50]">MoveViz</span>
          <p className="text-[#636E72] text-sm mt-2">
            성공적인 이사를 기원합니다!
          </p>
        </div>
      </footer>
    </div>
  );
}
