import { NextResponse } from "next/server";
import { discoverCategoriesFromContractLogs } from "@/lib/explore-discovery";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ETHERSCAN_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "ETHERSCAN_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const categories = await discoverCategoriesFromContractLogs(apiKey);
    return NextResponse.json(
      { categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discovery failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
