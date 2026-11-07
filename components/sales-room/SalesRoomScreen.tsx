"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  ShoppingCart,
  Clock,
  Printer,
  X,
  CreditCard,
  Utensils
} from "lucide-react";
import { MdOutlineTableRestaurant } from "react-icons/md";

type SalesRoomTab = "dine-in" | "take-away" | "delivery";

interface TableData {
  id: string;
  name: string;
  status: "occupied" | "vacant" | "printed" | "multiple";
  orderNumber?: number;
  itemCount?: number;
  timeAgo?: string;
  amount?: number;
  customerName?: string;
}

interface TakeAwayOrder {
  id: string;
  orderNumber: number;
  timestamp: string;
  customer: string;
  amount: number;
  tax: number;
  isPrinted?: boolean;
}

interface DeliveryOrder {
  id: string;
  orderNumber: number;
  timestamp: string;
  customerName: string;
  phone: string;
  amount: number;
  tax: number;
  isPrinted?: boolean;
}

export function SalesRoomScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SalesRoomTab>("dine-in");
  const [currentTime, setCurrentTime] = useState<string>("10:24 AM");

  // Selected table or order modal
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<TakeAwayOrder | DeliveryOrder | null>(null);
  const [isNewDeliveryModalOpen, setIsNewDeliveryModalOpen] = useState<boolean>(false);
  const [deliveryCustomer, setDeliveryCustomer] = useState({ name: "", phone: "" });

  // Mock tables matching Screenshot 1
  const [tables] = useState<TableData[]>([
    {
      id: "t1",
      name: "T 1",
      status: "occupied",
      orderNumber: 14,
      itemCount: 2,
      timeAgo: "just now",
      amount: 7500.0,
      customerName: "Dine-in Guests",
    },
    {
      id: "t2",
      name: "T 2",
      status: "vacant",
    },
    {
      id: "t3",
      name: "T 3",
      status: "vacant",
    },
    {
      id: "t4",
      name: "T 4",
      status: "vacant",
    },
  ]);

  // Mock Take Away orders matching Screenshot 2
  const [takeAwayOrders] = useState<TakeAwayOrder[]>([
    {
      id: "ta-11",
      orderNumber: 11,
      timestamp: "10:15 AM, 07-11-2026",
      customer: "Cash Customer",
      amount: 5200.0,
      tax: 0.0,
      isPrinted: true,
    },
    {
      id: "ta-12",
      orderNumber: 12,
      timestamp: "10:16 AM, 07-11-2026",
      customer: "Cash Customer",
      amount: 7500.0,
      tax: 0.0,
      isPrinted: true,
    },
    {
      id: "ta-13",
      orderNumber: 13,
      timestamp: "10:16 AM, 07-11-2026",
      customer: "Cash Customer",
      amount: 18800.0,
      tax: 0.0,
      isPrinted: true,
    },
  ]);

  // Mock Delivery orders matching Screenshot 3
  const [deliveryOrders] = useState<DeliveryOrder[]>([
    {
      id: "del-9",
      orderNumber: 9,
      timestamp: "10:12 AM, 07-11-2026",
      customerName: "geodevinstitute",
      phone: "08117740042",
      amount: 3500.0,
      tax: 0.0,
      isPrinted: true,
    },
    {
      id: "del-10",
      orderNumber: 10,
      timestamp: "10:15 AM, 07-11-2026",
      customerName: "Abdullah",
      phone: "08133642798",
      amount: 4000.0,
      tax: 0.0,
      isPrinted: true,
    },
  ]);

  // Keep live time updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio synthesizer for tactile POS beep
  const playBeep = useCallback((freq = 800, duration = 0.035) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore
    }
  }, []);

  const handleTabChange = (tab: SalesRoomTab) => {
    playBeep(750, 0.03);
    setActiveTab(tab);
  };

  const handleTableClick = (table: TableData) => {
    playBeep(850, 0.04);
    if (table.status === "vacant") {
      // Start order on vacant table
      router.push(`/quick-sales?mode=dine-in&table=${encodeURIComponent(table.name)}`);
    } else {
      setSelectedTable(table);
    }
  };

  const handleStartNewOrder = () => {
    playBeep(900, 0.05);
    if (activeTab === "delivery") {
      setIsNewDeliveryModalOpen(true);
    } else {
      router.push("/quick-sales?mode=takeaway");
    }
  };

  return (
    <div className="h-screen w-screen bg-[#121212] text-white flex flex-col select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-[#232323] bg-[#121212] px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Link
            href="/"
            className="w-8 h-8 rounded-md bg-[#222222] hover:bg-[#2c2c2c] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Return to Dashboard Hub"
          >
            <ArrowLeft size={16} />
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange("dine-in")}
              className={`px-3.5 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                activeTab === "dine-in"
                  ? "border border-[#d36d17] text-white bg-[#1a1a1a] shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => handleTabChange("take-away")}
              className={`px-3.5 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                activeTab === "take-away"
                  ? "border border-[#d36d17] text-white bg-[#1a1a1a] shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              Take Away
            </button>
            <button
              onClick={() => handleTabChange("delivery")}
              className={`px-3.5 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-pointer ${
                activeTab === "delivery"
                  ? "border border-[#d36d17] text-white bg-[#1a1a1a] shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Top Right Action Button */}
        <div>
          {activeTab === "dine-in" ? (
            <button
              type="button"
              className="w-9 h-8 rounded-[4px] border border-[#16a34a]/60 bg-[#14321d] text-[#22c55e] flex items-center justify-center transition-all cursor-pointer hover:bg-[#194226]"
              title="Table Floor View"
              aria-label="Table Floor View"
            >
              <MdOutlineTableRestaurant size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartNewOrder}
              className="px-3.5 py-1.5 rounded-[4px] bg-[#0daa2b] hover:bg-[#0c9827] text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>New Order</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#181818] p-5 overflow-y-auto">
        {/* TAB 1: DINE IN (Screenshot 1) */}
        {activeTab === "dine-in" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {tables.map((table) => {
              const isOccupied = table.status === "occupied";
              return (
                <div
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className="relative aspect-square rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-zinc-600 transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm active:scale-[0.98] group"
                >
                  {/* Table Graphic (Circle with 4 surrounding chairs) */}
                  <div className="flex-1 flex items-center justify-center relative p-3">
                    {/* Top chair */}
                    <div className="absolute top-2 w-8 h-1 rounded-full bg-zinc-800 group-hover:bg-zinc-700" />
                    {/* Bottom chair */}
                    <div className="absolute bottom-2 w-8 h-1 rounded-full bg-zinc-800 group-hover:bg-zinc-700" />
                    {/* Left chair */}
                    <div className="absolute left-2 w-1 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-700" />
                    {/* Right chair */}
                    <div className="absolute right-2 w-1 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-700" />

                    {/* Central Table Circle */}
                    <div className="w-16 h-16 rounded-full bg-[#202020] border border-zinc-700/60 flex flex-col items-center justify-center p-1 text-center shadow-inner group-hover:border-zinc-500">
                      <span className="font-bold text-base text-white tracking-tight">
                        {table.name}
                      </span>

                      {/* Occupied table details */}
                      {isOccupied && (
                        <div className="flex flex-col items-center leading-none mt-0.5">
                          <span className="text-[10px] text-zinc-300 font-medium flex items-center gap-0.5">
                            #{table.orderNumber} | <ShoppingCart size={8} /> {table.itemCount}
                          </span>
                          <span className="text-[9px] text-zinc-400 flex items-center gap-0.5 mt-0.5">
                            <Clock size={8} /> {table.timeAgo}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Colored Status Strip matching Screenshot 1 */}
                  <div
                    className={`h-1.5 w-full ${
                      isOccupied ? "bg-[#f0534e]" : "bg-[#66bb6a]"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: TAKE AWAY (Screenshot 2) */}
        {activeTab === "take-away" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {takeAwayOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="rounded-lg bg-[#181818] border border-[#2a2a2a] p-3 space-y-2 hover:border-orange-500/50 transition-all cursor-pointer shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {order.timestamp}
                    </p>
                  </div>
                  {/* Three-dot menu button in orange box */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="w-6 h-6 rounded border border-[#d36d17] bg-[#121212] text-[#f97316] flex items-center justify-center hover:bg-[#d36d17]/10 cursor-pointer"
                    aria-label="Order actions"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                <div className="border-t border-[#242424] pt-2 space-y-0.5 text-xs">
                  <div className="text-zinc-300 font-medium">{order.customer}</div>
                  <div className="text-zinc-400 font-mono text-[11px]">
                    Amt : {order.amount.toFixed(2)} | Tax : {order.tax.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DELIVERY (Screenshot 3) */}
        {activeTab === "delivery" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {deliveryOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="rounded-lg bg-[#181818] border border-[#2a2a2a] p-3 space-y-2 hover:border-orange-500/50 transition-all cursor-pointer shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {order.timestamp}
                    </p>
                  </div>
                  {/* Three-dot menu button in orange box */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="w-6 h-6 rounded border border-[#d36d17] bg-[#121212] text-[#f97316] flex items-center justify-center hover:bg-[#d36d17]/10 cursor-pointer"
                    aria-label="Order actions"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                <div className="border-t border-[#242424] pt-2 space-y-0.5 text-xs">
                  <div className="text-zinc-300 font-medium truncate">
                    {order.customerName} | {order.phone}
                  </div>
                  <div className="text-zinc-400 font-mono text-[11px]">
                    Amt : {order.amount.toFixed(2)} | Tax : {order.tax.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Status Bar matching screenshots */}
      <footer className="h-7 bg-[#121212] border-t border-[#1f1f1f] px-4 flex items-center justify-between text-xs text-zinc-400 z-20 shrink-0 select-none">
        {/* Left: Status Legend */}
        <div className="flex items-center gap-4 text-[11px]">
          {activeTab === "dine-in" ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[#66bb6a] inline-block" />
                <span>Vacant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f0534e] inline-block" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f59e0b] inline-block" />
                <span>Printed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6] inline-block" />
                <span>Multiple Order</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f59e0b] inline-block" />
              <span>Printed</span>
            </div>
          )}
        </div>

        {/* Right: Cashier & Time */}
        <div className="flex items-center gap-2 text-[11px]">
          <span>Cashier :</span>
          <span className="text-white font-medium">Admin</span>
          <span>|</span>
          <span className="font-mono">{currentTime}</span>
        </div>
      </footer>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[#1c1c1c] border border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">
                  {selectedTable.name}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Order #{selectedTable.orderNumber}</h3>
                  <span className="text-[10px] text-zinc-400">Occupied • {selectedTable.timeAgo}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Total Items:</span>
                <span className="text-white font-bold">{selectedTable.itemCount} items</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Bill Amount:</span>
                <span className="text-white font-mono font-bold">₦{selectedTable.amount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTable(null);
                  router.push(`/quick-sales?mode=dine-in&table=${encodeURIComponent(selectedTable.name)}`);
                }}
                className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Utensils size={14} /> Open in POS / Add Items
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Actions Modal (Take Away / Delivery) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[#1c1c1c] border border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Order #{selectedOrder.orderNumber}</h3>
                <span className="text-[10px] text-zinc-400">{selectedOrder.timestamp}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs font-mono bg-[#141414] p-3 rounded-lg border border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-400">Customer:</span>
                <span className="text-white">{"customer" in selectedOrder ? selectedOrder.customer : selectedOrder.customerName}</span>
              </div>
              {"phone" in selectedOrder && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Phone:</span>
                  <span className="text-white">{selectedOrder.phone}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Total Due:</span>
                <span className="text-emerald-400 font-bold">₦{selectedOrder.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  if ("customer" in selectedOrder) {
                    router.push(
                      `/quick-sales?mode=takeaway&customer=${encodeURIComponent(selectedOrder.customer)}&order=${selectedOrder.orderNumber}`
                    );
                  } else {
                    router.push(
                      `/quick-sales?mode=delivery&customer=${encodeURIComponent(selectedOrder.customerName)}&phone=${encodeURIComponent(selectedOrder.phone)}&order=${selectedOrder.orderNumber}`
                    );
                  }
                }}
                className="w-full py-2 px-3 rounded-lg bg-[#0daa2b] hover:bg-[#0c9827] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CreditCard size={14} /> Settle / Pay Order
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Delivery Modal */}
      {isNewDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[#1c1c1c] border border-zinc-800 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">New Delivery Order</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={deliveryCustomer.name}
                  onChange={(e) => setDeliveryCustomer((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Brother Tariq"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-700 bg-[#121212] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={deliveryCustomer.phone}
                  onChange={(e) => setDeliveryCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 08123456789"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-700 bg-[#121212] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                type="button"
                onClick={() => setIsNewDeliveryModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNewDeliveryModalOpen(false);
                  router.push(`/quick-sales?mode=delivery&customer=${encodeURIComponent(deliveryCustomer.name || "Delivery Customer")}`);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#0daa2b] hover:bg-[#0c9827] text-black font-bold cursor-pointer"
              >
                Continue to Menu &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
