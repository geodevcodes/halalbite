"use client";

import React from "react";
import { X, CheckCircle, WifiOff, Play } from "lucide-react";

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPin?: (pin: string) => void;
}

export function WalkthroughModal({ isOpen, onClose, onSelectPin }: WalkthroughModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#1a1a1a] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#161616]">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-semibold text-zinc-100">
              Offline Restaurant POS Walkthrough
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close walkthrough"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Video Placeholder / Demo Card */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center p-6 group">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 text-[#ea580c] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10">
              <Play className="fill-current ml-1" size={28} />
            </div>
            <h4 className="text-base font-semibold text-zinc-200">
              HalalBite POS System Tour
            </h4>
            <p className="text-xs text-zinc-400 max-w-md mt-1">
              Watch how our offline-first architecture allows rapid cashier PIN switching, split ticketing, table booking, and zero-downtime restaurant operations.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <WifiOff size={12} /> Offline Mode: 100% Functional Without Internet
            </span>
          </div>

          {/* Quick Steps */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              How to operate the POS login:
            </h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1.5">
                <div className="text-orange-500 font-bold text-sm">Step 1</div>
                <div className="text-xs font-semibold text-zinc-200">Enter Demo PIN</div>
                <p className="text-[11px] text-zinc-400">
                  Tap <span className="font-mono text-orange-400 font-bold">1 - 2 - 3</span> on the numeric keypad or use your physical keyboard.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1.5">
                <div className="text-emerald-500 font-bold text-sm">Step 2</div>
                <div className="text-xs font-semibold text-zinc-200">Tap Login</div>
                <p className="text-[11px] text-zinc-400">
                  Click the green <span className="text-emerald-400 font-semibold">Login</span> button or press <kbd className="px-1 py-0.5 text-[10px] bg-zinc-800 rounded">Enter</kbd> to unlock your shift.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1.5">
                <div className="text-blue-500 font-bold text-sm">Step 3</div>
                <div className="text-xs font-semibold text-zinc-200">Offline Ready</div>
                <p className="text-[11px] text-zinc-400">
                  Transactions, tables, and receipts are saved locally and synced automatically when online.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="text-xs font-semibold text-zinc-300">Terminal Features:</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                <span>Physical numpad & keyboard wedge support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                <span>Audio tactile feedback for touchscreens</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                <span>Fast cashier shift switching (under 2 sec)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                <span>Local encrypted storage (IndexedDB / SQLite)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-[#161616]">
          <span className="text-xs text-zinc-500">
            Demo Store PIN: <strong className="text-orange-400 font-mono">123</strong>
          </span>
          <div className="flex gap-2">
            {onSelectPin && (
              <button
                onClick={() => {
                  onSelectPin("123");
                  onClose();
                }}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-orange-500/20 text-[#ea580c] hover:bg-orange-500/30 transition-colors"
              >
                Auto-fill PIN & Close
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
