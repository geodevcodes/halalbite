export type KitchenOrderStatus = "queued" | "cooking" | "completed";

export type KitchenStation =
  | "All Stations"
  | "Kitchen Main (Hot Food)"
  | "Grill & BBQ"
  | "Dessert & Drinks";

export interface KitchenTicketItem {
  id: string;
  name: string;
  quantity: number;
  station: KitchenStation;
  notes?: string;
  isReady?: boolean;
}

export interface KitchenTicket {
  id: string;
  orderNumber: number;
  kotNumber: string; // e.g. "KOT - 01"
  orderType: "Delivery" | "Take Away" | "Dine In";
  roomTable?: string; // e.g. "Dine In - T 1", "Dine In - T 2"
  printerStation: string; // e.g. "Printer one"
  timeString: string; // e.g. "10:12"
  orderTime: string; // e.g. "10:12 AM, 07 Nov 2026"
  createdAt: number; // timestamp in ms for live elapsed calculation
  startedAt?: number;
  completedAt?: number;
  status: KitchenOrderStatus;
  items: KitchenTicketItem[];
  customerName?: string;
  customerPhone?: string;
  waiterName?: string;
}
