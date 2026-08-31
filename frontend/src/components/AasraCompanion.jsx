import React from 'react';
import { Heart, Sparkles, Shield, Bot } from 'lucide-react';

/**
 * AASRA Companion Component: Mitra
 * A trauma-informed, compassionate AI support companion.
 * Rendered as an empathetic, luminous companion badge with warm golden-teal breathing motion,
 * concentric listening waves, and clear status indicators.
 * 
 * Props:
 * - state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'safety_support' | 'reassuring' | 'calm'
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - showText: boolean
 * - subtext: string
 */
export default function AasraCompanion({ state = 'idle', size = 'md', showText = false, subtext }) {
  const sizeMap = {
    sm: { container: 'w-12 h-12', orb: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-xs' },
    md: { container: 'w-24 h-24', orb: 'w-20 h-20', icon: 'w-9 h-9', text: 'text-sm' },
    lg: { container: 'w-36 h-36', orb: 'w-32 h-32', icon: 'w-14 h-14', text: 'text-base' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isSafetySupport = state === 'safety_support' || state === 'reassuring' || state === 'calm';

  return (
    <div className="flex flex-col items-center justify-center space-y-3 select-none">
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        
        {/* Concentric Ambient Waves when Active */}
        {(state === 'listening' || state === 'speaking' || state === 'thinking') && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping duration-1000 motion-reduce:animate-none"></div>
            <div className="absolute -inset-2 rounded-full border border-primary/30 animate-pulse motion-reduce:animate-none"></div>
            <div className="absolute -inset-4 rounded-full border border-secondary/20"></div>
          </>
        )}

        {/* Calm Serene Waves during Safety Support */}
        {isSafetySupport && (
          <>
            <div className="absolute -inset-2 rounded-full bg-risk-low/20 animate-pulse duration-1000 motion-reduce:animate-none"></div>
            <div className="absolute -inset-4 rounded-full border border-risk-low/30"></div>
          </>
        )}

        {/* Outer Glow Halo */}
        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
          state === 'speaking'
            ? 'bg-primary/30 opacity-90'
            : state === 'listening'
            ? 'bg-gradient-to-r from-primary/40 to-secondary/40 opacity-90'
            : state === 'thinking'
            ? 'bg-gradient-to-r from-secondary/40 via-primary/30 to-primary-dark/30 opacity-90'
            : isSafetySupport
            ? 'bg-gradient-to-r from-primary/30 via-risk-low/30 to-secondary/20 opacity-90'
            : 'bg-gradient-to-r from-primary/25 via-primary-dark/20 to-secondary/20 opacity-75'
        }`}></div>

        {/* Main Luminous Companion Badge Container */}
        <div className={`relative ${currentSize.orb} rounded-3xl transition-all duration-700 flex items-center justify-center overflow-hidden shadow-xl border ${
          state === 'listening' ? 'scale-105 border-primary shadow-primary/20' :
          state === 'thinking' ? 'border-secondary/60 animate-pulse' :
          isSafetySupport ? 'border-risk-low/50 bg-gradient-to-br from-primary-dark to-risk-low' :
          'border-primary/40 bg-gradient-to-br from-primary via-primary-dark to-slate-800 animate-breathing-orb motion-reduce:animate-none'
        }`}>
          
          {/* Inner Glowing Pattern */}
          <div className="absolute inset-0 bg-radial-gradient opacity-10"></div>
          
          {/* Empathetic Avatar Face / Emblem */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white">
            {isSafetySupport ? (
              <Shield className={`${currentSize.icon} text-emerald-300 animate-pulse`} />
            ) : state === 'speaking' ? (
              <Sparkles className={`${currentSize.icon} text-amber-200 animate-bounce`} />
            ) : state === 'thinking' ? (
              <Bot className={`${currentSize.icon} text-secondary-light animate-spin duration-3000`} />
            ) : (
              <div className="flex flex-col items-center">
                {/* Empathetic Avatar Eyes & Smile */}
                <svg className="w-10 h-10 p-1 text-white" viewBox="0 0 100 100" fill="none">
                  {/* Gentle curved brow/eyes */}
                  <circle cx="34" cy="42" r="5" fill="#FFFDFC" />
                  <circle cx="66" cy="42" r="5" fill="#FFFDFC" />
                  <circle cx="36" cy="40" r="2" fill="#527D7D" />
                  <circle cx="68" cy="40" r="2" fill="#527D7D" />
                  {/* Warm gentle smile curve */}
                  <path d="M 36 60 Q 50 72, 64 60" stroke="#FFFDFC" strokeWidth="4" strokeLinecap="round" />
                  {/* Soft cheek blushes */}
                  <ellipse cx="26" cy="54" rx="5" ry="3" fill="#E8C1CA" opacity="0.6" />
                  <ellipse cx="74" cy="54" rx="5" ry="3" fill="#E8C1CA" opacity="0.6" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* State Badge Dot */}
        <div className="absolute -bottom-1.5 -right-1 flex items-center space-x-1 bg-surface border border-primary/30 px-2 py-0.5 rounded-full shadow-lg z-20">
          <span className={`w-2 h-2 rounded-full ${
            state === 'speaking' ? 'bg-primary animate-ping motion-reduce:animate-none' :
            state === 'listening' ? 'bg-primary animate-pulse motion-reduce:animate-none' :
            state === 'thinking' ? 'bg-secondary animate-pulse motion-reduce:animate-none' :
            isSafetySupport ? 'bg-risk-low animate-pulse motion-reduce:animate-none' :
            'bg-emerald-500'
          }`}></span>
          <span className="text-[9px] font-extrabold text-primary-dark uppercase tracking-wider">
            {state === 'speaking' ? 'Mitra Speaking' : 
             state === 'listening' ? 'Mitra Listening' : 
             state === 'thinking' ? 'Mitra Thinking' : 
             isSafetySupport ? 'Mitra Active' : 
             'Mitra Ready'}
          </span>
        </div>

      </div>

      {showText && (
        <div className="text-center space-y-1">
          <h4 className="text-xs font-bold text-text tracking-wide flex items-center justify-center space-x-1.5">
            <span className="bg-primary/10 text-primary-dark px-3 py-1 rounded-full border border-primary/30 shadow-sm font-semibold">
              Mitra &middot; AASRA Support Companion
            </span>
          </h4>
          {subtext && <p className={`text-text-muted max-w-sm ${currentSize.text}`}>{subtext}</p>}
        </div>
      )}
    </div>
  );
}

