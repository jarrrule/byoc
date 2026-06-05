import { NextResponse } from "next/server";
import { claimPartyItem } from "@/lib/parties";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const itemId = typeof body.itemId === "string" ? body.itemId : "";
    const guestName = typeof body.guestName === "string" ? body.guestName.trim() : "";

    if (!itemId || !guestName) {
      return NextResponse.json(
        { error: "Item ID and guest name are required" },
        { status: 400 }
      );
    }

    const result = await claimPartyItem(id, itemId, guestName);

    if ("error" in result) {
      if (result.error === "not_found") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      return NextResponse.json({ error: "Item already claimed" }, { status: 409 });
    }

    return NextResponse.json(result.party);
  } catch (error) {
    console.error("Failed to claim item:", error);
    return NextResponse.json({ error: "Failed to claim item" }, { status: 500 });
  }
}
