import { QuickSalesScreen } from "@/components/quick-sales/QuickSalesScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Sales - HalalBite POS",
  description: "High-speed restaurant billing and payment terminal for cashiers.",
};

export default function QuickSalesPage() {
  return <QuickSalesScreen />;
}
