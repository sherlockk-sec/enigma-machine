
"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import Scene to avoid SSR issues with R3F
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });
const ControlPanel = dynamic(() => import('@/components/ControlPanel'), { ssr: false });
const Keyboard = dynamic(() => import('@/components/Keyboard'), { ssr: false });

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading 3D Engine...</div>}>
          <Scene />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top Bar / Control Panel */}
        <div className="pointer-events-auto p-4">
          <Suspense fallback={null}>
            <ControlPanel />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
