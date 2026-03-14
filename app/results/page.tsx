'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getMoveData } from '@/lib/api';
import { defaultMoveData } from '@/lib/store';
import { useAnalysis } from '@/hooks/use-analysis';
import { analysisModules } from '@/lib/store';
import { EstimateVisualization } from '@/components/results/EstimateVisualization';
import { EstimateSummary } from '@/components/results/EstimateSummary';
import { Truck, Route, Share2, Home, MapPin, Calendar, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const MODULE_ICONS = [Truck, Route, Share2, Home];

export default function ResultsPage() {
  const analysis = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);

  useEffect(() => {
    getMoveData().then(setMoveData).catch(() => {});
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('공유 링크가 복사되었습니다');
  };

  const { origin, destination } = moveData;
  const ladderItems = analysis.ladderTruck.items.filter((i) => i.needsLadder);
  const pathWarnings = analysis.pathAnalysis.filter((i) => !i.canPass);
  const comparisonWarnings = analysis.comparisonWarnings;

  return (
    <div className="min-h-screen bg-[#FFF5F1] flex flex-col">
      <header className="flex-shrink-0 h-14 bg-[#FFF5F1] border-b border-[#2D3436]/20">
        <div className="max-w-[1600px] mx-auto px-[400px] h-full flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-[#636E72] hover:text-[#2D3436]">
            <Link href="/analysis">
              <ChevronLeft className="h-5 w-5 mr-1" />
              분석
            </Link>
          </Button>
          <span className="font-display text-2xl tracking-wide text-[#FF7F50]">MoveViz</span>
          <span className="text-[#636E72] text-sm">결과 요약</span>
        </div>
      </header>

      <main className="flex-1 px-[400px] max-w-[1600px] mx-auto w-full py-10 overflow-auto">
        <div className="mb-10">
          <h1 className="font-display text-4xl tracking-wider text-[#2D3436] mb-2">분석 결과 요약</h1>
          <p className="text-[#636E72]">이사 주요 정보와 주의사항을 확인하세요</p>
        </div>

        {/* 이사 기본 정보 */}
        <section className="mb-8">
          <h2 className="text-[#2D3436] font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FF7F50]" />
            이사 경로
          </h2>
          <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#2D3436]/20 grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-[#636E72] text-sm mb-1">이사 날짜</p>
              <p className="text-[#2D3436] font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF7F50]" />
                {moveData.moveDate}
              </p>
            </div>
            <div>
              <p className="text-[#636E72] text-sm mb-1">출발지</p>
              <p className="text-[#2D3436] font-medium">{origin.address}</p>
              <p className="text-[#636E72] text-xs">{origin.floor}층 · 엘리베이터 {origin.hasElevator ? '있음' : '없음'}</p>
            </div>
            <div>
              <p className="text-[#636E72] text-sm mb-1">도착지</p>
              <p className="text-[#2D3436] font-medium">{destination.address}</p>
              <p className="text-[#636E72] text-xs">{destination.floor}층 · 엘리베이터 {destination.hasElevator ? '있음' : '없음'}</p>
            </div>
          </div>
        </section>

        {/* 분석 모듈 요약 */}
        <section className="mb-8">
          <h2 className="text-[#2D3436] font-semibold text-lg mb-4">분석 모듈별 요약</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysisModules.map((module, i) => {
              const Icon = MODULE_ICONS[i];
              const statusColor =
                module.status === 'complete' ? 'border-[#B2F2BB] bg-[#B2F2BB]/5' :
                module.status === 'warning' ? 'border-[#F39C12] bg-[#F39C12]/5' :
                'border-[#2D3436]/20 bg-[#FFFFFF]';
              return (
                <div key={module.id} className={`rounded-xl p-5 border-2 ${statusColor}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#2D3436/20] flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#FF7F50]" />
                    </div>
                    <span className="text-[#2D3436] font-semibold">{module.name}</span>
                  </div>
                  <p className="text-[#636E72] text-sm">{module.summary}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 견적 산출 결과 */}
        <section className="mb-8">
          <EstimateVisualization />
        </section>

        {/* 전체 요약 */}
        <section className="mb-8">
          <EstimateSummary />
        </section>

        {/* 주요 주의사항 */}
        <section className="mb-8">
          <h2 className="text-[#2D3436] font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#F39C12]" />
            주요 주의사항
          </h2>
          <div className="space-y-4">
            {ladderItems.length > 0 && (
              <div className="bg-[#FFFFFF] rounded-xl p-5 border-2 border-[#F39C12]">
                <h3 className="text-[#F39C12] font-semibold mb-2">사다리차 필요 ({ladderItems.length}개)</h3>
                <ul className="space-y-1">
                  {ladderItems.map((item) => (
                    <li key={item.label} className="text-[#2D3436] text-sm flex items-center gap-2">
                      <span className="text-[#F39C12]">•</span>
                      {item.label}: {item.reason}
                    </li>
                  ))}
                </ul>
                <p className="text-[#636E72] text-sm mt-2">예상 추가 비용: {analysis.ladderTruck.estimatedCost.toLocaleString()}원</p>
              </div>
            )}
            {pathWarnings.length > 0 && (
              <div className="bg-[#FFFFFF] rounded-xl p-5 border-2 border-[#F39C12]">
                <h3 className="text-[#F39C12] font-semibold mb-2">경로 통과 주의 ({pathWarnings.length}건)</h3>
                <ul className="space-y-1">
                  {pathWarnings.map((item) => (
                    <li key={item.label} className="text-[#2D3436] text-sm flex items-center gap-2">
                      <span className="text-[#F39C12]">•</span>
                      {item.label}: {item.solution || item.bottleneck}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {comparisonWarnings.filter((w) => w.type !== 'success').length > 0 && (
              <div className="bg-[#FFFFFF] rounded-xl p-5 border-2 border-[#F39C12]">
                <h3 className="text-[#F39C12] font-semibold mb-2">양쪽 집 비교 주의</h3>
                <ul className="space-y-2">
                  {comparisonWarnings.filter((w) => w.type !== 'success').map((w, i) => (
                    <li key={i} className="text-[#2D3436] text-sm">
                      <span className="text-[#F39C12]">•</span> {w.item}: {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ladderItems.length === 0 && pathWarnings.length === 0 && comparisonWarnings.filter((w) => w.type !== 'success').length === 0 && (
              <div className="bg-[#FFFFFF] rounded-xl p-5 border-2 border-[#B2F2BB] flex items-center gap-3">
                <Check className="h-8 w-8 text-[#B2F2BB] shrink-0" />
                <p className="text-[#2D3436]">특별한 주의사항이 없습니다. 준비해 두시면 좋습니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* 이사 당일 체크리스트 */}
        <section className="mb-10">
          <h2 className="text-[#2D3436] font-semibold text-lg mb-4">이사 당일 체크리스트</h2>
          <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#2D3436]/20">
            <ul className="space-y-3">
              {[
                '사다리차 예약 확인 (필요 시)',
                '냉장고 전원 차단 12시간 전',
                '장롱 조립 공구 별도 보관',
                '이불·충전기·귀중품 마지막 반출',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF7F50]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#FF7F50] text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-[#2D3436]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 액션 버튼 */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleShare}
            className="min-h-[52px] px-8 bg-[#FF7F50] text-[#FFF5F1] hover:bg-[#E66E3D] font-semibold rounded-xl"
          >
            <Share2 className="h-5 w-5 mr-2" />
            기사님에게 공유하기
          </Button>
          <Button asChild variant="outline" className="min-h-[52px] px-6 border-[#2D3436]/20 text-[#2D3436] hover:bg-[#FFFFFF] rounded-xl">
            <Link href="/analysis">상세 분석 보기</Link>
          </Button>
          <Button asChild variant="ghost" className="min-h-[52px] px-6 text-[#636E72] hover:text-[#2D3436] hover:bg-[#FFFFFF] rounded-xl">
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              홈으로
            </Link>
          </Button>
        </div>
      </main>

      <footer className="py-6 border-t border-[#2D3436]/20">
        <div className="max-w-[1600px] mx-auto px-[400px] text-center">
          <span className="font-display text-xl text-[#FF7F50]">MoveViz</span>
          <p className="text-[#636E72] text-sm mt-1">성공적인 이사를 기원합니다!</p>
        </div>
      </footer>
    </div>
  );
}
