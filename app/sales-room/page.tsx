import { SalesRoomScreen } from "@/components/sales-room/SalesRoomScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Room - HalalBite POS",
  description: "Dine In, Take Away, and Delivery room management for restaurant POS.",
};

export default function SalesRoomPage() {
  return <SalesRoomScreen />;
}
