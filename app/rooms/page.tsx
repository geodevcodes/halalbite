import { SalesRoomScreen } from "@/components/sales-room/SalesRoomScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms - HalalBite POS",
  description: "Dine In, Take Away, and Delivery management for restaurant POS.",
};

export default function RoomsPage() {
  return <SalesRoomScreen />;
}
