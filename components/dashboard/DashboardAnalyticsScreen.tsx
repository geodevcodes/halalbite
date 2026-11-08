"use client";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  FileText,
  Utensils,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Printer,
  CreditCard,
  Banknote,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { FaMotorcycle } from "react-icons/fa6";

type Timeframe = "today" | "week" | "month";

interface HourlyPoint {
  hour: number;
  label: string;
  sales: number;
  orders: number;
}

interface CategorySale {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface TopItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

interface RecentInvoice {
  id: string;
  orderNumber: number;
  time: string;
  customer: string;
  channel: "Dine In" | "Take Away" | "Delivery";
  channelColor: string;
  items: string;
  amount: number;
  paymentMethod: "Cash" | "Card" | "Transfer";
  status: "Paid" | "Refunded";
}

export function DashboardAnalyticsScreen() {
  const [timeframe, setTimeframe] = useState<Timeframe>("today");
  const [metricView, setMetricView] = useState<"sales" | "orders">("sales");
  const [hoveredPoint, setHoveredPoint] = useState<HourlyPoint | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Web Audio click beep
  const playBeep = useCallback((freq = 750, duration = 0.035) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore
    }
  }, []);

  const handleRefresh = () => {
    playBeep(900, 0.05);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Dynamic KPI Metrics matching Screenshot 1
  const kpiData = useMemo(() => {
    if (timeframe === "today") {
      return {
        sales: 3500.0,
        salesChange: -94,
        invoices: 1,
        invoicesChange: -83,
        dineIn: 0.0,
        dineInShare: 0,
        delivery: 0.0,
        deliveryShare: 0,
        takeaway: 3500.0,
        takeawayShare: 100,
        avgTicket: 3500.0,
      };
    } else if (timeframe === "week") {
      return {
        sales: 148500.0,
        salesChange: +14.2,
        invoices: 42,
        invoicesChange: +9.5,
        dineIn: 84200.0,
        dineInShare: 57,
        delivery: 41800.0,
        deliveryShare: 28,
        takeaway: 22500.0,
        takeawayShare: 15,
        avgTicket: 3535.7,
      };
    } else {
      return {
        sales: 642000.0,
        salesChange: +22.8,
        invoices: 184,
        invoicesChange: +18.0,
        dineIn: 365000.0,
        dineInShare: 57,
        delivery: 178000.0,
        deliveryShare: 28,
        takeaway: 99000.0,
        takeawayShare: 15,
        avgTicket: 3489.1,
      };
    }
  }, [timeframe]);

  // Hourly curve points matching Screenshot curve (peaking around 14:00 at ~3500)
  const hourlyData: HourlyPoint[] = useMemo(() => {
    if (timeframe === "today") {
      return [
        { hour: 1, label: "1:00", sales: 0, orders: 0 },
        { hour: 4, label: "4:00", sales: 0, orders: 0 },
        { hour: 7, label: "7:00", sales: 0, orders: 0 },
        { hour: 10, label: "10:00", sales: 50, orders: 0 },
        { hour: 12, label: "12:00", sales: 280, orders: 0 },
        { hour: 14, label: "14:00", sales: 3500, orders: 1 },
        { hour: 16, label: "16:00", sales: 180, orders: 0 },
        { hour: 19, label: "19:00", sales: 40, orders: 0 },
        { hour: 22, label: "22:00", sales: 0, orders: 0 },
      ];
    } else {
      return [
        { hour: 1, label: "1:00", sales: 0, orders: 0 },
        { hour: 4, label: "4:00", sales: 0, orders: 0 },
        { hour: 7, label: "7:00", sales: 6200, orders: 3 },
        { hour: 10, label: "10:00", sales: 18500, orders: 7 },
        { hour: 12, label: "12:00", sales: 38200, orders: 12 },
        { hour: 14, label: "14:00", sales: 45000, orders: 14 },
        { hour: 16, label: "16:00", sales: 21500, orders: 8 },
        { hour: 19, label: "19:00", sales: 28000, orders: 9 },
        { hour: 22, label: "22:00", sales: 4200, orders: 2 },
      ];
    }
  }, [timeframe]);

  // Category sales breakdown
  const categorySales: CategorySale[] = useMemo(() => {
    if (timeframe === "today") {
      return [
        {
          name: "Breakfast",
          amount: 3500.0,
          color: "#ffd600",
          percentage: 100,
        },
      ];
    } else {
      return [
        {
          name: "Breakfast",
          amount: 56200.0,
          color: "#ffd600",
          percentage: 38,
        },
        {
          name: "Main Course",
          amount: 42000.0,
          color: "#10b981",
          percentage: 28,
        },
        { name: "Burgers", amount: 26500.0, color: "#f97316", percentage: 18 },
        { name: "Drinks", amount: 15400.0, color: "#0ea5e9", percentage: 10 },
        { name: "BBQ", amount: 8400.0, color: "#a855f7", percentage: 6 },
      ];
    }
  }, [timeframe]);

  // Top selling menu items
  const topItems: TopItem[] = [
    {
      id: "1",
      name: "Jollof Rice and Chicken",
      category: "Breakfast",
      quantity: 1,
      revenue: 3500.0,
      percentage: 100,
    },
    {
      id: "2",
      name: "Fried Rice Special",
      category: "Breakfast",
      quantity: 0,
      revenue: 0.0,
      percentage: 0,
    },
    {
      id: "3",
      name: "Classic Halal Beef Burger",
      category: "Burgers",
      quantity: 0,
      revenue: 0.0,
      percentage: 0,
    },
    {
      id: "4",
      name: "Orange with Mango Mix Juice",
      category: "Drinks",
      quantity: 0,
      revenue: 0.0,
      percentage: 0,
    },
  ];

  // Recent Invoices Feed
  const recentInvoices: RecentInvoice[] = [
    {
      id: "inv-15",
      orderNumber: 15,
      time: "01:24 PM",
      customer: "Cash Customer",
      channel: "Take Away",
      channelColor: "#f59e0b",
      items: "1× Jollof Rice and Chicken",
      amount: 3500.0,
      paymentMethod: "Cash",
      status: "Paid",
    },
    {
      id: "inv-14",
      orderNumber: 14,
      time: "10:24 AM",
      customer: "Table T 1",
      channel: "Dine In",
      channelColor: "#3b82f6",
      items: "2× Dine-in Specials",
      amount: 7500.0,
      paymentMethod: "Card",
      status: "Paid",
    },
    {
      id: "inv-13",
      orderNumber: 13,
      time: "10:16 AM",
      customer: "Cash Customer",
      channel: "Take Away",
      channelColor: "#f59e0b",
      items: "3× Platters & Drinks",
      amount: 18800.0,
      paymentMethod: "Cash",
      status: "Paid",
    },
    {
      id: "inv-10",
      orderNumber: 10,
      time: "10:15 AM",
      customer: "Abdullah (08133642798)",
      channel: "Delivery",
      channelColor: "#10b981",
      items: "1× Burger with Chicken Chips",
      amount: 4000.0,
      paymentMethod: "Transfer",
      status: "Paid",
    },
  ];

  // SVG Area Chart Calculations
  const chartHeight = 220;
  const chartWidth = 620;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };

  const maxVal = Math.max(
    4000,
    ...hourlyData.map((d) =>
      metricView === "sales" ? d.sales : d.orders * 3000,
    ),
  );

  const points = hourlyData.map((d, i) => {
    const val = metricView === "sales" ? d.sales : d.orders * 3000;
    const x =
      padding.left +
      (i / (hourlyData.length - 1)) *
        (chartWidth - padding.left - padding.right);
    const y =
      chartHeight -
      padding.bottom -
      (val / maxVal) * (chartHeight - padding.top - padding.bottom);
    return { x, y, data: d };
  });

  // Build SVG path string with smooth bezier curves
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    const bottomY = chartHeight - padding.bottom;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, padding.bottom]);

  // Donut chart path calculations
  const donutSize = 180;
  const strokeWidth = 26;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white flex flex-col select-none overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#121212] border-b border-[#232323] px-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-md bg-[#222222] hover:bg-[#2c2c2c] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Return to Dashboard Hub"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Dashboard</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={11} /> Offline DB Synced
              </span>
            </h1>
          </div>
        </div>

        {/* Timeframe selector & Actions */}
        <div className="flex items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] p-0.5 text-xs font-medium">
            <button
              onClick={() => {
                playBeep(700, 0.03);
                setTimeframe("today");
              }}
              className={`px-3 py-1 rounded-[3px] transition-all cursor-pointer ${
                timeframe === "today"
                  ? "bg-[#d36d17] text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                playBeep(700, 0.03);
                setTimeframe("week");
              }}
              className={`px-3 py-1 rounded-[3px] transition-all cursor-pointer ${
                timeframe === "week"
                  ? "bg-[#d36d17] text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => {
                playBeep(700, 0.03);
                setTimeframe("month");
              }}
              className={`px-3 py-1 rounded-[3px] transition-all cursor-pointer ${
                timeframe === "month"
                  ? "bg-[#d36d17] text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Month
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-[4px] bg-[#222222] hover:bg-[#2c2c2c] text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw
              size={14}
              className={`${isRefreshing ? "animate-spin text-orange-400" : ""}`}
            />
          </button>

          {/* Print report button */}
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#222222] hover:bg-[#2c2c2c] text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-zinc-800"
            title="Print Daily Z-Report"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 pt-[72px] pb-12 px-5 max-w-7xl w-full mx-auto space-y-5">
        {/* ROW 1: 4 KPI Cards (Matching User's Reference Screenshot) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Sales */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] hover:border-orange-500/40 transition-all flex flex-col justify-between shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                Sales
              </span>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${
                  kpiData.salesChange >= 0
                    ? "text-emerald-400"
                    : "text-rose-500"
                }`}
              >
                {kpiData.salesChange >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>{Math.abs(kpiData.salesChange)}%</span>
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-full bg-[#ff9800] text-black flex items-center justify-center shrink-0 shadow-md">
                <ShoppingCart size={18} className="stroke-[2.5]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {kpiData.sales.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Card 2: Invoices */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] hover:border-red-500/40 transition-all flex flex-col justify-between shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                Invoices
              </span>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${
                  kpiData.invoicesChange >= 0
                    ? "text-emerald-400"
                    : "text-rose-500"
                }`}
              >
                {kpiData.invoicesChange >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>{Math.abs(kpiData.invoicesChange)}%</span>
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-full bg-[#f44336] text-white flex items-center justify-center shrink-0 shadow-md">
                <FileText size={18} className="stroke-[2.5]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {kpiData.invoices}
              </div>
            </div>
          </div>

          {/* Card 3: Dine In */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Dine In
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                {kpiData.dineInShare > 0 ? `${kpiData.dineInShare}%` : "0%"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-full bg-[#2196f3] text-white flex items-center justify-center shrink-0 shadow-md">
                <Utensils size={18} className="stroke-[2.5]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {kpiData.dineIn.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Card 4: Delivery */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-sm group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Delivery
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                {kpiData.deliveryShare > 0 ? `${kpiData.deliveryShare}%` : "0%"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-full bg-[#4caf50] text-white flex items-center justify-center shrink-0 shadow-md">
                <FaMotorcycle size={18} />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                {kpiData.delivery.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Charts (Sales Area Chart + Total Sales Donut Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: Hourly Sales Area Chart (7 cols on lg) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-[#181818] border border-[#282828] flex flex-col justify-between shadow-sm">
            {/* Chart Title & Toggle */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Sales
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Hourly revenue velocity • Peak rush at 14:00
                </p>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-[#121212] border border-[#282828] rounded-[3px] p-0.5 text-[11px]">
                <button
                  onClick={() => setMetricView("sales")}
                  className={`px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                    metricView === "sales"
                      ? "bg-orange-500/20 text-[#f97316] font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setMetricView("orders")}
                  className={`px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                    metricView === "orders"
                      ? "bg-orange-500/20 text-[#f97316] font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>

            {/* Area Chart SVG */}
            <div className="relative w-full h-[220px]">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Glowing orange gradient fill matching screenshot */}
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.75" />
                    <stop offset="40%" stopColor="#ea580c" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Subtle glow filter */}
                  <filter
                    id="glow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="3"
                      floodColor="#f97316"
                      floodOpacity="0.4"
                    />
                  </filter>
                </defs>

                {/* Horizontal gridlines */}
                {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000].map(
                  (level) => {
                    const y =
                      chartHeight -
                      padding.bottom -
                      (level / 4000) *
                        (chartHeight - padding.top - padding.bottom);
                    return (
                      <g key={level}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#262626"
                          strokeDasharray="2 2"
                          strokeWidth="1"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 3.5}
                          fill="#737373"
                          fontSize="9"
                          textAnchor="end"
                          fontFamily="monospace"
                        >
                          {level}
                        </text>
                      </g>
                    );
                  },
                )}

                {/* Gradient Fill under curve */}
                <path d={areaD} fill="url(#salesGradient)" />

                {/* Main Stroke line with glowing drop-shadow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />

                {/* Data points & X-axis labels */}
                {points.map((pt, i) => (
                  <g key={i}>
                    {/* X-axis hour tick */}
                    <text
                      x={pt.x}
                      y={chartHeight - 10}
                      fill="#888888"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {pt.data.hour}
                    </text>

                    {/* Circular Interactive Point */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={
                        hoveredPoint?.hour === pt.data.hour
                          ? 5
                          : pt.data.sales > 0
                            ? 3.5
                            : 2
                      }
                      className="transition-all cursor-pointer"
                      fill={pt.data.sales > 0 ? "#ff9800" : "#555555"}
                      stroke="#181818"
                      strokeWidth="1.5"
                      onMouseEnter={() => setHoveredPoint(pt.data)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint && (
                <div
                  className="absolute z-20 bg-[#121212] border border-orange-500/50 text-white p-2 rounded-lg text-xs shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: `${
                      ((hourlyData.findIndex(
                        (h) => h.hour === hoveredPoint.hour,
                      ) /
                        (hourlyData.length - 1)) *
                        (chartWidth - padding.left - padding.right) +
                        padding.left) /
                      (chartWidth / 100)
                    }%`,
                    top: "30%",
                  }}
                >
                  <div className="font-bold text-orange-400">
                    {hoveredPoint.label}
                  </div>
                  <div className="font-mono text-white">
                    ₦{hoveredPoint.sales.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {hoveredPoint.orders} order(s)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Total Sales Category Donut Chart (4 cols on lg) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-[#181818] border border-[#282828] flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Total Sales
              </h3>
              <p className="text-[11px] text-zinc-400">
                Category revenue breakdown
              </p>
            </div>

            {/* Central Donut SVG */}
            <div className="flex flex-col items-center justify-center my-2 relative">
              <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                <svg
                  width={donutSize}
                  height={donutSize}
                  className="transform -rotate-90 overflow-visible"
                >
                  {/* Background track circle */}
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="transparent"
                    stroke="#262626"
                    strokeWidth={strokeWidth}
                  />

                  {/* Slices */}
                  {categorySales.map((cat, i) => {
                    const strokeDasharray = `${
                      (cat.percentage / 100) * circumference
                    } ${circumference}`;
                    const strokeDashoffset = -categorySales
                      .slice(0, i)
                      .reduce(
                        (sum, c) => sum + (c.percentage / 100) * circumference,
                        0,
                      );

                    return (
                      <circle
                        key={cat.name}
                        cx={donutSize / 2}
                        cy={donutSize / 2}
                        r={radius}
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer hover:opacity-90"
                        onMouseEnter={() => setActiveCategory(cat.name)}
                        onMouseLeave={() => setActiveCategory(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Cutout Center Text matching Screenshot */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-base sm:text-lg font-bold font-mono text-white leading-tight">
                    {kpiData.sales.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">
                    {activeCategory || "3500"}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Legend matching Screenshot */}
            <div className="pt-2 border-t border-[#242424] space-y-1.5">
              {categorySales.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs cursor-pointer hover:text-white transition-colors"
                  onMouseEnter={() => setActiveCategory(cat.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-zinc-300 font-medium">
                      {cat.name}
                    </span>
                  </div>
                  <div className="font-mono text-zinc-400">
                    <span className="text-white font-semibold mr-1.5">
                      ₦{cat.amount.toFixed(2)}
                    </span>
                    <span>({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: Outstanding Extensions (Leaderboard, Payment Split, Live Invoices) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Top Selling Menu Items (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-[#181818] border border-[#282828] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Top Menu Items
                </h3>
                <p className="text-[11px] text-zinc-400">Most ordered dishes</p>
              </div>
              <Sparkles size={16} className="text-amber-400" />
            </div>

            <div className="space-y-3 pt-1">
              {topItems.map((item, idx) => (
                <div key={item.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-white truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-zinc-200 shrink-0 ml-2">
                      ₦{item.revenue.toFixed(2)}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Invoices & Live Order Activity (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-[#181818] border border-[#282828] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Recent Invoices
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Real-time cashier settlement log
                </p>
              </div>
              <Link
                href="/sales-room"
                className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-0.5"
              >
                <span>View Rooms</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#262626] text-zinc-500 font-medium text-[11px]">
                    <th className="pb-2">Order</th>
                    <th className="pb-2">Channel</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-2.5 font-bold font-mono text-white">
                        #{inv.orderNumber}
                        <div className="text-[10px] text-zinc-500 font-normal">
                          {inv.time}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                          style={{
                            backgroundColor: `${inv.channelColor}15`,
                            color: inv.channelColor,
                            borderColor: `${inv.channelColor}30`,
                          }}
                        >
                          {inv.channel}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-300 truncate max-w-[120px]">
                        {inv.customer}
                      </td>
                      <td className="py-2.5 text-zinc-400 font-medium">
                        {inv.paymentMethod}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-right text-emerald-400">
                        ₦{inv.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ROW 4: Shift Balancing & POS Register Status Bar */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#1c1c1c] via-[#191919] to-[#161616] border border-[#282828] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Banknote size={15} className="text-amber-400" />
              <div>
                <span className="text-[10px] text-zinc-400 block leading-tight">
                  Cash Drawer Float
                </span>
                <span className="font-mono font-bold text-white">
                  ₦35,000.00
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard size={15} className="text-blue-400" />
              <div>
                <span className="text-[10px] text-zinc-400 block leading-tight">
                  Electronic Payments
                </span>
                <span className="font-mono font-bold text-white">
                  ₦11,500.00
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={15} className="text-emerald-400" />
              <div>
                <span className="text-[10px] text-zinc-400 block leading-tight">
                  Avg Kitchen Prep
                </span>
                <span className="font-mono font-bold text-white">9 mins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quick-sales"
              className="px-4 py-2 rounded-lg bg-[#0daa2b] hover:bg-[#0c9827] text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <ShoppingCart size={14} />
              <span>Open POS Register</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
