"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ArrowLeft,
  User,
  RotateCcw,
  MoreVertical,
  Banknote,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Printer
} from "lucide-react";
import { CategoryType, MenuItem, OrderItem } from "./types";
import { initialMenuItems } from "./menuData";
import { PaymentScreen } from "./PaymentScreen";

export function QuickSalesScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    // Pre-populated with item from user screenshot
    {
      menuItem: initialMenuItems[0], // Jollof Rice and Chicken
      quantity: 1,
    },
  ]);
  const [orderNumber, setOrderNumber] = useState<number>(8);

  // Read URL query parameters reactively
  const searchParams = useSearchParams();
  const paramMode = searchParams.get("mode");
  const paramTable = searchParams.get("table");
  const paramCustomer = searchParams.get("customer");
  const paramPhone = searchParams.get("phone");

  // Derive order type from URL parameters
  const urlOrderType = useMemo(() => {
    if (paramTable || paramMode === "dine-in") return "Dine In";
    if (paramMode === "takeaway" || paramMode === "take-away") return "Take Away";
    if (paramMode === "delivery") return "Delivery";
    return "Quick Sales";
  }, [paramTable, paramMode]);

  // Derive customer label from URL parameters
  const urlCustomerName = useMemo(() => {
    if (paramTable) {
      return paramTable.startsWith("T") ? `Table ${paramTable}` : paramTable;
    }
    if (paramCustomer) {
      const decoded = decodeURIComponent(paramCustomer);
      return paramPhone ? `${decoded} | ${decodeURIComponent(paramPhone)}` : decoded;
    }
    if (paramMode === "takeaway" || paramMode === "take-away") return "Take Away Customer";
    if (paramMode === "delivery") return "Delivery Customer";
    return "Cash Customer";
  }, [paramTable, paramCustomer, paramPhone, paramMode]);

  // Support manual overrides if cashier edits them
  const [customOrderType, setCustomOrderType] = useState<string | null>(null);
  const [customCustomerName, setCustomCustomerName] = useState<string | null>(null);

  const orderType = customOrderType ?? urlOrderType;
  const customerName = customCustomerName ?? urlCustomerName;

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [customerInput, setCustomerInput] = useState<string>("");
  const [orderTypeInput, setOrderTypeInput] = useState<string>("Quick Sales");

  // Payment view toggle state (Screenshot 2)
  const [isPaymentViewOpen, setIsPaymentViewOpen] = useState<boolean>(false);
  const [quickPaySuccess, setQuickPaySuccess] = useState<boolean>(false);

  // Play subtle POS beep
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

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return initialMenuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Group items by category when "All" is active
  const groupedCategories = useMemo(() => {
    const categories: CategoryType[] = [
      "Breakfast",
      "Burgers",
      "Drinks",
      "Soups",
      "Pasta",
      "Main Course",
      "BBQ",
    ];
    return categories
      .map((cat) => ({
        category: cat,
        items: filteredItems.filter((i) => i.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredItems]);

  // Add item to cart
  const handleAddItem = (item: MenuItem) => {
    playBeep(900, 0.035);
    setOrderItems((prev) => {
      const existing = prev.find((oi) => oi.menuItem.id === item.id);
      if (existing) {
        return prev.map((oi) =>
          oi.menuItem.id === item.id
            ? { ...oi, quantity: oi.quantity + 1 }
            : oi
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  // Modify quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    playBeep(650, 0.03);
    setOrderItems((prev) =>
      prev
        .map((oi) => {
          if (oi.menuItem.id === itemId) {
            const newQty = oi.quantity + delta;
            return newQty > 0 ? { ...oi, quantity: newQty } : null;
          }
          return oi;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    playBeep(450, 0.05);
    setOrderItems((prev) => prev.filter((oi) => oi.menuItem.id !== itemId));
  };

  // Clear ticket
  const handleClearCart = () => {
    playBeep(500, 0.06);
    setOrderItems([]);
  };

  // Financial Calculations
  const subTotal = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );
  }, [orderItems]);

  const tax = 0.0;
  const grandTotal = subTotal + tax;
  const hasItems = orderItems.length > 0;

  // Format currency helper
  const formatCurrency = (val: number) => {
    return val.toFixed(2);
  };

  // Quick Pay by Cash (1-click completion)
  const handleQuickPayCash = () => {
    if (!hasItems) return;
    playBeep(1100, 0.1);
    setQuickPaySuccess(true);
  };

  // If in payment mode, render PaymentScreen (Screenshot 2)
  if (isPaymentViewOpen) {
    return (
      <PaymentScreen
        orderNumber={orderNumber}
        orderType={orderType}
        customerName={customerName}
        items={orderItems}
        subTotal={subTotal}
        tax={tax}
        grandTotal={grandTotal}
        onBack={() => setIsPaymentViewOpen(false)}
        onPaymentComplete={() => {
          setIsPaymentViewOpen(false);
          setOrderItems([]);
          setOrderNumber((prev) => prev + 1);
        }}
      />
    );
  }

  const categoriesList: CategoryType[] = [
    "All",
    "Breakfast",
    "Soups",
    "Pasta",
    "Main Course",
    "Burgers",
    "Drinks",
    "BBQ",
  ];

  return (
    <div className="h-screen w-screen bg-[#121212] text-white flex flex-col select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-[#232323] bg-[#121212] flex items-center shrink-0 z-20">
        {/* Left + Center Header Section: HalalBite Brand + Search Input */}
        <div className="flex-1 h-full px-4 flex items-center justify-between">
          {/* HalalBite Brand Keyword & Logo */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
              title="Return to Dashboard Hub"
            >
              <div className="w-8 h-8 rounded-md bg-orange-600/20 border border-orange-500/40 text-[#f97316] font-black text-xs flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                HB
              </div>
              <span className="font-bold text-base sm:text-lg text-white tracking-tight group-hover:text-orange-400 transition-colors">
                HalalBite
              </span>
            </Link>
            <span className="text-zinc-600 font-light">/</span>
            <span className="text-xs text-zinc-400 font-medium hidden sm:inline">{orderType}</span>
          </div>

          {/* Search bar (together with the header, positioned right before right panel divider) */}
          <div className="relative w-48 sm:w-64 md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-8 pl-3 pr-8 rounded-[3px] border border-[#d36d17] bg-[#121212] text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#f97316]"
            />
            <Search
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#d36d17] pointer-events-none"
            />
          </div>
        </div>

        {/* Right Ticket Header Section */}
        <div className="w-80 sm:w-96 h-full border-l border-[#232323] px-3.5 flex items-center justify-between bg-[#121212] shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
              Order # {orderNumber}
            </h2>
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <span className="truncate max-w-[120px] text-zinc-200 font-medium" title={customerName}>
                {customerName}
              </span>
              <span>•</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                  orderType === "Delivery"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : orderType === "Take Away"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : orderType === "Dine In"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-400 bg-zinc-800/80 px-1.5"
                }`}
              >
                {orderType}
              </span>
            </div>
          </div>

          {/* 4 Action buttons matching screenshot */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="w-7 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft size={14} />
            </Link>
            <button
              type="button"
              onClick={() => {
                setCustomerInput(customerName === "Cash Customer" ? "" : customerName);
                setOrderTypeInput(orderType);
                setIsCustomerModalOpen(true);
              }}
              className="w-7 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Edit Order Type / Customer"
            >
              <User size={14} />
            </button>
            <button
              type="button"
              onClick={handleClearCart}
              className="w-7 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Reset Order"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded bg-[#222222] hover:bg-[#2c2c2c] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="More Options"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-Column Split Content (height fixed, only menu scrolls) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* COLUMN 1: Category Sidebar (Wider & Fixed) */}
        <aside className="w-40 sm:w-52 border-r border-[#232323] bg-[#121212] p-2.5 flex flex-col gap-1.5 overflow-y-auto shrink-0 h-full">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playBeep(700, 0.03);
                setActiveCategory(cat);
              }}
              className={`w-full py-2.5 px-3.5 rounded-[4px] text-xs font-medium text-left transition-all cursor-pointer truncate ${
                activeCategory === cat
                  ? "border border-[#d36d17] text-white bg-[#1a1a1a] shadow-sm font-semibold"
                  : "border border-[#222222] text-zinc-400 hover:text-white bg-[#121212] hover:bg-[#181818]"
              }`}
            >
              {cat}
            </button>
          ))}
        </aside>

        {/* COLUMN 2: Menu Items Grid (The only scrollable section!) */}
        <section className="flex-1 bg-[#181818] p-4 overflow-y-auto h-full min-h-0">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
              <Search size={32} />
              <p className="text-xs">No menu items found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : activeCategory === "All" ? (
            /* Render all sections grouped by category */
            <div className="space-y-6 pb-6">
              {groupedCategories.map((group) => (
                <div key={group.category} className="space-y-2.5">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-200 border-b border-[#232323] pb-1.5">
                    {group.category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {group.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAdd={() => handleAddItem(item)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Render single filtered category */
            <div className="space-y-2.5 pb-6">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-200">
                {activeCategory}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAdd={() => handleAddItem(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* COLUMN 3: Order Ticket (Fixed Right Panel) */}
        <aside className="w-80 sm:w-96 border-l border-[#232323] bg-[#121212] flex flex-col justify-between shrink-0 h-full min-h-0">
          {/* Ticket Items List (Scrollable inside the fixed right panel) */}
          <div className="flex-1 p-3 overflow-y-auto min-h-0 space-y-1.5">
            {orderItems.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-zinc-500 space-y-1.5 text-center p-4">
                <CreditCard size={24} className="opacity-40" />
                <p className="text-xs">Ticket is empty</p>
                <p className="text-[10px] text-zinc-600">Tap items on the left to add</p>
              </div>
            ) : (
              orderItems.map((oi) => (
                <div
                  key={oi.menuItem.id}
                  className="p-2.5 rounded bg-[#181818] border border-[#222222] flex items-center justify-between text-xs group"
                >
                  <div className="flex-1 pr-2 min-w-0">
                    <div className="font-medium text-white truncate">
                      {oi.menuItem.name}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      ₦{oi.menuItem.price.toLocaleString()} × {oi.quantity}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-[#121212] border border-[#2a2a2a] rounded px-1 py-0.5">
                      <button
                        onClick={() => handleUpdateQuantity(oi.menuItem.id, -1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-white px-1 text-[11px] min-w-[16px] text-center">
                        {oi.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(oi.menuItem.id, 1)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-white text-xs min-w-[55px] text-right">
                      {formatCurrency(oi.menuItem.price * oi.quantity)}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(oi.menuItem.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Totals & Payment Buttons (Always pinned at the bottom!) */}
          <div className="p-3 border-t border-[#232323] bg-[#121212] space-y-3 shrink-0">
            {/* Financial Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Sub Total</span>
                <span className="font-mono text-white">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax</span>
                <span className="font-mono text-white">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-[#232323]">
                <span>Grand Total</span>
                <span className="font-mono text-white">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Bottom 2 Action Buttons (Always visible; faded and disabled if no items) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleQuickPayCash}
                disabled={!hasItems}
                className={`py-2.5 px-3 rounded-[3px] border border-[#16a34a] flex flex-col items-center justify-center transition-all ${
                  hasItems
                    ? "bg-[#132219] hover:bg-[#183022] active:bg-[#111e16] text-[#16a34a] cursor-pointer shadow-sm opacity-100"
                    : "bg-[#132219]/30 text-[#16a34a]/40 cursor-not-allowed opacity-40"
                }`}
                title={hasItems ? "Pay exact cash instantly" : "Add items to enable payment"}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Banknote size={14} />
                  <span>Quick Pay</span>
                </div>
                <span className="text-[10px] opacity-75 font-normal">by Cash</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (hasItems) {
                    playBeep(1000, 0.05);
                    setIsPaymentViewOpen(true);
                  }
                }}
                disabled={!hasItems}
                className={`py-2.5 px-3 rounded-[3px] font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  hasItems
                    ? "bg-[#0daa2b] hover:bg-[#0c9827] active:bg-[#0a8221] text-black cursor-pointer shadow-md opacity-100"
                    : "bg-[#0daa2b]/30 text-black/40 cursor-not-allowed opacity-40"
                }`}
                title={hasItems ? "Proceed to tender payment" : "Add items to enable payment"}
              >
                <CreditCard size={15} />
                <span>Payment</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Customer Name Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[#1c1c1c] border border-zinc-800 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Order Details & Customer</h3>

            {/* Order Mode Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Order Mode</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(["Quick Sales", "Dine In", "Take Away", "Delivery"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setOrderTypeInput(mode)}
                    className={`py-1.5 px-1 rounded text-center text-[10px] sm:text-[11px] font-medium transition-colors ${
                      orderTypeInput === mode
                        ? "bg-orange-600 text-white font-bold"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Customer Name / Details</label>
              <input
                type="text"
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
                placeholder="e.g. Table 4 / Brother Tariq"
                className="w-full h-10 px-3 rounded-lg border border-zinc-700 bg-[#121212] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomOrderType(orderTypeInput);
                  setCustomCustomerName(
                    customerInput.trim() ||
                      (orderTypeInput === "Take Away"
                        ? "Take Away Customer"
                        : orderTypeInput === "Delivery"
                        ? "Delivery Customer"
                        : "Cash Customer")
                  );
                  setIsCustomerModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Pay Confirmation Modal */}
      {quickPaySuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[#1c1c1c] border border-zinc-800 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Cash Payment Recorded!</h3>
              <p className="text-xs text-zinc-400">
                Order #{orderNumber} settled with exact cash ({formatCurrency(grandTotal)}).
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickPaySuccess(false);
                  setOrderItems([]);
                  setOrderNumber((prev) => prev + 1);
                }}
                className="flex-1 py-2 rounded-lg bg-[#0daa2b] hover:bg-[#0c9827] text-black font-bold text-xs cursor-pointer"
              >
                Next Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Menu Item Card matching user screenshot
function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <div
      onClick={onAdd}
      className="relative aspect-square rounded-[3px] overflow-hidden border border-[#2a2a2a] bg-[#222222] hover:border-orange-500/60 transition-all active:scale-[0.97] cursor-pointer group shadow-sm flex flex-col justify-between p-2 select-none"
      style={
        item.image
          ? {
              backgroundImage: `url(${item.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Top Right: White Price Pill Badge (matching screenshot) */}
      <div className="flex justify-end w-full z-10">
        <span className="px-1.5 py-0.5 rounded-[2px] bg-white text-black font-mono font-bold text-[10px] sm:text-[11px] shadow">
          {item.price.toFixed(2)}
        </span>
      </div>

      {/* Middle Placeholder if no image (PHOTO COMING SOON - matching screenshot) */}
      {!item.image && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 pointer-events-none p-2">
          <div className="w-8 h-8 rounded border border-zinc-600/40 bg-zinc-800/40 flex items-center justify-center mb-1">
            <ImageIcon size={18} className="opacity-50" />
          </div>
          <span className="text-[9px] font-bold tracking-wider opacity-60 text-center">
            PHOTO
          </span>
          <span className="text-[7px] tracking-widest opacity-40 text-center">
            COMING SOON
          </span>
        </div>
      )}

      {/* Dark overlay at bottom for title readability */}
      <div className="absolute inset-x-0 bottom-0 pt-6 pb-1.5 px-2 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
        <span className="text-[11px] sm:text-xs font-semibold text-white leading-tight line-clamp-2 drop-shadow">
          {item.name}
        </span>
      </div>
    </div>
  );
}
