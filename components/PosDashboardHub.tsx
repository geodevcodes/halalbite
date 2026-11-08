"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Refrigerator,
  Receipt,
  User,
  MapPin,
  Calculator,
  Shapes,
  Package,
  Printer,
  Percent,
  PlusCircle,
  Repeat,
  BarChart3,
  ArrowUpDown,
  ShoppingCart,
  Scissors,
  FileSpreadsheet,
  CloudDownload,
  Settings,
  Moon,
  Store,
  CheckCircle2,
  X
} from "lucide-react";
import {
  FaCashRegister,
  FaMotorcycle,
  FaArrowRightFromBracket,
  FaArrowRightToBracket,
  FaWhatsapp,
  FaHeadset,
  FaMoneyBillWave,
} from "react-icons/fa6";
import { MdTableRestaurant, MdOutlineTableBar } from "react-icons/md";
import { SupportModal } from "./SupportModal";

interface PosDashboardHubProps {
  onLogout: () => void;
  cashierName?: string;
}

interface HubItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action?: () => void;
}

interface HubSection {
  title: string;
  items: HubItem[];
}

export function PosDashboardHub({ onLogout, cashierName = "Admin" }: PosDashboardHubProps) {
  const router = useRouter();
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("01:24 PM");
  const [supportModal, setSupportModal] = useState<{ isOpen: boolean; type: "support" | "whatsapp" }>({
    isOpen: false,
    type: "support",
  });

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

  const triggerAction = (title: string, customAction?: () => void) => {
    if (customAction) {
      customAction();
      return;
    }
    setActiveToast(title);
    setTimeout(() => {
      setActiveToast((curr) => (curr === title ? null : curr));
    }, 2500);
  };

  const sections: HubSection[] = [
    {
      title: "Quick Access",
      items: [
        {
          id: "quick-sales",
          label: "Quick Sales",
          icon: <FaCashRegister size={26} />,
          action: () => router.push("/quick-sales"),
        },
        {
          id: "rooms",
          label: "Rooms",
          icon: <MdTableRestaurant size={28} />,
          action: () => router.push("/sales-room"),
        },
        {
          id: "dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={26} />,
          action: () => router.push("/dashboard"),
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          id: "order-summary",
          label: "Order Summary",
          icon: <ClipboardList size={26} />,
        },
        {
          id: "delivery",
          label: "Delivery",
          icon: <FaMotorcycle size={26} />,
        },
        {
          id: "kitchen",
          label: "Kitchen",
          icon: <Refrigerator size={26} />,
        },
      ],
    },
    {
      title: "Transaction",
      items: [
        {
          id: "transactions",
          label: "Transactions",
          icon: <Receipt size={26} />,
        },
      ],
    },
    {
      title: "Session",
      items: [
        {
          id: "logout",
          label: "Logout",
          icon: <FaArrowRightFromBracket size={26} />,
          action: onLogout,
        },
        {
          id: "exit",
          label: "Exit",
          icon: <FaArrowRightToBracket size={26} />,
          action: onLogout,
        },
      ],
    },
    {
      title: "Masters",
      items: [
        {
          id: "users",
          label: "Users",
          icon: <User size={26} />,
        },
        {
          id: "room",
          label: "Room",
          icon: <MapPin size={26} />,
          action: () => router.push("/sales-room"),
        },
        {
          id: "table",
          label: "Table",
          icon: <Calculator size={26} />,
          action: () => router.push("/sales-room"),
        },
        {
          id: "floor-plan",
          label: "Floor Plan",
          icon: <MdOutlineTableBar size={28} />,
          action: () => router.push("/sales-room"),
        },
        {
          id: "other-payments",
          label: "Other Payments",
          icon: <FaMoneyBillWave size={26} />,
        },
      ],
    },
    {
      title: "Products",
      items: [
        {
          id: "category",
          label: "Category",
          icon: <Shapes size={26} />,
        },
        {
          id: "menu-items",
          label: "Menu Items",
          icon: <Package size={26} />,
        },
        {
          id: "printers",
          label: "Printers",
          icon: <Printer size={26} />,
        },
        {
          id: "taxes",
          label: "Taxes",
          icon: <Percent size={26} />,
        },
        {
          id: "modifier-group",
          label: "Modifier Group",
          icon: <PlusCircle size={26} />,
        },
        {
          id: "price-levels",
          label: "Price Levels",
          icon: <PlusCircle size={26} />,
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          id: "sales-report",
          label: "Sales Report",
          icon: <Repeat size={26} />,
        },
        {
          id: "x-report",
          label: "X Report",
          icon: <FaCashRegister size={26} />,
        },
        {
          id: "z-report",
          label: "Z Report",
          icon: <BarChart3 size={26} />,
        },
      ],
    },
    {
      title: "Inventory",
      items: [
        {
          id: "purchase",
          label: "Purchase",
          icon: <ShoppingCart size={26} />,
        },
        {
          id: "expense",
          label: "Expense",
          icon: <Scissors size={26} />,
        },
        {
          id: "inventory-report",
          label: "Inventory Report",
          icon: <FileSpreadsheet size={26} />,
        },
      ],
    },
    {
      title: "Configurations",
      items: [
        {
          id: "pull-config",
          label: "Pull Config",
          icon: <CloudDownload size={26} />,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings size={26} />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col select-none relative animate-in fade-in duration-200">
      {/* Top Header - Fixed with border-b */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#121212] border-b border-[#232323] px-6 py-2.5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight">
            Halal Bite Demo
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Saturday, 7 November 2026
          </p>
        </div>

        {/* Top Right Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerAction("Theme Toggled")}
            className="w-9 h-9 rounded-md bg-[#252525] hover:bg-[#303030] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            title="Toggle Dark Mode"
            aria-label="Toggle Theme"
          >
            <Moon size={18} />
          </button>
          <button
            onClick={() => router.push("/quick-sales")}
            className="w-9 h-9 rounded-md bg-[#252525] hover:bg-[#303030] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
            title="POS Quick Sales Terminal"
            aria-label="POS Layout"
          >
            <Store size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 px-6 pt-[82px] pb-20 overflow-y-auto space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2.5">
            <h2 className="text-sm font-normal text-[#9ca3af]">
              {section.title}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => triggerAction(item.label, item.action)}
                  className="w-[120px] h-[120px] rounded-lg border border-[#2a2a2a] bg-[#121212] flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-all hover:border-[#df7218]/70 hover:bg-[#df7218]/5 active:scale-95 cursor-pointer shadow-sm group"
                >
                  <div className="text-[#df7218] group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[#df7218] text-[11px] sm:text-base font-medium leading-tight text-center line-clamp-2">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Action Buttons in bottom-right corner */}
      <div className="fixed bottom-10 right-6 flex flex-col gap-3 items-center z-40">
        <button
          onClick={() => setSupportModal({ isOpen: true, type: "whatsapp" })}
          className="w-11 h-11 rounded-full border-2 border-[#16a34a] text-[#16a34a] bg-[#121212]/90 hover:bg-[#16a34a]/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
          title="Chat on WhatsApp"
          aria-label="WhatsApp Support"
        >
          <FaWhatsapp size={20} />
        </button>

        <button
          onClick={() => setSupportModal({ isOpen: true, type: "support" })}
          className="w-11 h-11 rounded-full border-2 border-[#10b981] text-[#10b981] bg-[#121212]/90 hover:bg-[#10b981]/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
          title="Helpdesk & Diagnostics"
          aria-label="Helpdesk & Diagnostics"
        >
          <FaHeadset size={18} />
        </button>
      </div>

      {/* Fixed Bottom Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-7 bg-[#121212] border-t border-[#1f1f1f] px-4 flex items-center justify-between text-xs text-zinc-400 z-30 select-none">
        <div className="flex items-center gap-1.5">
          <span>Cashier :</span>
          <span className="text-white font-medium">{cashierName}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
          <span>D2 - S2 - A2248</span>
          <span>|</span>
          <span>{currentTime}</span>
          <span>|</span>
          <span className="text-emerald-500 font-bold" title="Cloud Synced / Offline Ready">
            ☁
          </span>
          <span>|</span>
          <span>1.4.24</span>
        </div>
      </footer>

      {/* Interactive Toast */}
      {activeToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1c] border border-orange-500/40 text-orange-400 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>Opened: {activeToast}</span>
          <button
            onClick={() => setActiveToast(null)}
            className="ml-2 text-zinc-400 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Support / WhatsApp Dialog */}
      <SupportModal
        isOpen={supportModal.isOpen}
        type={supportModal.type}
        onClose={() => setSupportModal({ isOpen: false, type: "support" })}
      />
    </div>
  );
}
