"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, CreditCard, Delete, CheckCircle2, Printer, RotateCcw } from "lucide-react";
import { OrderItem } from "./types";

interface PaymentScreenProps {
  orderNumber: number;
  items: OrderItem[];
  subTotal: number;
  tax: number;
  grandTotal: number;
  onBack: () => void;
  onPaymentComplete: () => void;
}

export function PaymentScreen({
  orderNumber,
  items,
  subTotal,
  tax,
  grandTotal,
  onBack,
  onPaymentComplete,
}: PaymentScreenProps) {
  const [activeTab, setActiveTab] = useState<"cash" | "other">("cash");
  const [tenderInput, setTenderInput] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [otherMethod, setOtherMethod] = useState<"Card" | "Transfer" | "POS Terminal">("Card");

  // Format currency helper
  const formatCurrency = (val: number) => {
    return val.toFixed(2);
  };

  // Calculate balance or change
  const balance = Math.max(0, grandTotal - paidAmount);
  const change = Math.max(0, paidAmount - grandTotal);

  // Play subtle POS beep
  const playBeep = useCallback((freq = 750, duration = 0.035) => {
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

  // Handle numpad digit click
  const handleNumpad = useCallback((val: string) => {
    playBeep(800, 0.03);
    if (val === "00") {
      setTenderInput((prev) => (prev ? prev + "00" : ""));
    } else if (val === ".") {
      setTenderInput((prev) => {
        if (!prev.includes(".")) {
          return prev ? prev + "." : "0.";
        }
        return prev;
      });
    } else {
      setTenderInput((prev) => prev + val);
    }
  }, [playBeep]);

  // Backspace key
  const handleBackspace = useCallback(() => {
    playBeep(600, 0.03);
    setTenderInput((prev) => prev.slice(0, -1));
  }, [playBeep]);

  // Clear / Cancel key
  const handleCancel = useCallback(() => {
    playBeep(500, 0.05);
    setTenderInput("");
    setPaidAmount(0);
  }, [playBeep]);

  // OK key: applies the tender input
  const handleApplyTender = useCallback(() => {
    playBeep(1100, 0.08);
    const parsed = parseFloat(tenderInput);
    if (!isNaN(parsed) && parsed > 0) {
      setPaidAmount(parsed);
    } else {
      // Default to exact grand total if empty
      setPaidAmount(grandTotal);
      setTenderInput(grandTotal.toFixed(2));
    }
  }, [tenderInput, grandTotal, playBeep]);

  // Confirm payment
  const handleConfirmPayment = useCallback(() => {
    playBeep(1200, 0.12);
    // If cashier didn't explicitly type tender, auto-tender exact amount
    if (paidAmount === 0 && grandTotal > 0) {
      setPaidAmount(grandTotal);
    }
    setIsSuccessModalOpen(true);
  }, [paidAmount, grandTotal, playBeep]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccessModalOpen) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleNumpad(e.key);
      } else if (e.key === ".") {
        e.preventDefault();
        handleNumpad(".");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (paidAmount >= grandTotal && grandTotal > 0) {
          handleConfirmPayment();
        } else {
          handleApplyTender();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    paidAmount,
    grandTotal,
    isSuccessModalOpen,
    handleNumpad,
    handleBackspace,
    handleCancel,
    handleApplyTender,
    handleConfirmPayment,
  ]);

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col md:flex-row select-none">
      {/* LEFT COLUMN: Order Receipt & Totals */}
      <div className="w-full md:w-[360px] lg:w-[400px] border-r border-[#242424] bg-[#121212] flex flex-col justify-between p-5 shrink-0">
        <div className="space-y-4">
          {/* Back button */}
          <button
            onClick={onBack}
            className="text-[#f97316] font-semibold text-sm flex items-center gap-1 hover:text-orange-400 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          {/* Order Header */}
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white tracking-tight">
              Order # #{orderNumber}
            </h2>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Cash Customer</span>
              <span>Quick Sales.</span>
            </div>
          </div>

          {/* Itemized list */}
          <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.menuItem.id}
                className="bg-[#1f1f1f] rounded px-3 py-2 flex items-center justify-between text-xs text-zinc-200"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-white">{item.quantity}</span>
                  <span className="truncate">{item.menuItem.name}</span>
                </div>
                <span className="font-mono font-medium text-white shrink-0 ml-2">
                  {formatCurrency(item.menuItem.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="pt-4 border-t border-[#242424] space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Sub Total</span>
            <span className="font-mono text-zinc-200">{formatCurrency(subTotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Tax</span>
            <span className="font-mono text-zinc-200">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white pt-1">
            <span>Grand Total</span>
            <span className="font-mono text-white">{formatCurrency(grandTotal)}</span>
          </div>

          <div className="border-t border-[#242424] my-2 pt-2 space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-300 font-medium">
              <span>Paid Amount</span>
              <span className="font-mono text-white">{formatCurrency(paidAmount)}</span>
            </div>
            {change > 0 ? (
              <div className="flex justify-between text-xs font-bold text-emerald-400">
                <span>Change Due</span>
                <span className="font-mono">{formatCurrency(change)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Balance</span>
                <span className="font-mono text-white">{formatCurrency(balance)}</span>
              </div>
            )}
          </div>

          {/* Confirm Payment Button */}
          <button
            onClick={handleConfirmPayment}
            className="w-full mt-3 py-3 rounded-[3px] bg-[#0daa2b] hover:bg-[#0c9827] active:bg-[#0a8221] text-black font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <CreditCard size={18} />
            <span>Confirm Payment</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Tender Pad & Payment Methods */}
      <div className="flex-1 bg-[#161616] flex flex-col p-6 overflow-y-auto">
        <div className="max-w- w-full mx-auto space-y-5">
          {/* Payable Amount Header */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-400">Payable Amountt</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#00e676] tracking-tight">
              {formatCurrency(grandTotal)}
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex border-b border-[#2a2a2a] text-sm font-medium">
            <button
              onClick={() => setActiveTab("cash")}
              className={`pb-2.5 px-6 relative cursor-pointer transition-colors ${
                activeTab === "cash"
                  ? "text-[#f97316] font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Cash
              {activeTab === "cash" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f97316]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("other")}
              className={`pb-2.5 px-6 relative cursor-pointer transition-colors ${
                activeTab === "other"
                  ? "text-[#f97316] font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Other Payment
              {activeTab === "other" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f97316]" />
              )}
            </button>
          </div>

          {activeTab === "other" ? (
            /* Other Payment Mode Options */
            <div className="p-6 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Select Alternative Payment Mode
              </span>
              <div className="grid grid-cols-3 gap-3">
                {(["Card", "POS Terminal", "Transfer"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setOtherMethod(method);
                      setPaidAmount(grandTotal);
                    }}
                    className={`p-4 rounded-lg border text-sm font-semibold transition-all cursor-pointer text-center ${
                      otherMethod === method
                        ? "border-[#f97316] bg-[#f97316]/10 text-orange-400"
                        : "border-[#2a2a2a] bg-[#222222] text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <div className="pt-2 text-xs text-zinc-400">
                Method selected: <strong className="text-white">{otherMethod}</strong>. Click{" "}
                <span className="text-emerald-400 font-bold">Confirm Payment</span> on the left to process.
              </div>
            </div>
          ) : (
            /* Cash Tender Numpad */
            <div className="space-y-4">
              {/* Tender Display Box */}
              <div className="w-full h-14 bg-[#121212] border border-[#2a2a2a] rounded-[3px] px-4 flex items-center justify-end font-mono text-2xl font-bold text-white shadow-inner">
                {tenderInput ? tenderInput : formatCurrency(paidAmount > 0 ? paidAmount : grandTotal)}
              </div>

              {/* 5-Row Touch Numpad Grid (matching Screenshot 2) */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Row 1 */}
                <button
                  type="button"
                  onClick={() => handleNumpad("1")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad("2")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad("3")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  3
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => handleNumpad("4")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad("5")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad("6")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  6
                </button>

                {/* Row 3 */}
                <button
                  type="button"
                  onClick={() => handleNumpad("7")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad("8")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad("9")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  9
                </button>

                {/* Row 4: 00, 0, Backspace */}
                <button
                  type="button"
                  onClick={() => handleNumpad("00")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  00
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad("0")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="Backspace"
                >
                  <Delete size={22} />
                </button>

                {/* Row 5: Cancel, ., OK */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpad(".")}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] text-white font-bold text-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={handleApplyTender}
                  className="h-24 rounded-[3px] bg-[#222222] hover:bg-[#2c2c2c] active:bg-[#353535] border-2 border-[#ea580c] text-white font-bold text-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl bg-[#1c1c1c] border border-zinc-800 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Payment Successful!</h3>
              <p className="text-xs text-zinc-400">Order #{orderNumber} has been closed and saved locally.</p>
            </div>

            <div className="bg-[#141414] rounded-lg p-3 text-xs space-y-1.5 border border-zinc-800 font-mono text-left">
              <div className="flex justify-between">
                <span className="text-zinc-400">Paid:</span>
                <span className="text-white font-bold">{formatCurrency(paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Grand Total:</span>
                <span className="text-white">{formatCurrency(grandTotal)}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800 pt-1">
                  <span>Change:</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onPaymentComplete();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#0daa2b] hover:bg-[#0c9827] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <RotateCcw size={14} /> New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
