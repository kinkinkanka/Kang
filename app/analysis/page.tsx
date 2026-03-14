'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { analysisModules } from '@/lib/store';
import { Fixed3DWithOverlay } from '@/components/analysis/Fixed3DWithOverlay';
import {
  LadderTruckInfo,
  PathAnalysisInfo,
  FloorPlanInfo,
  ComparisonInfo,
} from '@/components/analysis/ModuleInfoPanel';
import { Truck, Route, Share2, Home, ChevronLeft, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const MODULE_ICONS = [Truck, Route, Share2, Home];

export default function AnalysisPage() {
  const [selectedModule, setSelectedModule] = useState(1);
  const [openTabs, setOpenTabs] = useState<Record<number, boolean>>({ 1: true, 2: false, 3: false, 4: false });

  const infoMap: Record<number, React.ReactNode> = {
    1: <LadderTruckInfo />,
    2: <PathAnalysisInfo />,
    3: <FloorPlanInfo />,
    4: <ComparisonInfo />,
  };

  const toggleTab = (id: number) => {
    setOpenTabs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#FFF5F1]">
      <header className="flex-shrink-0 h-12 bg-[#FFF5F1] border-b border-[#2D3436]/20 flex items-center px-[400px] gap-3 max-w-[1600px] mx-auto w-full">
        <Button asChild variant="ghost" size="sm" className="h-8 text-[#636E72] hover:text-[#2D3436] hover:bg-[#FFFFFF] text-xs">
          <Link href="/onboarding">
            <ChevronLeft className="h-4 w-4 mr-1" />
            온보딩
          </Link>
        </Button>
        <span className="font-display text-lg text-[#FF7F50]">MoveViz</span>
        <span className="text-[#636E72] text-xs">분석</span>
        <Button asChild size="sm" className="ml-auto bg-[#FF7F50] text-white hover:bg-[#E66E3D]">
          <Link href="/results">
            <FileText className="h-4 w-4 mr-1" />
            결과 요약
          </Link>
        </Button>
      </header>

      {/* 화면 양쪽 여백 + Region 1+2: 왼쪽 68% | Region 3: 오른쪽 32% */}
      <div className="flex flex-1 min-h-0 px-[400px] max-w-[1600px] mx-auto w-full">
        <main className="flex-[7] flex flex-col min-w-0 overflow-hidden p-3 border-r border-[#2D3436]/20">
          {/* Region 1: 3D 뷰 — 55~60% 높이 */}
          <div className="flex-shrink-0 h-[58%] min-h-[200px] mb-3">
            <Fixed3DWithOverlay moduleId={selectedModule} />
          </div>

          {/* Region 2: 관련 내용 패널 — 30~35% 높이 */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-auto">
              {analysisModules
                .filter((m) => m.id === selectedModule)
                .map((module) => {
                  const Icon = MODULE_ICONS[module.id - 1];
                  const isOpen = openTabs[module.id];
                  const isActive = selectedModule === module.id;
                  return (
                    <div key={module.id} className={`w-full rounded-lg overflow-hidden border-2 ${isActive ? 'border-[#FF7F50]' : 'border-[#2D3436]/20'}`}>
                      <button
                        onClick={() => toggleTab(module.id)}
                        className={`w-full flex items-center justify-between gap-3 p-3 text-left ${
                          isActive ? 'bg-[#FF7F50]/10' : 'bg-[#FFFFFF] hover:bg-[#2D3436/20]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${isActive ? 'bg-[#FF7F50] text-white' : 'bg-[#2D3436/20] text-[#FF7F50]'}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <span className={`font-semibold text-sm ${isActive ? 'text-[#FF7F50]' : 'text-[#2D3436]'}`}>{module.name}</span>
                          <span className="text-[#636E72] text-xs truncate">{module.summary}</span>
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-[#636E72] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[#636E72] shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#2D3436]/20 bg-[#FFF5F1] px-4 py-4 min-h-[140px] overflow-auto">
                          <div className="w-full">{infoMap[module.id]}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </main>

        {/* Region 3: 사이드바 — 30~35% 너비, 전체 높이 */}
        <aside className="flex-[3] min-w-[240px] max-w-[400px] flex-shrink-0 border-l border-[#2D3436]/20 bg-[#FFF5F1] p-3 flex flex-col overflow-y-auto">
          <p className="text-[#636E72] text-sm font-medium mb-3">분석 모듈</p>
          <div className="space-y-2">
            {analysisModules.map((module) => {
              const Icon = MODULE_ICONS[module.id - 1];
              const isActive = selectedModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => {
                    setSelectedModule(module.id);
                    setOpenTabs((prev) => ({ ...prev, [module.id]: true }));
                  }}
                  className={`w-full text-left rounded-lg p-2.5 border-2 transition-all ${
                    isActive ? 'border-[#FF7F50] bg-[#FF7F50]/10' : 'border-[#2D3436]/20 bg-[#FFFFFF] hover:border-[#2D3436]/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-[#FF7F50] text-white' : 'bg-[#2D3436/20] text-[#FF7F50]'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold text-xs ${isActive ? 'text-[#FF7F50]' : 'text-[#2D3436]'}`}>{module.name}</p>
                      <p className="text-[#636E72] text-[10px] truncate">{module.summary}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
