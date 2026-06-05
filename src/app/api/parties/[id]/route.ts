import { NextResponse } from "next/server";
import { getPartyById } from "@/lib/parties";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const party = await getPartyById(id);

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    return NextResponse.json(party);
  } catch (error) {
    console.error("Failed to fetch party:", error);
    return NextResponse.json({ error: "Failed to fetch party" }, { status: 500 });
  }
}
