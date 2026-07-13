import type { Metadata } from "next";
import { HomePage as HomeScreen } from "@/features/home/HomePage";

export const metadata: Metadata = {
  title: "Casa Rosier Cerámica",
  description: "Studio de ceramica en Barcelona"
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  return <HomeScreen />;
}
