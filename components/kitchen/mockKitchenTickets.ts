import { KitchenTicket } from "./types";

const NOW = Date.now();

export const INITIAL_KITCHEN_TICKETS: KitchenTicket[] = [
  // Card 1: Order #9 (Cooking / In Progress - Orange Header in screenshot)
  {
    id: "kt-9",
    orderNumber: 9,
    kotNumber: "KOT - 01",
    orderType: "Delivery",
    printerStation: "Printer one",
    timeString: "10:12",
    orderTime: "10:12 AM",
    createdAt: NOW - 12 * 60 * 1000,
    startedAt: NOW - 6 * 60 * 1000,
    status: "cooking",
    customerName: "geodevinstitute",
    customerPhone: "08117740042",
    waiterName: "Admin",
    items: [
      {
        id: "item-9-1",
        name: "Jollof Rice and Chicken",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        notes: "Extra spicy pepper sauce, foil-sealed pack",
        isReady: false,
      },
    ],
  },

  // Card 2: Order #11 (Queued - Gray Header in screenshot)
  {
    id: "kt-11",
    orderNumber: 11,
    kotNumber: "KOT - 01",
    orderType: "Take Away",
    printerStation: "Printer one",
    timeString: "10:15",
    orderTime: "10:15 AM",
    createdAt: NOW - 8 * 60 * 1000,
    status: "queued",
    waiterName: "Admin",
    items: [
      {
        id: "item-11-1",
        name: "Meat rice with side Salad",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        notes: "Salad dressing on the side",
        isReady: false,
      },
    ],
  },

  // Card 3: Order #12 (Queued - Gray Header)
  {
    id: "kt-12",
    orderNumber: 12,
    kotNumber: "KOT - 01",
    orderType: "Take Away",
    printerStation: "Printer one",
    timeString: "10:16",
    orderTime: "10:16 AM",
    createdAt: NOW - 7 * 60 * 1000,
    status: "queued",
    waiterName: "Admin",
    items: [
      {
        id: "item-12-1",
        name: "Jollof Rice and Chicken",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        isReady: false,
      },
      {
        id: "item-12-2",
        name: "Ice cream tamu",
        quantity: 1,
        station: "Dessert & Drinks",
        notes: "Keep in deep freeze until pickup",
        isReady: false,
      },
    ],
  },

  // Card 4: Order #13 (Queued - Gray Header)
  {
    id: "kt-13",
    orderNumber: 13,
    kotNumber: "KOT - 01",
    orderType: "Take Away",
    printerStation: "Printer one",
    timeString: "10:16",
    orderTime: "10:16 AM",
    createdAt: NOW - 6 * 60 * 1000,
    status: "queued",
    waiterName: "Admin",
    items: [
      {
        id: "item-13-1",
        name: "Chicken meat with prawn and fish",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        notes: "Fresh prawns, well seasoned",
        isReady: false,
      },
      {
        id: "item-13-2",
        name: "Roasted meat with grilled potatoes",
        quantity: 1,
        station: "Grill & BBQ",
        notes: "Well roasted crispy skin",
        isReady: false,
      },
    ],
  },

  // Card 5: Order #14 (Queued - Dine In - T 1)
  {
    id: "kt-14",
    orderNumber: 14,
    kotNumber: "KOT - 01",
    orderType: "Dine In",
    roomTable: "Dine In - T 1",
    printerStation: "Printer one",
    timeString: "10:23",
    orderTime: "10:23 AM",
    createdAt: NOW - 3 * 60 * 1000,
    status: "queued",
    waiterName: "Admin",
    items: [
      {
        id: "item-14-1",
        name: "Vegetable Noodle Soup",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        notes: "Serve steaming hot",
        isReady: false,
      },
      {
        id: "item-14-2",
        name: "Jollof Rice and Chicken",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        isReady: false,
      },
    ],
  },

  // Card 6: Order #16 (Queued - Dine In - T 2)
  {
    id: "kt-16",
    orderNumber: 16,
    kotNumber: "KOT - 01",
    orderType: "Dine In",
    roomTable: "Dine In - T 2",
    printerStation: "Printer one",
    timeString: "17:03",
    orderTime: "05:03 PM",
    createdAt: NOW - 1 * 60 * 1000,
    status: "queued",
    waiterName: "Admin",
    items: [
      {
        id: "item-16-1",
        name: "Chicken meat with prawn and fish",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        isReady: false,
      },
      {
        id: "item-16-2",
        name: "Meat rice with side Salad",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        isReady: false,
      },
    ],
  },

  // Completed Orders (for Completed (2) tab)
  {
    id: "kt-8",
    orderNumber: 8,
    kotNumber: "KOT - 01",
    orderType: "Delivery",
    printerStation: "Printer one",
    timeString: "09:05",
    orderTime: "09:05 AM",
    createdAt: NOW - 75 * 60 * 1000,
    startedAt: NOW - 70 * 60 * 1000,
    completedAt: NOW - 62 * 60 * 1000,
    status: "completed",
    customerName: "Cash Customer",
    waiterName: "Admin",
    items: [
      {
        id: "item-8-1",
        name: "Jollof Rice and Chicken",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        isReady: true,
      },
    ],
  },
  {
    id: "kt-10",
    orderNumber: 10,
    kotNumber: "KOT - 01",
    orderType: "Delivery",
    printerStation: "Printer one",
    timeString: "10:15",
    orderTime: "10:15 AM",
    createdAt: NOW - 30 * 60 * 1000,
    startedAt: NOW - 25 * 60 * 1000,
    completedAt: NOW - 18 * 60 * 1000,
    status: "completed",
    customerName: "Abdullah",
    customerPhone: "08133642798",
    waiterName: "Admin",
    items: [
      {
        id: "item-10-1",
        name: "Fried rice",
        quantity: 1,
        station: "Kitchen Main (Hot Food)",
        isReady: true,
      },
    ],
  },
];
