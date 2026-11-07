"use client";

import React from "react";
import { X, Headphones, CheckCircle2, HardDrive, Wifi } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "support" | "whatsapp";
}

export function SupportModal({ isOpen, onClose, type = "support" }: SupportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#1a1a1a] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#161616]">
          <div className="flex items-center gap-2.5">
            {type === "whatsapp" ? (
              <FaWhatsapp className="text-[#25D366] text-xl" />
            ) : (
              <Headphones className="text-emerald-400" size={20} />
            )}
            <h3 className="text-base font-semibold text-zinc-100">
              {type === "whatsapp" ? "WhatsApp POS Support" : "Terminal Helpdesk & Diagnostics"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          {type === "whatsapp" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 flex items-start gap-3">
                <FaWhatsapp className="text-[#25D366] text-3xl shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-zinc-100">Direct WhatsApp Assistance</div>
                  <p className="text-xs text-zinc-300">
                    Connect with your HalalBite store setup specialist or restaurant manager directly on WhatsApp.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="https://wa.me/?text=Hello%20HalalBite%20POS%20Support%2C%20I%20need%20assistance%20with%20my%20offline%20terminal."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <FaWhatsapp size={18} />
                  Start WhatsApp Chat
                </a>
                <p className="text-[11px] text-center text-zinc-500">
                  Available 24/7 for active restaurant service shifts
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Terminal Diagnostics
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <HardDrive size={13} className="text-orange-400" /> Local Storage Engine
                    </span>
                    <span className="text-emerald-400 font-mono font-medium">Ready (IndexedDB / SQLite)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Wifi size={13} className="text-blue-400" /> Mode
                    </span>
                    <span className="text-zinc-300 font-mono">Offline-First Capable</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-400">Terminal ID</span>
                    <span className="text-zinc-300 font-mono">TERM-MAIN-001</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-300 space-y-1">
                <div className="font-medium text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Quick Cashier Tip
                </div>
                <p className="text-zinc-400">
                  Default demo PIN is <strong className="text-orange-400 font-mono">123</strong>. You can type directly with hardware numpad or click the touch buttons.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#161616] border-t border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
