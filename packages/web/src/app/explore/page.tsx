import type { Metadata } from "next";
import { ExplorePageContent } from "@/components/explore/ExplorePageContent";
import { APP_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Explore pools · ${APP_NAME}`,
  description: "Browse live salary benchmark pools by role, city, and seniority on Sepolia.",
};

export default function ExplorePage() {
  return <ExplorePageContent />;
}
