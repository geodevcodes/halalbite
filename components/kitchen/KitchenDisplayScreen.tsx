"use client";

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCw,
  Maximize2,
  Minimize2,
  Printer,
  Flame,
  Check,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Utensils,
  Bike,
  ShoppingBag,
} from "lucide-react";

import {
  KitchenTicket,
  KitchenStation,
} from "./types";
import { INITIAL_KITCHEN_TICKETS } from "./mockKitchenTickets";

// External clock store for live elapsed time updates (cached to avoid infinite render loop)
let currentClock = 0;
const clockListeners = new Set<() => void>();
let clockInterval: ReturnType<typeof setInterval> | null = null;

function subscribeToClock(callback: () => void) {
  clockListeners.add(callback);
  if (clockListeners.size === 1 && !clockInterval) {
    currentClock = Date.now();
    clockInterval = setInterval(() => {
      currentClock = Date.now();
      clockListeners.forEach((cb) => cb());
    }, 10000);
  }
  return () => {
    clockListeners.delete(callback);
    if (clockListeners.size === 0 && clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  };
}

function getClockSnapshot() {
  if (currentClock === 0) {
    currentClock = Date.now();
  }
  return currentClock;
}

function getClockServerSnapshot() {
  return 0;
}

export function KitchenDisplayScreen() {
  const [tickets, setTickets] = useState<KitchenTicket[]>(INITIAL_KITCHEN_TICKETS);
  const [activeTab, setActiveTab] = useState<"open" | "completed">("open");
  const [selectedStation, setSelectedStation] = useState<KitchenStation>("All Stations");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active KOT print modal preview
  const [previewKotTicket, setPreviewKotTicket] = useState<KitchenTicket | null>(null);

  // Live timer subscribed via useSyncExternalStore
  const currentMs = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot
  );

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  }, []);

  // Web Audio Kitchen Bell chime
  const playKitchenBell = useCallback((type: "start" | "done" | "chime" = "chime") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "start") {
        // High upbeat bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "done") {
        // Two-tone double ding
        const playTone = (freq: number, startDelay: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + startDelay);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + startDelay);
          osc.stop(ctx.currentTime + startDelay + 0.3);
        };
        playTone(987.77, 0); // B5
        playTone(1318.51, 0.12); // E6
      } else {
        // Soft click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen change event
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Filter open vs completed
  const openTickets = useMemo(() => {
    return tickets.filter((t) => t.status === "queued" || t.status === "cooking");
  }, [tickets]);

  const completedTickets = useMemo(() => {
    return tickets.filter((t) => t.status === "completed");
  }, [tickets]);

  // Visible tickets according to tab, station, and search
  const visibleTickets = useMemo(() => {
    const list = activeTab === "open" ? openTickets : completedTickets;
    return list.filter((t) => {
      // Station filter
      if (selectedStation !== "All Stations") {
        const hasStationItem = t.items.some((i) => i.station === selectedStation);
        if (!hasStationItem) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesOrder = String(t.orderNumber).includes(q);
        const matchesTable = t.roomTable?.toLowerCase().includes(q) ?? false;
        const matchesType = t.orderType.toLowerCase().includes(q);
        const matchesItem = t.items.some((i) => i.name.toLowerCase().includes(q));
        const matchesCustomer = t.customerName?.toLowerCase().includes(q) ?? false;
        if (!matchesOrder && !matchesTable && !matchesType && !matchesItem && !matchesCustomer) {
          return false;
        }
      }
      return true;
    });
  }, [activeTab, openTickets, completedTickets, selectedStation, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    return {
      open: openTickets.length,
      completed: completedTickets.length,
      cooking: openTickets.filter((t) => t.status === "cooking").length,
      queued: openTickets.filter((t) => t.status === "queued").length,
    };
  }, [openTickets, completedTickets]);

  // Actions
  const handleStartCooking = (ticketId: string, orderNum: number) => {
    playKitchenBell("start");
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: "cooking",
            startedAt: Date.now(),
          };
        }
        return t;
      })
    );
    showToast(`Order #${orderNum} cooking started!`);
  };

  const handleMarkDone = (ticketId: string, orderNum: number) => {
    playKitchenBell("done");
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: "completed",
            completedAt: Date.now(),
            items: t.items.map((i) => ({ ...i, isReady: true })),
          };
        }
        return t;
      })
    );
    showToast(`Order #${orderNum} marked Ready & Plated!`);
  };

  const handleRecallToKitchen = (ticketId: string, orderNum: number) => {
    playKitchenBell("chime");
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: "cooking",
            completedAt: undefined,
          };
        }
        return t;
      })
    );
    showToast(`Order #${orderNum} recalled back to Kitchen!`);
  };

  const handleToggleItemReady = (ticketId: string, itemId: string) => {
    playKitchenBell("chime");
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            items: t.items.map((it) => {
              if (it.id === itemId) {
                return { ...it, isReady: !it.isReady };
              }
              return it;
            }),
          };
        }
        return t;
      })
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    playKitchenBell("chime");
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Kitchen tickets updated from POS");
    }, 500);
  };

  // Helper to calculate elapsed minutes
  const getElapsedMinutes = (startMs: number) => {
    if (!currentMs) return 0;
    const diff = Math.max(0, currentMs - startMs);
    return Math.floor(diff / 60000);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#141414] border-b border-[#232323] px-4 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-[4px] bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
            title="Back to POS Hub"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-white font-bold text-base tracking-wide">
              Kitchen Display
            </h1>
            <span className="text-[11px] text-[#22c55e] font-semibold bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded">
              HalalBite KDS
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Open (6) Pill Button (Green when active) */}
          <button
            type="button"
            onClick={() => {
              playKitchenBell("chime");
              setActiveTab("open");
            }}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "open"
                ? "bg-[#0daa2b] hover:bg-[#0c9827] text-black shadow-sm"
                : "bg-[#202020] hover:bg-[#282828] text-neutral-300 border border-[#333]"
            }`}
          >
            <span>Open</span>
            <span>({counts.open})</span>
          </button>

          {/* Completed (2) Pill Button */}
          <button
            type="button"
            onClick={() => {
              playKitchenBell("chime");
              setActiveTab("completed");
            }}
            className={`px-3.5 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "completed"
                ? "bg-[#0daa2b] hover:bg-[#0c9827] text-black shadow-sm"
                : "bg-[#202020] hover:bg-[#282828] text-neutral-300 border border-[#333]"
            }`}
          >
            <span>Completed</span>
            <span>({counts.completed})</span>
          </button>

          {/* All Stations Dropdown */}
          <div className="relative">
            <select
              value={selectedStation}
              onChange={(e) => {
                playKitchenBell("chime");
                setSelectedStation(e.target.value as KitchenStation);
              }}
              className="bg-[#1c1c1c] text-white px-2.5 py-1.5 rounded-[4px] border border-[#333] text-xs font-medium cursor-pointer focus:outline-none focus:border-[#d36d17]"
            >
              <option value="All Stations">All Stations</option>
              <option value="Kitchen Main (Hot Food)">Kitchen Main (Hot Food)</option>
              <option value="Grill & BBQ">Grill & BBQ</option>
              <option value="Dessert & Drinks">Dessert & Drinks</option>
            </select>
          </div>

          {/* Audio Chime Mute/Unmute */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`w-8 h-8 rounded-[4px] border flex items-center justify-center transition-colors ${
              soundEnabled
                ? "bg-[#1f1f1f] border-[#383838] text-[#22c55e]"
                : "bg-[#181818] border-[#2e2e2e] text-neutral-500"
            }`}
            title={soundEnabled ? "Mute Kitchen Chime" : "Enable Kitchen Chime"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-[4px] bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] flex items-center justify-center text-neutral-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh tickets from POS"
          >
            <RotateCw
              size={15}
              className={isRefreshing ? "animate-spin text-[#d36d17]" : ""}
            />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="w-8 h-8 rounded-[4px] bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] flex items-center justify-center text-neutral-300 hover:text-white transition-all"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Sub-bar: Kitchen Stats & Search Strip */}
      <div className="bg-[#141414] border-b border-[#222222] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick KDS Analytics */}
        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-[#ff7800] animate-pulse" />
            <span>Cooking Now:</span>
            <strong className="text-white">{counts.cooking}</strong>
          </div>
          <span className="text-neutral-700">•</span>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-neutral-400" />
            <span>In Queue:</span>
            <strong className="text-white">{counts.queued}</strong>
          </div>
          <span className="text-neutral-700">•</span>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Clock size={12} className="text-amber-400" />
            <span>Target Prep:</span>
            <strong className="text-[#22c55e]">≤ 15 mins</strong>
          </div>
        </div>

        {/* Quick Search filter */}
        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, table, item..."
            className="w-full bg-[#181818] border border-[#333] text-white text-xs px-2.5 py-1 pr-7 rounded focus:outline-none focus:border-[#d36d17] placeholder:text-neutral-500"
          />
          <Search
            size={13}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Main KDS Grid Container */}
      <main className="flex-1 p-4 overflow-y-auto">
        {visibleTickets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {visibleTickets.map((ticket) => {
              const isCooking = ticket.status === "cooking";
              const isCompleted = ticket.status === "completed";
              const isQueued = ticket.status === "queued";
              const elapsedMins = getElapsedMinutes(ticket.createdAt);
              const isLate = elapsedMins > 15;

              return (
                <div
                  key={ticket.id}
                  className={`flex flex-col rounded-lg overflow-hidden border shadow-lg transition-all duration-150 ${
                    isCooking
                      ? "border-[#ff7800]/50 ring-1 ring-[#ff7800]/30 bg-[#161616]"
                      : isCompleted
                      ? "border-[#24352b] bg-[#141815] opacity-90"
                      : "border-[#2a2a2a] bg-[#161616] hover:border-[#3a3a3a]"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`px-3 py-2.5 flex flex-col justify-between transition-colors ${
                      isCooking
                        ? "bg-[#ff7800] text-black"
                        : isCompleted
                        ? "bg-[#183624] text-white"
                        : "bg-[#858585] text-black"
                    }`}
                  >
                    {/* Top Row: Order Title & Red Time Pill + Icon */}
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm sm:text-base tracking-tight leading-none">
                        Order #{ticket.orderNumber}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Red Time Badge Pill (e.g. 10:12, 10:15, 10:16) */}
                        <span className="bg-[#ef4444] text-white font-bold text-[11px] px-2 py-0.5 rounded leading-none shadow-xs">
                          {ticket.timeString}
                        </span>

                        {/* Top-Right Icon */}
                        {isCooking ? (
                          <div
                            className="w-5 h-5 flex items-center justify-center text-black"
                            title="Actively Cooking"
                          >
                            <Flame size={18} className="fill-current animate-bounce" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPreviewKotTicket(ticket)}
                            className="w-5 h-5 flex items-center justify-center text-black hover:opacity-75 transition-opacity"
                            title="Reprint KOT Slip"
                          >
                            <Printer size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sub Row: 10:12 • KOT - 01 */}
                    <div className="flex items-center justify-between text-[11px] font-semibold mt-1 opacity-90">
                      <span>
                        {ticket.timeString} • {ticket.kotNumber}
                      </span>

                      {/* Live elapsed badge */}
                      {isCooking && (
                        <span className="text-[10px] font-bold bg-black/25 text-white px-1.5 py-0.2 rounded">
                          {elapsedMins}m in prep
                        </span>
                      )}
                      {isQueued && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isLate ? "bg-red-950 text-red-200" : "bg-black/20 text-neutral-800"
                          }`}
                        >
                          {elapsedMins}m ago
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-[#22c55e]">
                          Plated ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Channel Strip: Delivery / Take Away / Dine In - T 1 | Printer one */}
                  <div className="px-3 py-1.5 bg-[#121212] border-b border-[#232323] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      {ticket.orderType === "Delivery" ? (
                        <>
                          <Bike size={13} className="text-[#22c55e]" />
                          <span>Delivery</span>
                        </>
                      ) : ticket.orderType === "Take Away" ? (
                        <>
                          <ShoppingBag size={13} className="text-amber-400" />
                          <span>Take Away</span>
                        </>
                      ) : (
                        <>
                          <Utensils size={13} className="text-sky-400" />
                          <span>{ticket.roomTable || "Dine In"}</span>
                        </>
                      )}
                    </div>

                    <span className="text-neutral-400 text-[11px] font-mono">
                      {ticket.printerStation}
                    </span>
                  </div>

                  {/* Line Items List */}
                  <div className="p-3 flex-1 flex flex-col gap-2 min-h-[90px] bg-[#171717]">
                    {ticket.items.map((item) => {
                      const isItemReady = Boolean(item.isReady);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItemReady(ticket.id, item.id)}
                          className={`flex items-start justify-between p-1.5 rounded cursor-pointer transition-all border ${
                            isItemReady
                              ? "bg-neutral-900/40 border-neutral-800 opacity-40 line-through"
                              : "bg-[#1f1f1f] hover:bg-[#252525] border-[#292929]"
                          }`}
                          title="Click to mark item plated"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-extrabold text-sm text-white shrink-0">
                              {item.quantity}
                            </span>
                            <div>
                              <div
                                className={`text-xs font-semibold leading-tight ${
                                  isItemReady ? "text-neutral-400" : "text-white"
                                }`}
                              >
                                {item.name}
                              </div>
                              {item.notes && (
                                <div className="text-[10px] text-amber-400 font-medium mt-0.5 italic">
                                  * {item.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Item status check circle */}
                          <div className="shrink-0 pt-0.5">
                            {isItemReady ? (
                              <div className="w-4 h-4 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center">
                                <Check size={10} className="stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-neutral-600 hover:border-[#22c55e]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Customer Banner (if Delivery/Takeaway customer specified) */}
                  {ticket.customerName && (
                    <div className="px-3 py-1 bg-[#141414] border-t border-[#222] text-[10px] text-neutral-400 flex items-center justify-between">
                      <span className="truncate max-w-[140px]">
                        Guest: <strong className="text-neutral-200">{ticket.customerName}</strong>
                      </span>
                      {ticket.customerPhone && (
                        <span className="font-mono text-neutral-400">
                          {ticket.customerPhone}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Button */}
                  <div className="p-2.5 bg-[#121212] border-t border-[#232323]">
                    {isCooking && (
                      <button
                        type="button"
                        onClick={() => handleMarkDone(ticket.id, ticket.orderNumber)}
                        className="w-full py-2.5 rounded-[4px] bg-[#0daa2b] hover:bg-[#0c9827] active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Check size={16} className="stroke-[3]" />
                        <span>Mark Done</span>
                      </button>
                    )}

                    {isQueued && (
                      <button
                        type="button"
                        onClick={() => handleStartCooking(ticket.id, ticket.orderNumber)}
                        className="w-full py-2.5 rounded-[4px] bg-[#ff7800] hover:bg-[#ea6d00] active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Play size={15} className="fill-current" />
                        <span>Start</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleRecallToKitchen(ticket.id, ticket.orderNumber)}
                        className="w-full py-2 rounded-[4px] bg-[#1e293b] hover:bg-[#28394e] text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={13} />
                        <span>Recall to Kitchen</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-neutral-500 mb-3">
              <Sparkles size={28} className="text-[#22c55e]" />
            </div>
            <h2 className="text-base font-bold text-white">
              No tickets {activeTab === "open" ? "waiting in queue" : "completed yet"}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              {activeTab === "open"
                ? "The kitchen is completely caught up! New orders placed in Quick Sales or Rooms will pop up immediately."
                : "Finished tickets will be archived here for reference."}
            </p>
          </div>
        )}
      </main>

      {/* Reprint KOT Modal Preview */}
      {previewKotTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-lg max-w-sm w-full shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-[#282828] bg-[#1f1f1f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer size={16} className="text-[#f59e0b]" />
                <h3 className="text-white font-bold text-xs">
                  Reprint KOT Ticket • #{previewKotTicket.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewKotTicket(null)}
                className="text-neutral-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex justify-center bg-[#101010]">
              <div
                className="w-full max-w-[280px] bg-white text-black p-4 rounded font-mono text-xs shadow-md border border-neutral-300"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                <div className="text-center font-black text-sm pb-1 border-b-2 border-black">
                  *** KITCHEN ORDER TICKET ***
                </div>
                <div className="text-center text-[10px] text-neutral-600 mb-2">
                  HalalBite • {previewKotTicket.printerStation}
                </div>

                <div className="py-1.5 border-b border-dashed border-neutral-400 text-[11px] space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>ORDER #{previewKotTicket.orderNumber}</span>
                    <span>{previewKotTicket.kotNumber}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Type:</span>
                    <span>{previewKotTicket.orderType}</span>
                  </div>
                  {previewKotTicket.roomTable && (
                    <div className="flex justify-between text-neutral-700">
                      <span>Table:</span>
                      <span>{previewKotTicket.roomTable}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500 text-[10px]">
                    <span>Time:</span>
                    <span>{previewKotTicket.orderTime}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[10px]">
                    <span>Waiter:</span>
                    <span>{previewKotTicket.waiterName || "Admin"}</span>
                  </div>
                </div>

                <div className="py-2 border-b-2 border-black space-y-1.5 text-xs font-bold">
                  {previewKotTicket.items.map((it) => (
                    <div key={it.id}>
                      <div className="flex justify-between">
                        <span className="text-sm">{it.quantity}x</span>
                        <span className="text-right flex-1 ml-2">{it.name}</span>
                      </div>
                      {it.notes && (
                        <div className="text-[10px] text-red-600 italic font-semibold pl-4">
                          &gt; {it.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2 text-[10px] text-neutral-600 font-bold">
                  [REPRINT COPY - STATION DISPATCH]
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-[#161616] border-t border-[#282828] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewKotTicket(null)}
                className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white rounded bg-neutral-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  playKitchenBell("chime");
                  showToast(`KOT #${previewKotTicket.orderNumber} sent to printer!`);
                  setPreviewKotTicket(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-black bg-[#22c55e] hover:bg-[#16a34a] rounded flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1c] text-white border border-[#3a3a3a] px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 size={15} className="text-[#22c55e]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
