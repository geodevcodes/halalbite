"use client";

import React, { useState } from "react";
import { X, CreditCard, Banknote, Building2, CheckCircle2 } from "lucide-react";
import { OrderSummaryRecord, PaymentMethod } from "./types";

interface SettleModalProps {
  orders: OrderSummaryRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSettle: (orderIds: string[], paymentMethod: PaymentMethod) => void;
}

export function SettleModal({
  orders,
  isOpen,
  onClose,
  onSettle,
}: SettleModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("Cash");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || orders.length === 0) return null;

  const totalAmount = orders.reduce((sum, o) => sum + o.netAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      onSettle(
        orders.map((o) => o.id),
        selectedMethod
      );
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#181818] border border-[#2c2c2c] rounded-lg max-w-md w-full shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#282828] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#22c55e]" />
            <h3 className="text-white font-semibold text-sm">
              Settle {orders.length === 1 ? `Order #${orders[0].orderNumber}` : `${orders.length} Orders`}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Amount Banner */}
            <div className="bg-[#13202e] border border-[#1e3a5f] p-4 rounded-lg text-center">
              <div className="text-xs text-sky-300 font-medium uppercase tracking-wider">
                Total Payable Net Amount
              </div>
              <div className="text-3xl font-extrabold text-white mt-1">
                ₦{totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {orders.length} order{orders.length > 1 ? "s" : ""} selected
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">
                Select Tender Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("Cash")}
                  className={`p-3 rounded-md border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    selectedMethod === "Cash"
                      ? "border-[#22c55e] bg-[#22c55e]/15 text-[#22c55e] font-bold"
                      : "border-[#333] bg-[#222] text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  <Banknote size={20} />
                  <span className="text-xs">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("Card")}
                  className={`p-3 rounded-md border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    selectedMethod === "Card"
                      ? "border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8] font-bold"
                      : "border-[#333] bg-[#222] text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs">Card / POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("Transfer")}
                  className={`p-3 rounded-md border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    selectedMethod === "Transfer"
                      ? "border-[#a855f7] bg-[#a855f7]/15 text-[#a855f7] font-bold"
                      : "border-[#333] bg-[#222] text-neutral-400 hover:border-neutral-500 hover:text-white"
                  }`}
                >
                  <Building2 size={20} />
                  <span className="text-xs">Transfer</span>
                </button>
              </div>
            </div>

            {/* List of Orders in Batch */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 bg-[#121212] p-2.5 rounded border border-[#262626]">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex justify-between items-center text-xs text-neutral-300 py-1 border-b border-neutral-800 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#22c55e] font-semibold">#{o.orderNumber}</span>
                    <span className="text-neutral-500">({o.orderType})</span>
                    <span className="text-neutral-400 truncate max-w-[120px]">
                      {o.customer || o.roomTable || "Guest"}
                    </span>
                  </div>
                  <span className="font-semibold text-white">
                    ₦{o.netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="px-5 py-3 border-t border-[#282828] bg-[#1a1a1a] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-1.5 text-xs font-semibold text-black bg-[#22c55e] hover:bg-[#16a34a] rounded flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              <span>{isProcessing ? "Settling..." : `Settle & Mark Paid (${selectedMethod})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
