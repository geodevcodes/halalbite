"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useLegacyTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import {
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  RotateCw,
  Search,
  RotateCcw,
  Printer,
  Trash2,
  CreditCard,
  ChefHat,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Utensils,
  ShoppingBag,
  Bike,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

import {
  OrderSummaryRecord,
  OrderSummaryFilterTab,
  PaymentMethod,
} from "./types";
import { INITIAL_ORDER_RECORDS } from "./mockOrders";
import { ReceiptModal } from "./ReceiptModal";
import { KotModal } from "./KotModal";
import { SettleModal } from "./SettleModal";
import { VoidModal } from "./VoidModal";
import { OrderDrawer } from "./OrderDrawer";

export function OrderSummaryScreen() {
  const router = useRouter();

  // Orders State
  const [data, setData] = useState<OrderSummaryRecord[]>(INITIAL_ORDER_RECORDS);
  const [activeTab, setActiveTab] = useState<OrderSummaryFilterTab>("All");
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "orderNumber", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showStatsStrip, setShowStatsStrip] = useState<boolean>(true);

  // Active Modals & Selected Order
  const [inspectOrder, setInspectOrder] = useState<OrderSummaryRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [receiptTargetOrder, setReceiptTargetOrder] = useState<OrderSummaryRecord | null>(null);
  const [isKotModalOpen, setIsKotModalOpen] = useState<boolean>(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState<boolean>(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState<boolean>(false);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // Soft audio beep
  const playClickSound = useCallback((frequency = 700) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Filter Data by Active Tab
  const filteredData = useMemo(() => {
    if (activeTab === "All") return data;
    return data.filter((item) => item.status === activeTab);
  }, [data, activeTab]);

  // Tab dynamic counts
  const counts = useMemo(() => {
    return {
      all: data.length,
      running: data.filter((d) => d.status === "Running").length,
      settled: data.filter((d) => d.status === "Settled").length,
      voided: data.filter((d) => d.status === "Voided").length,
    };
  }, [data]);

  // Financial stats
  const stats = useMemo(() => {
    const totalRev = data.reduce((sum, d) => (d.status !== "Voided" ? sum + d.netAmount : sum), 0);
    const runningRev = data.reduce((sum, d) => (d.status === "Running" ? sum + d.netAmount : sum), 0);
    const settledRev = data.reduce((sum, d) => (d.status === "Settled" ? sum + d.netAmount : sum), 0);
    const validCount = data.filter((d) => d.status !== "Voided").length;
    const avgOrder = validCount > 0 ? totalRev / validCount : 0;
    return { totalRev, runningRev, settledRev, avgOrder };
  }, [data]);

  // Define Table Columns
  const columns = useMemo<LegacyColumnDef<OrderSummaryRecord, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              aria-label="Select all rows"
              checked={table.getIsAllPageRowsSelected()}
              ref={(input) => {
                if (input) {
                  input.indeterminate = table.getIsSomePageRowsSelected();
                }
              }}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="w-4 h-4 rounded bg-[#1e1e1e] border-[#555] text-[#d36d17] accent-[#d36d17] cursor-pointer"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              aria-label={`Select order ${row.original.orderNumber}`}
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              className="w-4 h-4 rounded bg-[#1e1e1e] border-[#555] text-[#d36d17] accent-[#d36d17] cursor-pointer"
            />
          </div>
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: "orderNumber",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-white font-semibold text-xs tracking-wider"
          >
            <span>Order</span>
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={14} className="text-[#22c55e]" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={14} className="text-[#22c55e]" />
            ) : (
              <ChevronsUpDown size={12} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = getValue() as number;
          return (
            <span className="font-bold text-[#22c55e] text-sm tracking-wide">
              {val}
            </span>
          );
        },
        size: 70,
      },
      {
        accessorKey: "time",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-white font-semibold text-xs tracking-wider"
          >
            <span>Time</span>
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={14} className="text-white" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={14} className="text-white" />
            ) : (
              <ChevronsUpDown size={12} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="text-neutral-300 text-xs whitespace-nowrap">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "orderType",
        header: "Order Type",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return (
            <div className="flex items-center gap-1.5">
              {val === "Dine In" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-800/40">
                  <Utensils size={11} />
                  <span>Dine In</span>
                </span>
              ) : val === "Take Away" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/50 text-amber-300 border border-amber-800/40">
                  <ShoppingBag size={11} />
                  <span>Take Away</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/40">
                  <Bike size={11} />
                  <span>Delivery</span>
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "roomTable",
        header: "Room - Table",
        cell: ({ getValue }) => {
          const val = (getValue() as string) || "—";
          return (
            <span className="text-neutral-300 text-xs font-medium">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "customer",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-white font-semibold text-xs tracking-wider"
          >
            <span>Customer</span>
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={14} className="text-white" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={14} className="text-white" />
            ) : (
              <ChevronsUpDown size={12} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const name = row.original.customer;
          const phone = row.original.customerPhone;
          if (!name) {
            return <span className="text-neutral-500 text-xs italic">Walk-in</span>;
          }
          return (
            <div>
              <span className="text-white text-xs font-semibold block">{name}</span>
              {phone && (
                <span className="text-neutral-400 text-[10px] block">{phone}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "waiter",
        header: "User - Waiter",
        cell: ({ getValue }) => (
          <span className="text-neutral-300 text-xs font-medium">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const val = getValue() as string;
          if (val === "Running") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Running</span>
              </span>
            );
          }
          if (val === "Settled") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
                <CheckCircle2 size={11} />
                <span>Settled</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
              <AlertCircle size={11} />
              <span>Voided</span>
            </span>
          );
        },
      },
      {
        accessorKey: "netAmount",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center justify-end w-full gap-1 hover:text-white font-semibold text-xs tracking-wider"
          >
            <span>Net Amount</span>
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={14} className="text-white" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={14} className="text-white" />
            ) : (
              <ChevronsUpDown size={12} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ getValue }) => {
          const val = getValue() as number;
          return (
            <div className="text-right">
              <span className="text-white text-xs font-bold font-mono tracking-wide">
                ₦{val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          );
        },
      },
    ],
    []
  );

  // TanStack Table Instance
  const table = useLegacyTable<OrderSummaryRecord>({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      rowSelection,
      sorting,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  // Selected Orders
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedOrders = useMemo(
    () => selectedRows.map((r) => r.original),
    [selectedRows]
  );
  const selectedCount = selectedOrders.length;

  // Bulk / Single Actions Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    playClickSound(850);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Order records refreshed from cloud");
    }, 600);
  };

  const handleTabChange = (tab: OrderSummaryFilterTab) => {
    playClickSound(650);
    setActiveTab(tab);
    setRowSelection({}); // reset selection on tab switch
  };

  // Action: Recall
  const handleRecall = (orderToRecall?: OrderSummaryRecord) => {
    playClickSound(720);
    const target = orderToRecall || selectedOrders[0];
    if (!target) return;

    if (target.status !== "Running") {
      showToast(`Order #${target.orderNumber} is already ${target.status.toLowerCase()} and cannot be recalled`);
      return;
    }

    showToast(`Recalling Order #${target.orderNumber} to Quick Sales...`);
    setTimeout(() => {
      router.push(`/quick-sales?orderId=${target.orderNumber}&type=${encodeURIComponent(target.orderType)}`);
    }, 400);
  };

  // Action: Print Receipt
  const handleOpenPrint = (orderToPrint?: OrderSummaryRecord) => {
    playClickSound(800);
    const target = orderToPrint || selectedOrders[0];
    if (!target) return;
    setReceiptTargetOrder(target);
    setIsReceiptModalOpen(true);
  };

  // Action: Reprint KOT
  const handleOpenKot = () => {
    playClickSound(750);
    if (selectedOrders.length === 0) return;
    setIsKotModalOpen(true);
  };

  // Action: Settle
  const handleOpenSettle = () => {
    playClickSound(750);
    if (selectedOrders.length === 0) return;
    setIsSettleModalOpen(true);
  };

  // Action: Void
  const handleOpenVoid = () => {
    playClickSound(500);
    if (selectedOrders.length === 0) return;
    setIsVoidModalOpen(true);
  };

  // Mutation: Settle Execution
  const handleExecuteSettle = (orderIds: string[], paymentMethod: PaymentMethod) => {
    setData((prev) =>
      prev.map((ord) => {
        if (orderIds.includes(ord.id)) {
          return {
            ...ord,
            status: "Settled",
            paymentMethod,
            receiptPrintedCount: ord.receiptPrintedCount + 1,
          };
        }
        return ord;
      })
    );
    setRowSelection({});
    if (inspectOrder && orderIds.includes(inspectOrder.id)) {
      setInspectOrder((prev) => (prev ? { ...prev, status: "Settled", paymentMethod } : null));
    }
    showToast(
      `Successfully settled ${orderIds.length} order${orderIds.length > 1 ? "s" : ""} via ${paymentMethod}`
    );
  };

  // Mutation: Void Execution
  const handleExecuteVoid = (orderIds: string[], reason: string) => {
    setData((prev) =>
      prev.map((ord) => {
        if (orderIds.includes(ord.id)) {
          return {
            ...ord,
            status: "Voided",
            voidReason: reason,
          };
        }
        return ord;
      })
    );
    setRowSelection({});
    if (inspectOrder && orderIds.includes(inspectOrder.id)) {
      setInspectOrder((prev) => (prev ? { ...prev, status: "Voided", voidReason: reason } : null));
    }
    showToast(`Voided ${orderIds.length} order${orderIds.length > 1 ? "s" : ""}`);
  };

  // Mutation: KOT Reprinted
  const handleExecuteKotReprint = (orderIds: string[]) => {
    setData((prev) =>
      prev.map((ord) => {
        if (orderIds.includes(ord.id)) {
          return {
            ...ord,
            kotPrintedCount: ord.kotPrintedCount + 1,
          };
        }
        return ord;
      })
    );
    showToast(`KOT dispatched for ${orderIds.length} order${orderIds.length > 1 ? "s" : ""}`);
  };

  // Mutation: Receipt Printed
  const handleExecuteReceiptPrinted = (orderId: string) => {
    setData((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            receiptPrintedCount: ord.receiptPrintedCount + 1,
          };
        }
        return ord;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-[#141414] border-b border-[#232323] px-4 flex items-center justify-between">
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
              Order Summary
            </h1>
            <span className="text-[11px] text-[#22c55e] font-semibold bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded">
              HalalBite Live
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowStatsStrip((prev) => !prev)}
            className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors border ${
              showStatsStrip
                ? "bg-[#1f1f1f] text-[#d36d17] border-[#d36d17]/40"
                : "bg-transparent text-neutral-400 border-transparent hover:bg-[#1f1f1f]"
            }`}
            title="Toggle Analytics Summary"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Stats</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-[4px] bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] flex items-center justify-center text-neutral-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Orders"
          >
            <RotateCw
              size={16}
              className={isRefreshing ? "animate-spin text-[#d36d17]" : ""}
            />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 pt-14 flex flex-col max-w-[1920px] w-full mx-auto">
        {/* KPI Stat Strip */}
        {showStatsStrip && (
          <div className="px-4 pt-3 pb-1 border-b border-[#202020] bg-[#141414]/80 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#181818] border border-[#262626] rounded-md p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">
                    Total Revenue
                  </span>
                  <span className="text-base font-extrabold text-white">
                    ₦{stats.totalRev.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-8 h-8 rounded bg-[#1e293b] text-sky-400 flex items-center justify-center text-xs font-bold">
                  {counts.all}
                </div>
              </div>

              <div className="bg-[#181818] border border-[#262626] rounded-md p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Running Orders
                  </span>
                  <span className="text-base font-extrabold text-white">
                    ₦{stats.runningRev.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-8 h-8 rounded bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center text-xs font-bold">
                  {counts.running}
                </div>
              </div>

              <div className="bg-[#181818] border border-[#262626] rounded-md p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#22c55e] uppercase tracking-wider block">
                    Settled Paid
                  </span>
                  <span className="text-base font-extrabold text-[#22c55e]">
                    ₦{stats.settledRev.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-8 h-8 rounded bg-emerald-950/40 border border-emerald-800/40 text-[#22c55e] flex items-center justify-center text-xs font-bold">
                  {counts.settled}
                </div>
              </div>

              <div className="bg-[#181818] border border-[#262626] rounded-md p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">
                    Avg Ticket Value
                  </span>
                  <span className="text-base font-extrabold text-white">
                    ₦{stats.avgOrder.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-8 h-8 rounded bg-[#252525] text-neutral-300 flex items-center justify-center text-xs font-bold">
                  ₦
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs & Search Bar Row */}
        <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#202020] bg-[#131313]">
          {/* Status Tabs (Screenshot 1: All (7), Running (7), Settled (0), Voided (0)) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {/* All */}
            <button
              type="button"
              onClick={() => handleTabChange("All")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "All"
                  ? "border border-[#d36d17] bg-[#1a1410] text-[#d36d17] font-semibold"
                  : "border border-transparent bg-transparent text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <span>All</span>
              <span className="text-[#22c55e] font-bold text-[11px]">
                {counts.all}
              </span>
            </button>

            {/* Running */}
            <button
              type="button"
              onClick={() => handleTabChange("Running")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "Running"
                  ? "border border-[#d36d17] bg-[#1a1410] text-[#d36d17] font-semibold"
                  : "border border-transparent bg-transparent text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <span>Running</span>
              <span className="text-[#22c55e] font-bold text-[11px]">
                {counts.running}
              </span>
            </button>

            {/* Settled */}
            <button
              type="button"
              onClick={() => handleTabChange("Settled")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "Settled"
                  ? "border border-[#d36d17] bg-[#1a1410] text-[#d36d17] font-semibold"
                  : "border border-transparent bg-transparent text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <span>Settled</span>
              <span className="text-[#22c55e] font-bold text-[11px]">
                {counts.settled}
              </span>
            </button>

            {/* Voided */}
            <button
              type="button"
              onClick={() => handleTabChange("Voided")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "Voided"
                  ? "border border-[#d36d17] bg-[#1a1410] text-[#d36d17] font-semibold"
                  : "border border-transparent bg-transparent text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <span>Voided</span>
              <span className="text-[#22c55e] font-bold text-[11px]">
                {counts.voided}
              </span>
            </button>
          </div>

          {/* Search Input (Screenshot 1: orange border on right) */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#161616] border border-[#d36d17] text-white text-xs px-3 py-1.5 pr-8 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#d36d17] placeholder:text-neutral-500"
            />
            <Search
              size={15}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#d36d17] pointer-events-none"
            />
          </div>
        </div>

        {/* Bulk Action Bar (Screenshot 2: Appears when row(s) selected) */}
        {selectedCount > 0 && (
          <div className="px-4 py-2 bg-[#171717] border-b border-[#282828] flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            {/* Green selected count label */}
            <div className="text-xs font-semibold text-[#22c55e] flex items-center gap-2">
              <span>{selectedCount} record(s) selected</span>
              <button
                type="button"
                onClick={() => setRowSelection({})}
                className="text-neutral-400 hover:text-white underline text-[11px] ml-1"
              >
                Clear
              </button>
            </div>

            {/* Action Buttons: Recall, Print, Void, Settle, Reprint KOT */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Recall */}
              <button
                type="button"
                onClick={() => handleRecall()}
                className="px-3 py-1 rounded-[4px] bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#383838] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Recall order to POS Quick Sales"
              >
                <RotateCcw size={13} className="text-[#38bdf8]" />
                <span>Recall</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={() => handleOpenPrint()}
                className="px-3 py-1 rounded-[4px] bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#383838] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print Receipt"
              >
                <Printer size={13} className="text-[#22c55e]" />
                <span>Print</span>
              </button>

              {/* Void */}
              <button
                type="button"
                onClick={handleOpenVoid}
                className="px-3 py-1 rounded-[4px] bg-[#221616] hover:bg-[#2f1b1b] border border-red-900/50 text-red-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Void selected orders"
              >
                <Trash2 size={13} />
                <span>Void</span>
              </button>

              {/* Settle */}
              <button
                type="button"
                onClick={handleOpenSettle}
                className="px-3.5 py-1 rounded-[4px] bg-[#0daa2b] hover:bg-[#0c9827] text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Settle selected orders"
              >
                <CreditCard size={13} />
                <span>Settle</span>
              </button>

              {/* Reprint KOT */}
              <button
                type="button"
                onClick={handleOpenKot}
                className="px-3 py-1 rounded-[4px] bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#383838] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reprint Kitchen Order Ticket"
              >
                <ChefHat size={13} className="text-[#f59e0b]" />
                <span>Reprint KOT</span>
              </button>
            </div>
          </div>
        )}

        {/* TanStack Table Container */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header (Navy/Slate tint matching Screenshot) */}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-[#182230] border-b border-[#223348] text-neutral-300 text-xs font-semibold"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      className="px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap first:pl-4 last:pr-4"
                    >
                      {header.isPlaceholder ? null : (
                        <div>
                          {typeof header.column.columnDef.header === "function"
                            ? header.column.columnDef.header(header.getContext())
                            : header.column.columnDef.header}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#1e1e1e] bg-[#111111]">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const isSelected = row.getIsSelected();
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        playClickSound(600);
                        setInspectOrder(row.original);
                      }}
                      className={`transition-colors cursor-pointer group ${
                        isSelected
                          ? "bg-[#251e18] hover:bg-[#2d241d]"
                          : "hover:bg-[#181818]"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3.5 py-2.5 text-xs whitespace-nowrap first:pl-4 last:pr-4 align-middle"
                        >
                          {typeof cell.column.columnDef.cell === "function"
                            ? cell.column.columnDef.cell(cell.getContext())
                            : (cell.getValue() as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-neutral-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-600">
                        <Search size={22} />
                      </div>
                      <div className="font-medium text-neutral-400">
                        No orders found matching filter
                      </div>
                      <p className="text-xs text-neutral-600">
                        Try changing the status tab or clearing your search term.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-4 py-3 bg-[#141414] border-t border-[#232323] flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-white">
                {table.getRowModel().rows.length}
              </strong>{" "}
              of <strong className="text-white">{filteredData.length}</strong> orders
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="hidden sm:inline">
              Page{" "}
              <strong className="text-white">
                {table.getState().pagination.pageIndex + 1}
              </strong>{" "}
              of <strong className="text-white">{table.getPageCount() || 1}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Rows Per Page */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="hidden sm:inline">Rows:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="bg-[#202020] text-white px-2 py-1 rounded border border-[#333] text-xs focus:outline-none focus:border-[#d36d17]"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2.5 py-1 rounded bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white border border-[#333] text-xs disabled:opacity-30 disabled:hover:bg-[#1e1e1e] cursor-pointer"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2.5 py-1 rounded bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white border border-[#333] text-xs disabled:opacity-30 disabled:hover:bg-[#1e1e1e] cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Slide-out Order Details Drawer */}
      <OrderDrawer
        order={inspectOrder}
        isOpen={Boolean(inspectOrder)}
        onClose={() => setInspectOrder(null)}
        onRecall={(o) => handleRecall(o)}
        onPrint={(o) => handleOpenPrint(o)}
        onReprintKot={(o) => {
          setReceiptTargetOrder(o);
          setIsKotModalOpen(true);
        }}
        onSettle={(o) => {
          setRowSelection({ [o.id]: true });
          setIsSettleModalOpen(true);
        }}
        onVoid={(o) => {
          setRowSelection({ [o.id]: true });
          setIsVoidModalOpen(true);
        }}
      />

      {/* Printable Thermal Receipt Modal */}
      <ReceiptModal
        order={receiptTargetOrder}
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setReceiptTargetOrder(null);
        }}
        onPrinted={handleExecuteReceiptPrinted}
      />

      {/* Kitchen Order Ticket (KOT) Modal */}
      <KotModal
        orders={receiptTargetOrder ? [receiptTargetOrder] : selectedOrders}
        isOpen={isKotModalOpen}
        onClose={() => setIsKotModalOpen(false)}
        onReprinted={handleExecuteKotReprint}
      />

      {/* Settle Order(s) Modal */}
      <SettleModal
        orders={selectedOrders.length > 0 ? selectedOrders : inspectOrder ? [inspectOrder] : []}
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        onSettle={handleExecuteSettle}
      />

      {/* Void Order(s) Modal */}
      <VoidModal
        orders={selectedOrders.length > 0 ? selectedOrders : inspectOrder ? [inspectOrder] : []}
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        onVoid={handleExecuteVoid}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1c] text-white border border-[#3a3a3a] px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
