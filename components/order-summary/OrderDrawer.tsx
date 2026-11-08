"use client";

import React from "react";
import {
  X,
  Printer,
  RotateCcw,
  CreditCard,
  Trash2,
  Clock,
  User,
  MapPin,
  Phone,
  ChefHat,
  Receipt,
} from "lucide-react";
import { OrderSummaryRecord } from "./types";

interface OrderDrawerProps {
  order: OrderSummaryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecall: (order: OrderSummaryRecord) => void;
  onPrint: (order: OrderSummaryRecord) => void;
  onReprintKot: (order: OrderSummaryRecord) => void;
  onSettle: (order: OrderSummaryRecord) => void;
  onVoid: (order: OrderSummaryRecord) => void;
}

export function OrderDrawer({
  order,
  isOpen,
  onClose,
  onRecall,
  onPrint,
  onReprintKot,
  onSettle,
  onVoid,
}: OrderDrawerProps) {
  if (!isOpen || !order) return null;

  const isRunning = order.status === "Running";
  const isSettled = order.status === "Settled";
  const isVoided = order.status === "Voided";

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#161616] border-l border-[#262626] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-label="Order Details"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#242424] bg-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center font-bold text-[#22c55e] text-base">
              #{order.orderNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base leading-none">
                  Order #{order.orderNumber}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isRunning
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : isSettled
                      ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30"
                      : "bg-red-500/15 text-red-400 border border-red-500/30"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                <Clock size={12} />
                <span>{order.time}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#1e1e1e] p-3.5 rounded-lg border border-[#2c2c2c] text-xs">
            <div>
              <span className="text-neutral-400 text-[11px] block">Order Type</span>
              <span className="font-semibold text-white mt-0.5 block">{order.orderType}</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[11px] block">Room - Table</span>
              <span className="font-semibold text-white mt-0.5 block">
                {order.roomTable || "Direct Counter"}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 text-[11px] block">Customer</span>
              <span className="font-semibold text-white mt-0.5 block">
                {order.customer || "Walk-in Guest"}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 text-[11px] block">Server / Cashier</span>
              <span className="font-semibold text-white mt-0.5 block flex items-center gap-1">
                <User size={12} className="text-neutral-400" />
                {order.waiter}
              </span>
            </div>

            {order.customerPhone && (
              <div className="col-span-2 pt-2 border-t border-[#2a2a2a] flex items-center gap-1.5 text-neutral-300">
                <Phone size={12} className="text-[#22c55e]" />
                <span>Phone: {order.customerPhone}</span>
              </div>
            )}

            {order.customerAddress && (
              <div className="col-span-2 flex items-start gap-1.5 text-neutral-300">
                <MapPin size={12} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="text-[11px] text-neutral-300">
                  {order.customerAddress}
                </span>
              </div>
            )}
          </div>

          {/* Voided Details Banner if voided */}
          {isVoided && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-lg p-3 text-xs text-red-300">
              <div className="font-semibold text-red-200">Order Voided</div>
              <div className="text-[11px] mt-0.5">
                Reason: {order.voidReason || "Voided by manager"}
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">
                <Receipt size={14} className="text-[#d36d17]" />
                <span>Ordered Items ({order.items.length})</span>
              </span>
              <span className="text-neutral-500 text-[11px]">Qty x Price</span>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1b1b1b] border border-[#282828] rounded-md p-3 flex justify-between items-start"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded bg-[#252525] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {item.quantity}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-white">{item.name}</div>
                      {item.notes && (
                        <div className="text-[10px] text-neutral-400 italic mt-0.5">
                          * {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white">
                      ₦{item.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      @ ₦{item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span className="text-neutral-200">
                ₦{order.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Tax / VAT (0%):</span>
              <span className="text-neutral-200">₦0.00</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Payment Tender:</span>
              <span className="text-white font-medium">{order.paymentMethod}</span>
            </div>
            <div className="pt-2 border-t border-[#2e2e2e] flex justify-between items-center">
              <span className="text-sm font-bold text-white">Net Total:</span>
              <span className="text-base font-extrabold text-[#22c55e]">
                ₦{order.netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-[#242424] bg-[#1a1a1a] space-y-2">
          {isRunning && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onRecall(order)}
                className="px-3 py-2 rounded bg-[#1e293b] hover:bg-[#28384d] text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Recall to POS</span>
              </button>

              <button
                type="button"
                onClick={() => onSettle(order)}
                className="px-3 py-2 rounded bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <CreditCard size={14} />
                <span>Settle Order</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onPrint(order)}
              className="px-2 py-2 rounded bg-[#252525] hover:bg-[#303030] text-neutral-200 text-xs flex items-center justify-center gap-1 transition-colors border border-[#333]"
            >
              <Printer size={13} className="text-[#22c55e]" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={() => onReprintKot(order)}
              className="px-2 py-2 rounded bg-[#252525] hover:bg-[#303030] text-neutral-200 text-xs flex items-center justify-center gap-1 transition-colors border border-[#333]"
            >
              <ChefHat size={13} className="text-[#f59e0b]" />
              <span>KOT</span>
            </button>

            {isRunning ? (
              <button
                type="button"
                onClick={() => onVoid(order)}
                className="px-2 py-2 rounded bg-[#2a1717] hover:bg-[#3d1e1e] text-red-400 text-xs flex items-center justify-center gap-1 transition-colors border border-red-900/40"
              >
                <Trash2 size={13} />
                <span>Void</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-2 rounded bg-[#252525] hover:bg-[#303030] text-neutral-300 text-xs flex items-center justify-center gap-1 transition-colors border border-[#333]"
              >
                <span>Done</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
