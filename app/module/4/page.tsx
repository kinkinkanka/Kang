'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Module4Redirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/analysis'); }, [router]);
  return <div className="min-h-screen bg-[#0F1923] flex items-center justify-center"><p className="text-[#A0B0C0]">이동 중...</p></div>;
}
