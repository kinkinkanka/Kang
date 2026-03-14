'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveMoveData, runAnalysis } from '@/lib/api';
import { defaultMoveData } from '@/lib/store';
import { MapPin, Calendar, ArrowRight, Camera, Check, ChevronLeft } from 'lucide-react';
import { AddressAutocomplete } from '@/components/onboarding/AddressAutocomplete';

const RouteMap = dynamic(() => import('@/components/onboarding/RouteMap').then((m) => m.RouteMap), { ssr: false });

const inputCls = 'bg-white border-[#2D3436]/25 text-[#2D3436] min-h-[44px]';
export default function OnboardingPage() {
  const router = useRouter();
  const [moveDate, setMoveDate] = useState(defaultMoveData.moveDate);
  const [originAddress, setOriginAddress] = useState(defaultMoveData.origin.address);
  const [destinationAddress, setDestinationAddress] = useState(defaultMoveData.destination.address);
  const [isSaving, setIsSaving] = useState(false);

  const [furniturePhotos, setFurniturePhotos] = useState<string[]>([]);
  const [furnitureCaptured, setFurnitureCaptured] = useState(false);
  const furnitureStreamRef = useRef<MediaStream | null>(null);
  const furnitureVideoRef = useRef<HTMLVideoElement>(null);

  const [roomPhotoUrl, setRoomPhotoUrl] = useState<string | null>(null);
  const [roomCaptured, setRoomCaptured] = useState(false);
  const roomStreamRef = useRef<MediaStream | null>(null);
  const roomVideoElRef = useRef<HTMLVideoElement>(null);
  const [furnitureCamReady, setFurnitureCamReady] = useState(false);
  const [roomCamReady, setRoomCamReady] = useState(false);

  const startFurnitureCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      furnitureStreamRef.current = stream;
      setFurnitureCamReady(true);
      if (furnitureVideoRef.current) furnitureVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert('카메라 접근이 필요합니다.');
    }
  }, []);

  const stopFurnitureCamera = useCallback(() => {
    furnitureStreamRef.current?.getTracks().forEach((t) => t.stop());
    furnitureStreamRef.current = null;
    setFurnitureCamReady(false);
    if (furnitureVideoRef.current) furnitureVideoRef.current.srcObject = null;
  }, []);

  const captureFurniturePhoto = useCallback(() => {
    const video = furnitureVideoRef.current;
    const canvas = document.createElement('canvas');
    if (!video || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setFurniturePhotos((p) => [...p, dataUrl]);
    setFurnitureCaptured(true);
  }, []);

  const startRoomCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      roomStreamRef.current = stream;
      setRoomCamReady(true);
      if (roomVideoElRef.current) roomVideoElRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      alert('카메라 접근이 필요합니다.');
    }
  }, []);

  const stopRoomCamera = useCallback(() => {
    roomStreamRef.current?.getTracks().forEach((t) => t.stop());
    roomStreamRef.current = null;
    setRoomCamReady(false);
    if (roomVideoElRef.current) roomVideoElRef.current.srcObject = null;
  }, []);

  const captureRoomPhoto = useCallback(() => {
    const video = roomVideoElRef.current;
    const canvas = document.createElement('canvas');
    if (!video || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setRoomPhotoUrl(dataUrl);
    setRoomCaptured(true);
  }, []);

  const handleStartAnalysis = async () => {
    setIsSaving(true);
    stopFurnitureCamera();
    stopRoomCamera();
    try {
      const moveData = {
        ...defaultMoveData,
        moveDate,
        origin: { ...defaultMoveData.origin, address: originAddress },
        destination: { ...defaultMoveData.destination, address: destinationAddress },
        furniture: defaultMoveData.furniture,
      };
      await saveMoveData(moveData);
      const analysis = await runAnalysis(moveData);
      await fetch('/api/analysis/store?session=default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis),
      });
      router.push('/analysis');
    } catch (err) {
      console.error(err);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F1]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF5F1]/95 backdrop-blur-sm border-b border-[#2D3436]/20">
        <div className="max-w-[1600px] mx-auto px-[400px] h-16 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="text-[#636E72] hover:text-[#2D3436]">
            <Link href="/"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <span className="font-display text-2xl tracking-wide text-[#FF7F50]">MoveViz</span>
        </div>
      </header>

      <main className="pt-24 pb-20 px-[400px] max-w-[1600px] mx-auto w-full min-h-[calc(100vh-6rem)] flex gap-4">
        {/* 좌측: 지도/이사경로 (45~50% 너비, 전체 높이) */}
        <div className="flex-[5] flex flex-col min-w-0 gap-4">
          <h1 className="font-display text-3xl tracking-wider text-[#2D3436]">이사 정보 입력</h1>
          <div className="flex-1 flex flex-col min-h-0 bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#2D3436]/20">
            <div className="p-3 border-b border-[#2D3436]/20">
              <p className="text-[#636E72] text-sm font-medium">지도 / 이사 경로</p>
            </div>
            <div className="flex-1 min-h-[280px] p-3 h-full">
              <div className="w-full h-full min-h-[200px] rounded-lg overflow-hidden">
                <RouteMap origin={originAddress} destination={destinationAddress} />
              </div>
            </div>
            <div className="p-4 border-t border-[#2D3436]/20 space-y-3">
              <div>
                <Label className="text-[#636E72] text-sm flex items-center gap-2 mb-1"><Calendar className="h-4 w-4 text-[#FF7F50]" /> 이사 날짜</Label>
                <Input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className={inputCls} />
              </div>
              <AddressAutocomplete id="origin" label="출발지" value={originAddress} onChange={setOriginAddress} placeholder="예: 서울 강남구 역삼동" icon={<MapPin className="h-4 w-4 text-[#3B82F6]" />} inputClassName={inputCls} />
              <AddressAutocomplete id="destination" label="도착지" value={destinationAddress} onChange={setDestinationAddress} placeholder="예: 서울 마포구 합정동" icon={<MapPin className="h-4 w-4 text-[#B2F2BB]" />} inputClassName={inputCls} />
            </div>
          </div>
          <Button onClick={handleStartAnalysis} disabled={isSaving} className="w-full min-h-[52px] bg-[#FF7F50] text-[#FFF5F1] hover:bg-[#E66E3D] font-semibold rounded-xl disabled:opacity-70">
            {isSaving ? '분석 중...' : '분석 보기'} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* 우측: 위·아래 2분할 */}
        <div className="flex-[5] flex flex-col min-w-0 gap-4">
          {/* 우상단: 방사진촬영 */}
          <div className="flex-1 min-h-[200px] bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#2D3436]/20 flex flex-col">
            <div className="p-3 border-b border-[#2D3436]/20 flex items-center gap-2 shrink-0">
              <Camera className="h-4 w-4 text-[#FF7F50]" />
              <span className="text-white font-medium">방사진촬영 (1장)</span>
              {roomCaptured && <Check className="h-5 w-5 text-[#B2F2BB] ml-auto" />}
            </div>
            <div className="flex-1 min-h-0 p-4 overflow-auto">
              {roomPhotoUrl ? (
                <div className="space-y-2">
                  <img src={roomPhotoUrl} alt="방 사진" className="w-full rounded-lg object-cover aspect-video max-h-[200px]" />
                  <p className="text-[#B2F2BB] text-sm">촬영 완료 (1장)</p>
                  <Button variant="outline" size="sm" onClick={() => { setRoomPhotoUrl(null); setRoomCaptured(false); startRoomCamera(); }} className="border-[#2D3436]/20 text-[#636E72]">다시 촬영</Button>
                </div>
              ) : (
                <div className="space-y-2 h-full flex flex-col">
                  <div className="flex-1 min-h-[120px] bg-[rgba(45,52,54,0.2)] rounded-lg overflow-hidden">
                    <video ref={roomVideoElRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <Button size="sm" onClick={startRoomCamera} className="bg-[rgba(45,52,54,0.2)] hover:bg-[#2D3436]/30 text-white"><Camera className="h-4 w-4 mr-1" /> 카메라</Button>
                    <Button size="sm" onClick={captureRoomPhoto} disabled={!roomCamReady} className="bg-[#FF7F50] text-[#FFF5F1] hover:bg-[#E66E3D]">사진 촬영 (1장)</Button>
                    <Button size="sm" variant="outline" onClick={stopRoomCamera} className="border-[#2D3436]/20 text-[#636E72]">종료</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 우하단: 가구사진촬영 */}
          <div className="flex-1 min-h-[200px] bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#2D3436]/20 flex flex-col">
            <div className="p-3 border-b border-[#2D3436]/20 flex items-center gap-2 shrink-0">
              <Camera className="h-4 w-4 text-[#FF7F50]" />
              <span className="text-white font-medium">가구사진촬영 (여러 장)</span>
              {(furnitureCaptured || furniturePhotos.length > 0) && <Check className="h-5 w-5 text-[#B2F2BB] ml-auto" />}
            </div>
            <div className="flex-1 min-h-0 p-4 overflow-auto">
              {furniturePhotos.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                    {furniturePhotos.map((url, i) => (
                      <img key={i} src={url} alt={`가구 ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                    ))}
                  </div>
                  <p className="text-[#636E72] text-xs">{furniturePhotos.length}장 촬영됨</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setFurniturePhotos([]); setFurnitureCaptured(false); startFurnitureCamera(); }} className="border-[#2D3436]/20 text-[#636E72]">전부 삭제</Button>
                    <Button size="sm" onClick={startFurnitureCamera} className="bg-[#FF7F50] text-[#FFF5F1] hover:bg-[#E66E3D]">추가 촬영</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 h-full flex flex-col">
                  <div className="flex-1 min-h-[120px] bg-[rgba(45,52,54,0.2)] rounded-lg overflow-hidden">
                    <video ref={furnitureVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <Button size="sm" onClick={startFurnitureCamera} className="bg-[rgba(45,52,54,0.2)] hover:bg-[#2D3436]/30 text-white"><Camera className="h-4 w-4 mr-1" /> 카메라</Button>
                    <Button size="sm" onClick={captureFurniturePhoto} disabled={!furnitureCamReady} className="bg-[#FF7F50] text-[#FFF5F1] hover:bg-[#E66E3D]">사진 촬영</Button>
                    <Button size="sm" variant="outline" onClick={stopFurnitureCamera} className="border-[#2D3436]/20 text-[#636E72]">종료</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
