"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaWhatsapp, FaHeadset } from "react-icons/fa";
import { Volume2, VolumeX, AlertCircle } from "lucide-react";
import { WalkthroughModal } from "./WalkthroughModal";
import { SupportModal } from "./SupportModal";
import { PosDashboardHub } from "./PosDashboardHub";

export function PosLoginScreen() {
  const [pin, setPin] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals state
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [supportModal, setSupportModal] = useState<{ isOpen: boolean; type: "support" | "whatsapp" }>({
    isOpen: false,
    type: "support",
  });

  // Authenticated state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Synthesize tactile POS beep using Web Audio API
  const playBeep = useCallback((freq = 700, duration = 0.04) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted yet or not supported, ignore safely
    }
  }, [soundEnabled]);

  const playErrorTone = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Handle number key press
  const handleDigit = useCallback((digit: string) => {
    playBeep(850, 0.035);
    setErrorMessage("");
    setPin((prev) => (prev.length < 8 ? prev + digit : prev));
  }, [playBeep]);

  // Handle clear key press
  const handleClear = useCallback(() => {
    playBeep(520, 0.05);
    setPin("");
    setErrorMessage("");
  }, [playBeep]);

  // Handle login submit
  const handleLogin = useCallback(() => {
    if (!pin) {
      playErrorTone();
      setIsShaking(true);
      setErrorMessage("Please enter your PIN");
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // Default demo PIN is '123'
    if (pin === "123") {
      playBeep(1200, 0.1);
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 100);
    } else {
      playErrorTone();
      setIsShaking(true);
      setErrorMessage("Incorrect PIN. Demo store PIN is '123'");
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [pin, playBeep, playErrorTone]);

  // Keyboard wedge / Hardware Numpad listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if a modal is open
      if (isWalkthroughOpen || supportModal.isOpen || isAuthenticated) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        playBeep(580, 0.03);
        setPin((prev) => prev.slice(0, -1));
        setErrorMessage("");
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClear();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleLogin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDigit, handleClear, handleLogin, isWalkthroughOpen, supportModal.isOpen, isAuthenticated, playBeep]);

  // If logged in, show the full POS Dashboard Navigation Hub
  if (isAuthenticated) {
    return (
      <PosDashboardHub
        cashierName="Admin"
        onLogout={() => {
          setIsAuthenticated(false);
          setPin("");
          setErrorMessage("");
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row select-none bg-[#121212] overflow-hidden">
      {/* Top subtle controls bar */}
      <div className="absolute top-3 right-4 z-20 flex items-center justify-end pointer-events-none">
        {/* Audio feedback toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute touch sound" : "Enable touch sound"}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={12} className="text-emerald-400" />
                <span>Sound On</span>
              </>
            ) : (
              <>
                <VolumeX size={12} className="text-zinc-500" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LEFT HALF: Restaurant Brand Presentation */}
      <div className="w-full md:w-1/2 min-h-[38vh] md:min-h-screen bg-[#1d1d1d] flex flex-col items-center justify-center p-8 transition-colors">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-[#dfdfdf]">
            Halal Bite Demo
          </h1>
          <p className="text-sm font-medium text-[#22c55e] flex items-center justify-center gap-1.5">
            Cloud
          </p>
        </div>
      </div>

      {/* RIGHT HALF: Numeric PIN Pad Login */}
      <div className="w-full md:w-1/2 min-h-[62vh] md:min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-[340px] flex flex-col items-center">
          {/* PIN Input Display Box */}
          <div
            className={`w-full h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] px-4 flex items-center justify-end relative shadow-inner transition-all ${
              isShaking ? "animate-shake border-red-500" : ""
            }`}
          >
            {/* Masked PIN Dots (matching reference image) */}
            <div className="flex items-center gap-2 h-full">
              {pin.length > 0 ? (
                Array.from({ length: pin.length }).map((_, idx) => (
                  <span
                    key={idx}
                    className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-sm animate-in zoom-in-50 duration-100"
                  />
                ))
              ) : (
                <span className="text-zinc-600 text-xs italic select-none">
                  Enter PIN
                </span>
              )}
            </div>
          </div>

          {/* Error Message notice if incorrect PIN */}
          {errorMessage && (
            <div className="w-full mt-2 px-2 py-1 rounded bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle size={13} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 3x4 Keypad Grid */}
          <div className="w-full grid grid-cols-3 gap-2.5 mt-2.5">
            {/* Row 1 */}
            <button
              type="button"
              onClick={() => handleDigit("1")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleDigit("2")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleDigit("3")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              3
            </button>

            {/* Row 2 */}
            <button
              type="button"
              onClick={() => handleDigit("4")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleDigit("5")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleDigit("6")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              6
            </button>

            {/* Row 3 */}
            <button
              type="button"
              onClick={() => handleDigit("7")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleDigit("8")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleDigit("9")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              9
            </button>

            {/* Row 4: Clear, 0, Login */}
            <button
              type="button"
              onClick={handleClear}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-lg flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit("0")}
              className="h-[54px] rounded-[3px] border border-[#d36d17] bg-[#121212] text-[#f97316] font-bold text-2xl flex items-center justify-center hover:bg-[#1f1a14] active:bg-[#d36d17]/25 active:scale-[0.97] transition-all cursor-pointer shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleLogin}
              className="h-[54px] rounded-[3px] bg-[#0daa2b] hover:bg-[#0c9827] active:bg-[#0a8221] active:scale-[0.97] text-black font-bold text-lg flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              Login
            </button>
          </div>

          {/* Helper captions beneath the keypad */}
          <div className="mt-6 text-center space-y-1">
            <p className="text-xs sm:text-[13px] italic text-[#9c9c9c]">
              Default PIN for demo store is &apos;123&apos;
            </p>
            <p
              onClick={() => setIsWalkthroughOpen(true)}
              className="text-xs sm:text-[13px] italic text-[#9c9c9c] hover:text-white transition-colors cursor-pointer"
            >
              Click here to watch walkthrough video
            </p>
          </div>
        </div>

        {/* Floating action buttons in bottom right corner */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-center z-30">
          {/* WhatsApp Floating Button */}
          <button
            onClick={() => setSupportModal({ isOpen: true, type: "whatsapp" })}
            className="w-11 h-11 rounded-full border-2 border-[#16a34a] text-[#16a34a] bg-[#121212]/90 hover:bg-[#16a34a]/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            title="Chat on WhatsApp"
            aria-label="WhatsApp Support"
          >
            <FaWhatsapp size={20} />
          </button>

          {/* Customer Support Headset Floating Button */}
          <button
            onClick={() => setSupportModal({ isOpen: true, type: "support" })}
            className="w-11 h-11 rounded-full border-2 border-[#10b981] text-[#10b981] bg-[#121212]/90 hover:bg-[#10b981]/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
            title="Helpdesk & Diagnostics"
            aria-label="Helpdesk & Diagnostics"
          >
            <FaHeadset size={18} />
          </button>
        </div>
      </div>

      {/* Walkthrough Video Modal */}
      <WalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onSelectPin={(demoPin) => {
          setPin(demoPin);
        }}
      />

      {/* Support / WhatsApp Dialog */}
      <SupportModal
        isOpen={supportModal.isOpen}
        type={supportModal.type}
        onClose={() => setSupportModal({ isOpen: false, type: "support" })}
      />
    </div>
  );
}
