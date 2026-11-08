"use client";

import React, { useRef } from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { OrderSummaryRecord } from "./types";

interface ReceiptModalProps {
  order: OrderSummaryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPrinted?: (orderId: string) => void;
}

export function ReceiptModal({
  order,
  isOpen,
  onClose,
  onPrinted,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    if (onPrinted) {
      onPrinted(order.id);
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#181818] border border-[#2c2c2c] rounded-lg max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#282828] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-[#22c55e]" />
            <h3 className="text-white font-semibold text-sm">
              Print Receipt • Order #{order.orderNumber}
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

        {/* Thermal Receipt Paper Canvas */}
        <div className="p-6 overflow-y-auto flex justify-center bg-[#101010]">
          <div
            ref={receiptRef}
            className="w-full max-w-[320px] bg-white text-black p-5 rounded font-mono text-xs shadow-md border border-neutral-300"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-neutral-400">
              <div className="text-base font-black tracking-wider uppercase text-neutral-900">
                HalalBite POS
              </div>
              <div className="text-[11px] text-neutral-600 mt-0.5">
                Authentic 100% Halal Dining
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                Victoria Island, Lagos • Tel: +234 812 000 7860
              </div>
            </div>

            {/* Order Meta */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 text-[11px] space-y-1">
              <div className="flex justify-between font-bold">
                <span>ORDER #{order.orderNumber}</span>
                <span className="uppercase">{order.orderType}</span>
              </div>
              {order.roomTable && (
                <div className="flex justify-between text-neutral-700">
                  <span>Table / Room:</span>
                  <span>{order.roomTable}</span>
                </div>
              )}
              {order.customer && (
                <div className="flex justify-between text-neutral-700">
                  <span>Customer:</span>
                  <span className="font-semibold">{order.customer}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex justify-between text-neutral-700">
                  <span>Phone:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 text-[10px]">
                <span>Date:</span>
                <span>{order.time}</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-[10px]">
                <span>Server / Cashier:</span>
                <span>{order.waiter}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase">
                <span>Item</span>
                <span>Qty x Price</span>
                <span>Total</span>
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="text-[11px]">
                  <div className="font-medium text-neutral-900 leading-tight">
                    {item.name}
                  </div>
                  <div className="flex justify-between text-neutral-600 text-[10px]">
                    <span>
                      {item.quantity} x ₦{item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      ₦{item.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="text-[9px] text-neutral-500 italic pl-1">
                      * {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 space-y-1 text-[11px] border-b border-dashed border-neutral-400">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span>₦{order.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>VAT (0%):</span>
                <span>₦{order.tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-1 border-t border-neutral-200">
                <span>NET TOTAL:</span>
                <span>₦{order.netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-600 pt-1">
                <span>Status:</span>
                <span className="font-semibold uppercase">{order.status}</span>
              </div>
              {order.status === "Settled" && (
                <div className="flex justify-between text-[10px] text-neutral-600">
                  <span>Payment:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center text-[10px] text-neutral-500 space-y-1">
              <div>*** THANK YOU FOR DINING WITH US ***</div>
              <div className="text-[9px]">100% Halal Certified Food • Jazakallah Khair</div>
              <div className="text-[8px] text-neutral-400">Powered by HalalBite Cloud POS</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-5 py-3 border-t border-[#282828] bg-[#1a1a1a] flex items-center justify-between">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#22c55e]" />
            <span>Thermal 80mm format</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white rounded bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-black bg-[#22c55e] hover:bg-[#16a34a] rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer size={14} />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
