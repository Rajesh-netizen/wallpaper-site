'use client';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AuroraMesh({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={cn("relative overflow-hidden w-full bg-[#09090b]", className)}>
      
      {/* Ambient background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Emerald Blob */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#10b981] opacity-30 blur-[120px] animate-[drift-1_15s_ease-in-out_infinite_alternate]" />
        
        {/* Secondary Teal Blob */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] rounded-full bg-[#047857] opacity-20 blur-[100px] animate-[drift-2_18s_ease-in-out_infinite_alternate]" />
        
        {/* Accent Blob for warmth */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[50%] rounded-full bg-[#34d399] opacity-10 blur-[100px] animate-[drift-3_20s_ease-in-out_infinite_alternate]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}