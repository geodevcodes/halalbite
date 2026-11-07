import { Suspense } from "react";
import { QuickSalesScreen } from "@/components/quick-sales/QuickSalesScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Sales - HalalBite POS",
  description: "High-speed restaurant billing and payment terminal for cashiers.",
};

export default function QuickSalesPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#121212] flex items-center justify-center text-zinc-500 text-xs">Loading Quick Sales...</div>}>
      <QuickSalesScreen />
    </Suspense>
  );
}
