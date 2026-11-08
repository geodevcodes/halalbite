import { DashboardAnalyticsScreen } from "@/components/dashboard/DashboardAnalyticsScreen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Analytics - HalalBite POS",
  description: "Real-time restaurant sales performance, hourly revenue velocity, and business analytics.",
};

export default function DashboardPage() {
  return <DashboardAnalyticsScreen />;
}
