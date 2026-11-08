"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { OrderSummaryRecord } from "./types";

interface VoidModalProps {
  orders: OrderSummaryRecord[];
  isOpen: boolean;
  onClose: () => void;
  onVoid: (orderIds: string[], reason: string) => void;
}

const VOID_REASONS = [
  "Customer Changed Mind / Cancelled",
  "Incorrect Items Punched",
  "Kitchen Order Delay / Out of Stock",
  "Accidental Duplicate Entry",
  "Manager Override / Test Order",
  "Other Reason",
];

export function VoidModal({
  orders,
  isOpen,
  onClose,
  onVoid,
}: VoidModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(VOID_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>("");

  if (!isOpen || orders.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedReason === "Other Reason" ? customReason || "Other Reason" : selectedReason;
    onVoid(
      orders.map((o) => o.id),
      finalReason
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#181818] border border-[#2c2c2c] rounded-lg max-w-md w-full shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#282828] flex items-center justify-between bg-[#241315]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-red-400 font-semibold text-sm">
              Void {orders.length === 1 ? `Order #${orders[0].orderNumber}` : `${orders.length} Orders`}
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
            <div className="text-xs text-neutral-300 leading-relaxed bg-[#201515] p-3 rounded border border-red-900/30">
              <span className="font-semibold text-red-400">Caution:</span> Voiding will cancel{" "}
              {orders.length === 1 ? (
                <>
                  Order <strong className="text-white">#{orders[0].orderNumber}</strong> (
                  ₦{orders[0].netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                </>
              ) : (
                <>
                  <strong className="text-white">{orders.length} orders</strong> totaling ₦
                  {orders
                    .reduce((sum, o) => sum + o.netAmount, 0)
                    .toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </>
              )}
              . This action is recorded in the POS audit log.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Reason for Voiding
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-[#202020] text-white px-3 py-2 rounded border border-[#333] text-xs focus:outline-none focus:border-red-500"
              >
                {VOID_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {selectedReason === "Other Reason" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Custom Explanation
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter details about why this order is being voided..."
                  rows={2}
                  className="w-full bg-[#202020] text-white px-3 py-2 rounded border border-[#333] text-xs focus:outline-none focus:border-red-500 placeholder:text-neutral-500"
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="px-5 py-3 border-t border-[#282828] bg-[#1a1a1a] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Trash2 size={14} />
              <span>Confirm Void</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
