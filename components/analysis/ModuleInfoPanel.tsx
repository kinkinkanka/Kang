'use client';

import { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useAnalysis } from '@/hooks/use-analysis';
import { getMoveData } from '@/lib/api';
import { defaultMoveData } from '@/lib/store';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Share2, Undo2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface PlacedFurniture {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
}

const ROOM_WIDTH = 3288;
const ROOM_HEIGHT = 5352;
const PADDING = 4;
const LABEL_HEIGHT = 18;
const SNAP_GRID = 80;
const SNAP_THRESHOLD = 200;
const OBJECT_SNAP_PRIORITY = 0.6;

export function LadderTruckInfo() {
  const { ladderTruck } = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);
  useEffect(() => { getMoveData().then(setMoveData).catch(() => {}); }, []);

  const { items } = ladderTruck;
  const { origin, destination } = moveData;
  const needsLadderItems = items.filter((i) => i.needsLadder);
  const passItems = items.filter((i) => !i.needsLadder);

  return (
    <div className="space-y-3 w-full">
      <p className="text-[#636E72] text-sm font-medium">출발 {origin.floor}층 → 도착 {destination.floor}층</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {needsLadderItems.map((item) => (
          <div key={item.label} className="rounded-lg p-3 border border-[#E74C3C] bg-[#E74C3C]/5">
            <p className="font-semibold text-[#2D3436] text-sm">{item.label}</p>
            <p className="text-[#636E72] text-xs mt-0.5">{item.reason}</p>
          </div>
        ))}
      </div>
      {passItems.length > 0 && (
        <div className="rounded-lg p-3 border border-[#B2F2BB] bg-[#B2F2BB]/5">
          <p className="text-[#2D3436] text-sm">✓ {passItems.map((i) => i.label).join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export function PathAnalysisInfo() {
  const { pathAnalysis } = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);
  useEffect(() => { getMoveData().then(setMoveData).catch(() => {}); }, []);

  const frontDoorWidth = moveData.origin.frontDoorSize.w;
  const warningItems = pathAnalysis.filter(i => !i.canPass);

  return (
    <div className="space-y-2 w-full">
      <div className="bg-[#FFFFFF] rounded-lg p-2.5 border-2 border-[#FF7F50]">
        <div className="flex items-center justify-center gap-2">
          <StatusBadge status="warning" size="lg" />
          <p className="text-sm font-bold text-[#2D3436]">{warningItems.length}개 주의 ({warningItems.map(i => i.label).join(', ')})</p>
        </div>
      </div>
      <div className="bg-[#FFFFFF] rounded-lg border border-[#2D3436]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#2D3436]/20 bg-[#2D3436]/20/50">
                <th className="text-left text-[#636E72] p-1.5">가구</th>
                <th className="text-center text-[#636E72] p-1.5">현관</th>
                <th className="text-center text-[#636E72] p-1.5">복도</th>
                <th className="text-center text-[#636E72] p-1.5">엘베</th>
                <th className="text-left text-[#636E72] p-1.5">해결</th>
              </tr>
            </thead>
            <tbody>
              {pathAnalysis.map((item) => (
                <tr key={item.label} className="border-b border-[#2D3436]/20">
                  <td className="p-1.5 text-[#2D3436] font-medium">{item.label}</td>
                  <td className="p-1.5 text-center">{item.frontDoor ? <Check className="h-3.5 w-3.5 text-[#B2F2BB] mx-auto" /> : <X className="h-3.5 w-3.5 text-[#E74C3C] mx-auto" />}</td>
                  <td className="p-1.5 text-center">{item.hallway ? <Check className="h-3.5 w-3.5 text-[#B2F2BB] mx-auto" /> : <X className="h-3.5 w-3.5 text-[#E74C3C] mx-auto" />}</td>
                  <td className="p-1.5 text-center">{item.elevator ? <Check className="h-3.5 w-3.5 text-[#B2F2BB] mx-auto" /> : <X className="h-3.5 w-3.5 text-[#E74C3C] mx-auto" />}</td>
                  <td className="p-1.5">{item.solution ? <span className="px-1 py-0.5 rounded bg-[#F39C12]/20 text-[#F39C12] text-[10px]">{item.solution}</span> : <span className="text-[#636E72]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getEffectiveSize(f: PlacedFurniture) {
  const r = f.rotation % 180;
  return r === 0 ? { w: f.width, h: f.height } : { w: f.height, h: f.width };
}

function isValidPosition(px: number, py: number, w: number, h: number): boolean {
  return px >= -2 && py >= -2 && px + w <= ROOM_WIDTH + 2 && py + h <= ROOM_HEIGHT + 2;
}

function applySnap(
  x: number, y: number, w: number, h: number,
  excludeId: string | null,
  placed: PlacedFurniture[]
): { x: number; y: number } {
  const others = placed.filter((p) => p.id !== excludeId);
  const gridX = Math.round(x / SNAP_GRID) * SNAP_GRID;
  const gridY = Math.round(y / SNAP_GRID) * SNAP_GRID;

  const snapXOptions: { value: number; score: number }[] = [
    { value: gridX, score: Math.abs(gridX - x) },
    { value: 0, score: Math.abs(0 - x) },
    { value: ROOM_WIDTH - w, score: Math.abs(ROOM_WIDTH - w - x) },
  ];
  const snapYOptions: { value: number; score: number }[] = [
    { value: gridY, score: Math.abs(gridY - y) },
    { value: 0, score: Math.abs(0 - y) },
    { value: ROOM_HEIGHT - h, score: Math.abs(ROOM_HEIGHT - h - y) },
  ];

  for (const o of others) {
    const oe = getEffectiveSize(o);
    const xEdges = [
      o.x,
      o.x + oe.w - w,
      o.x + oe.w,
      o.x - w,
    ];
    const yEdges = [
      o.y,
      o.y + oe.h - h,
      o.y + oe.h,
      o.y - h,
    ];
    for (const ex of xEdges) {
      const dist = Math.abs(ex - x);
      if (dist <= SNAP_THRESHOLD && isValidPosition(ex, y, w, h)) {
        snapXOptions.push({ value: ex, score: dist * OBJECT_SNAP_PRIORITY });
      }
    }
    for (const ey of yEdges) {
      const dist = Math.abs(ey - y);
      if (dist <= SNAP_THRESHOLD && isValidPosition(x, ey, w, h)) {
        snapYOptions.push({ value: ey, score: dist * OBJECT_SNAP_PRIORITY });
      }
    }
  }

  const snapX = snapXOptions.filter((s) => Math.abs(s.value - x) <= SNAP_THRESHOLD)
    .sort((a, b) => a.score - b.score)[0]?.value ?? x;
  const snapY = snapYOptions.filter((s) => Math.abs(s.value - y) <= SNAP_THRESHOLD)
    .sort((a, b) => a.score - b.score)[0]?.value ?? y;
  const snapped = clampToRoom(snapX, snapY, w, h);
  return isValidPosition(snapX, snapY, w, h) ? snapped : { x, y };
}

function clampToRoom(x: number, y: number, w: number, h: number) {
  return {
    x: Math.max(0, Math.min(x, ROOM_WIDTH - w)),
    y: Math.max(0, Math.min(y, ROOM_HEIGHT - h)),
  };
}

function getScaleLabel(scale: number): string {
  const ratio = 1 / scale;
  if (ratio >= 100) return `1:${Math.round(ratio)}`;
  if (ratio >= 10) return `1:${Math.round(ratio * 10) / 10}`;
  return `1:${Math.round(ratio * 100) / 100}`;
}

export function FloorPlanInfo() {
  const { truckLoading } = useAnalysis();
  const loadingItems = truckLoading.loadingItems;
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<PlacedFurniture[][]>([[]]);
  const [scale, setScale] = useState(0.08);
  const [axisXInput, setAxisXInput] = useState('0, 1000, 2000, 3288');
  const [axisYInput, setAxisYInput] = useState('0, 1500, 3000, 4500, 5352');
  const scaleRef = useRef(0.08);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const parseAxisValues = (s: string): number[] =>
    s.split(/[\s,]+/).map((v) => parseInt(v.trim(), 10)).filter((n) => !isNaN(n) && n >= 0);
  const axisXValues = parseAxisValues(axisXInput).filter((v) => v <= ROOM_WIDTH);
  const axisYValues = parseAxisValues(axisYInput).filter((v) => v <= ROOM_HEIGHT);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const rotateRef = useRef<{ id: string; startAngle: number; startRotation: number; cx: number; cy: number } | null>(null);
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 20 || h < 20) return;
      const availableW = w - PADDING * 2;
      const availableH = h - PADDING * 2 - LABEL_HEIGHT;
      const newScale = Math.min(availableW / ROOM_WIDTH, availableH / ROOM_HEIGHT, 0.15);
      const s = Math.max(0.02, newScale);
      setScale(s);
      scaleRef.current = s;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const availableFurniture = loadingItems.map((item) => ({
    label: item.label,
    width: item.dimensions.w * 1000,
    height: item.dimensions.d * 1000,
    color: item.color,
  }));

  const saveHistory = (s: PlacedFurniture[]) => setHistory((h) => [...h.slice(-19), s]);
  const undo = () => {
    if (history.length > 1) {
      const h = history.slice(0, -1);
      setHistory(h);
      setPlacedFurniture(h[h.length - 1] || []);
      setSelectedId(null);
    }
  };

  const startDrag = useCallback((id: string, clientX: number, clientY: number, x: number, y: number, onClick: () => void) => {
    if (!canvasRef.current) return;
    const s = scaleRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (clientX - rect.left - PADDING) / s;
    const my = (clientY - rect.top - PADDING) / s;
    let dragStarted = false;
    const DRAG_THRESHOLD = 5;
    dragRef.current = { id, offsetX: mx - x, offsetY: my - y };
    const onMove = (e: MouseEvent) => {
      if (!dragStarted) {
        const dx = e.clientX - clientX;
        const dy = e.clientY - clientY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        dragStarted = true;
      }
      if (!dragRef.current || dragRef.current.id !== id || !canvasRef.current) return;
      const s = scaleRef.current;
      const r = canvasRef.current.getBoundingClientRect();
      const xMm = (e.clientX - r.left - PADDING) / s - dragRef.current.offsetX;
      const yMm = (e.clientY - r.top - PADDING) / s - dragRef.current.offsetY;
      setPlacedFurniture((prev) => {
        const f = prev.find((p) => p.id === id);
        if (!f) return prev;
        const { w, h } = getEffectiveSize(f);
        const clamped = clampToRoom(xMm, yMm, w, h);
        positionsRef.current.set(id, { x: clamped.x, y: clamped.y });
        return prev.map((p) => (p.id === id ? { ...p, x: clamped.x, y: clamped.y } : p));
      });
    };
    const onUp = () => {
      if (dragRef.current?.id !== id) return;
      const dr = dragRef.current;
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (!dragStarted) {
        onClick();
        return;
      }
      setPlacedFurniture((prev) => {
        const f = prev.find((p) => p.id === dr.id);
        if (!f) return prev;
        const pos = positionsRef.current.get(dr.id) ?? { x: f.x, y: f.y };
        const { w, h } = getEffectiveSize(f);
        const snapped = applySnap(pos.x, pos.y, w, h, dr.id, prev);
        const clamped = clampToRoom(snapped.x, snapped.y, w, h);
        const next = prev.map((p) => (p.id === dr.id ? { ...p, x: clamped.x, y: clamped.y } : p));
        saveHistory(next);
        return next;
      });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const startRotate = useCallback((id: string, clientX: number, clientY: number, f: PlacedFurniture) => {
    const s = scaleRef.current;
    const { w, h } = getEffectiveSize(f);
    const cx = f.x + w / 2;
    const cy = f.y + h / 2;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (clientX - rect.left - PADDING) / s;
    const my = (clientY - rect.top - PADDING) / s;
    const startAngle = Math.atan2(my - cy, mx - cx);
    rotateRef.current = { id, startAngle, startRotation: f.rotation, cx, cy };
    const onMove = (e: MouseEvent) => {
      if (!rotateRef.current || rotateRef.current.id !== id || !canvasRef.current) return;
      const s = scaleRef.current;
      const r = canvasRef.current.getBoundingClientRect();
      const mx2 = (e.clientX - r.left - PADDING) / s;
      const my2 = (e.clientY - r.top - PADDING) / s;
      const angle = Math.atan2(my2 - rotateRef.current.cy, mx2 - rotateRef.current.cx);
      let deltaDeg = ((angle - rotateRef.current.startAngle) * 180) / Math.PI;
      let newRot = (rotateRef.current.startRotation + deltaDeg + 360) % 360;
      newRot = Math.round(newRot / 90) * 90;
      if (newRot >= 360) newRot = 0;
      setPlacedFurniture((prev) =>
        prev.map((p) => (p.id === id ? { ...p, rotation: newRot } : p))
      );
    };
    const onUp = () => {
      if (rotateRef.current?.id !== id) return;
      rotateRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setPlacedFurniture((prev) => {
        saveHistory(prev);
        return prev;
      });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('furniture');
    if (!raw || !canvasRef.current) return;
    const parsed = JSON.parse(raw);
    const s = scaleRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const xMm = (e.clientX - rect.left - PADDING) / s;
    const yMm = (e.clientY - rect.top - PADDING) / s;
    const w = parsed.width;
    const h = parsed.height;
    const { x: sx, y: sy } = applySnap(xMm - w / 2, yMm - h / 2, w, h, null, placedFurniture);
    const { x, y } = clampToRoom(sx, sy, w, h);
    const newF: PlacedFurniture = {
      id: Date.now().toString(),
      label: parsed.label,
      x: x,
      y: y,
      width: w,
      height: h,
      rotation: 0,
      color: parsed.color,
    };
    const next = [...placedFurniture, newF];
    setPlacedFurniture(next);
    saveHistory(next);
  };


  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2">
        <div className="w-24 shrink-0 bg-[#FFFFFF] rounded-lg p-2 border border-[#2D3436]/20">
          {availableFurniture.map((f) => (
            <div
              key={f.label}
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('furniture', JSON.stringify(f)); e.dataTransfer.effectAllowed = 'copy'; }}
              className="flex items-center gap-1 p-1.5 mb-1 rounded bg-[#2D3436]/20 cursor-grab hover:bg-[#2D3436]/30"
            >
              <div className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: f.color }} />
              <span className="text-[#2D3436] text-[10px] truncate">{f.label}</span>
            </div>
          ))}
        </div>
        <div ref={wrapperRef} className="flex-1 min-h-[140px] flex items-center justify-center min-w-0">
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-furniture]')) setSelectedId(null); }}
            className="bg-[#FFFFFF] rounded-lg border-2 border-[#2D3436/30] relative overflow-hidden shrink-0"
            style={{
              width: ROOM_WIDTH * scale + PADDING * 2,
              height: ROOM_HEIGHT * scale + PADDING * 2 + LABEL_HEIGHT,
              backgroundImage: 'linear-gradient(rgba(45,52,54,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(45,52,54,0.2) 1px, transparent 1px)',
              backgroundSize: `${SNAP_GRID * scale}px ${SNAP_GRID * scale}px`,
            }}
          >
          {/* 바운더리 */}
          <div
            className="absolute border-2 border-[#FF7F50]/80 pointer-events-none"
            style={{
              left: PADDING,
              top: PADDING,
              width: ROOM_WIDTH * scale,
              height: ROOM_HEIGHT * scale,
            }}
          />
          {/* 축선 (건축도면 스타일) */}
          {axisXValues.map((xv) => (
            <div
              key={`v-${xv}`}
              className="absolute w-px bg-[#2D3436]/40 pointer-events-none"
              style={{
                left: PADDING + xv * scale,
                top: PADDING,
                height: ROOM_HEIGHT * scale,
              }}
            />
          ))}
          {axisYValues.map((yv) => (
            <div
              key={`h-${yv}`}
              className="absolute h-px bg-[#2D3436]/40 pointer-events-none"
              style={{
                top: PADDING + yv * scale,
                left: PADDING,
                width: ROOM_WIDTH * scale,
              }}
            />
          ))}
          {axisXValues.map((xv) => (
            <span
              key={`lx-${xv}`}
              className="absolute text-[#2D3436]/70 text-[9px] font-mono pointer-events-none -translate-x-1/2"
              style={{ left: PADDING + xv * scale, bottom: 2 }}
            >
              {xv}
            </span>
          ))}
          {axisYValues.map((yv) => (
            <span
              key={`ly-${yv}`}
              className="absolute text-[#2D3436]/70 text-[9px] font-mono pointer-events-none"
              style={{ left: 2, top: PADDING + yv * scale, transform: 'translateY(-50%)' }}
            >
              {yv}
            </span>
          ))}
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[#636E72] text-[10px] pointer-events-none whitespace-nowrap">
            {ROOM_WIDTH}×{ROOM_HEIGHT}mm  ·  {getScaleLabel(scale)}
          </span>
          {placedFurniture.map((f) => {
            const { w, h } = getEffectiveSize(f);
            const isSelected = selectedId === f.id;
            const needsLabelRotate = f.rotation === 90 || f.rotation === 270;
            return (
              <div
                key={f.id}
                data-furniture
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  e.preventDefault();
                  e.stopPropagation();
                  startDrag(f.id, e.clientX, e.clientY, f.x, f.y, () => setSelectedId(isSelected ? null : f.id));
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPlacedFurniture((prev) => {
                    const next = prev.filter((p) => p.id !== f.id);
                    saveHistory(next);
                    return next;
                  });
                  setSelectedId(null);
                }}
                className={`absolute cursor-grab active:cursor-grabbing rounded border-2 select-none flex items-center justify-center ${isSelected ? 'border-[#FF7F50] ring-1 ring-[#FF7F50]/50 z-10' : 'border-transparent'}`}
                style={{
                  left: f.x * scale + PADDING,
                  top: f.y * scale + PADDING,
                  width: w * scale,
                  height: h * scale,
                  backgroundColor: f.color,
                }}
              >
                <span
                  className="text-[10px] text-[#2D3436] font-medium truncate block max-w-full"
                  style={needsLabelRotate ? { transform: 'rotate(-90deg)' } : undefined}
                >
                  {f.label}
                </span>
                {isSelected && (
                  <div
                    role="button"
                    tabIndex={0}
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      ev.stopPropagation();
                      startRotate(f.id, ev.clientX, ev.clientY, f);
                    }}
                    onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') ev.preventDefault(); }}
                    className="absolute -top-7 right-0 px-2 py-1 rounded bg-[#FF7F50] text-white text-[10px] flex items-center gap-1 cursor-grab active:cursor-grabbing select-none"
                  >
                    <RotateCw className="h-3 w-3" /> 드래그로 회전
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={undo} variant="outline" size="sm" className="h-7 text-xs border-[#2D3436]/20 text-[#2D3436] hover:bg-[#FFFFFF]"><Undo2 className="h-3 w-3 mr-1" />되돌리기</Button>
          <Button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('공유 링크 복사됨'); }} size="sm" className="h-7 text-xs bg-[#FF7F50] text-white hover:bg-[#E66E3D]"><Share2 className="h-3 w-3 mr-1" />공유</Button>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5">
            <Label className="text-[#636E72] text-[10px] shrink-0">X축(mm)</Label>
            <Input
              value={axisXInput}
              onChange={(e) => setAxisXInput(e.target.value)}
              placeholder="0, 1000, 2000"
              className="h-6 w-28 text-[10px] px-2 border-[#2D3436]/20"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-[#636E72] text-[10px] shrink-0">Y축(mm)</Label>
            <Input
              value={axisYInput}
              onChange={(e) => setAxisYInput(e.target.value)}
              placeholder="0, 1500, 3000"
              className="h-6 w-28 text-[10px] px-2 border-[#2D3436]/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparisonInfo() {
  const { comparisonWarnings } = useAnalysis();
  const warningCount = comparisonWarnings.filter((w) => w.type !== 'success').length;
  const successCount = comparisonWarnings.filter((w) => w.type === 'success').length;

  return (
    <div className="space-y-2 w-full">
      <div className="bg-[#FFFFFF] rounded-lg p-2.5 border-2 border-[#FF7F50]">
        <div className="flex items-center justify-center gap-2">
          <StatusBadge status="warning" size="lg" />
          <p className="text-sm font-bold text-[#2D3436]">주의 {warningCount}건 / 정상 {successCount}건</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {comparisonWarnings.map((w, i) => (
          <div
            key={i}
            className={`rounded-lg p-2 border ${
              w.type === 'error' ? 'border-[#E74C3C] bg-[#E74C3C]/5' :
              w.type === 'warning' ? 'border-[#F39C12] bg-[#F39C12]/5' :
              'border-[#B2F2BB] bg-[#B2F2BB]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{w.type === 'error' ? '❌' : w.type === 'warning' ? '⚠️' : '✅'}</span>
              <div>
                <p className="font-semibold text-[#2D3436] text-xs">{w.item}</p>
                <p className="text-[#636E72] text-[10px]">{w.message}{w.detail ? ` · ${w.detail}` : ''}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
