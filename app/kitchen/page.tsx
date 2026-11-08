import { Suspense } from "react";
import { KitchenDisplayScreen } from "@/components/kitchen/KitchenDisplayScreen";

export const metadata = {
  title: "Kitchen Display System (KDS) | HalalBite POS",
  description: "Live kitchen tickets, order pacing, and station dispatch for HalalBite",
};

export default function KitchenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111111] flex items-center justify-center text-neutral-400 text-sm">
          Loading HalalBite Kitchen Display...
        </div>
      }
    >
      <KitchenDisplayScreen />
    </Suspense>
  );
}
