"use client";

import React, { useState } from "react";
import { X, ChefHat, RotateCcw, CheckCircle2 } from "lucide-react";
import { OrderSummaryRecord } from "./types";

interface KotModalProps {
  orders: OrderSummaryRecord[];
  isOpen: boolean;
  onClose: () => void;
  onReprinted: (orderIds: string[]) => void;
}

export function KotModal({
  orders,
  isOpen,
  onClose,
  onReprinted,
}: KotModalProps) {
  const [kitchenStation, setKitchenStation] = useState<string>("Kitchen Main (Hot Food)");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || orders.length === 0) return null;

  const handleReprint = () => {
    onReprinted(orders.map((o) => o.id));
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#181818] border border-[#2c2c2c] rounded-lg max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#282828] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <ChefHat size={18} className="text-[#f59e0b]" />
            <h3 className="text-white font-semibold text-sm">
              Reprint Kitchen Order Ticket (KOT)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900/60 p-3 rounded border border-neutral-800">
            <div>
              <span className="text-neutral-400">Target Station:</span>
              <select
                value={kitchenStation}
                onChange={(e) => setKitchenStation(e.target.value)}
                className="ml-2 bg-[#252525] text-white px-2 py-1 rounded border border-[#3a3a3a] text-xs focus:outline-none focus:border-[#d36d17]"
              >
                <option value="Kitchen Main (Hot Food)">Kitchen Main (Hot Food)</option>
                <option value="Bar & Drinks Station">Bar & Drinks Station</option>
                <option value="All Kitchen Printers">All Kitchen Printers</option>
              </select>
            </div>
            <div className="text-neutral-400">
              Orders selected: <strong className="text-white">{orders.length}</strong>
            </div>
          </div>

          {/* KOT Preview Card */}
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white text-black p-4 rounded font-mono text-xs border border-neutral-300 shadow-sm"
              >
                <div className="flex justify-between items-center border-b-2 border-black pb-1.5 font-bold">
                  <span className="text-sm">*** KOT REPRINT ***</span>
                  <span className="text-xs">{kitchenStation}</span>
                </div>
                <div className="py-2 border-b border-dashed border-neutral-400 flex justify-between text-[11px]">
                  <div>
                    <div className="font-bold text-sm">ORDER #{ord.orderNumber}</div>
                    <div className="text-neutral-700">Type: {ord.orderType}</div>
                    {ord.roomTable && <div className="text-neutral-700">Table: {ord.roomTable}</div>}
                  </div>
                  <div className="text-right text-[10px] text-neutral-600">
                    <div>Waiter: {ord.waiter}</div>
                    <div>{ord.time}</div>
                    <div className="text-red-600 font-bold mt-1">[DUPLICATE / REPRINT]</div>
                  </div>
                </div>

                <div className="py-2 space-y-1.5 text-xs">
                  {ord.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-start">
                      <div className="font-bold">
                        <span className="text-base mr-2">{it.quantity}x</span>
                        <span>{it.name}</span>
                        {it.notes && (
                          <div className="text-[10px] text-red-700 italic font-semibold pl-6">
                            &gt;&gt; NOTE: {it.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3 border-t border-[#282828] bg-[#1a1a1a] flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            Sends raw ESC/POS payload to kitchen network printer
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReprint}
              disabled={isSuccess}
              className={`px-4 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-sm ${
                isSuccess
                  ? "bg-[#22c55e] text-black"
                  : "bg-[#d36d17] hover:bg-[#b85b10] text-white"
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>KOT Dispatched!</span>
                </>
              ) : (
                <>
                  <RotateCcw size={14} />
                  <span>Send KOT to Kitchen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
