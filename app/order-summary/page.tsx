import { Suspense } from "react";
import { OrderSummaryScreen } from "@/components/order-summary/OrderSummaryScreen";

export const metadata = {
  title: "Order Summary | HalalBite POS",
  description: "View and manage active, settled, and voided orders in HalalBite POS",
};

export default function OrderSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111111] flex items-center justify-center text-neutral-400 text-sm">
          Loading HalalBite Order Summary...
        </div>
      }
    >
      <OrderSummaryScreen />
    </Suspense>
  );
}
