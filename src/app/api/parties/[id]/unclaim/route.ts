import { NextResponse } from "next/server";
import { unclaimPartyItem } from "@/lib/parties";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function errorResponse(error: unknown, fallback: string) {
  console.error(fallback, error);

  const message = error instanceof Error ? error.message : fallback;

  return NextResponse.json(
    {
      error: fallback,
      detail: message,
    },
    { status: 500 }
  );
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

    const result = await unclaimPartyItem(id, itemId, guestName);

    if ("error" in result) {
      if (result.error === "not_found") {
        return NextResponse.json({ error: "Party not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "You can only unclaim your own contributions" },
        { status: 403 }
      );
    }

    return NextResponse.json(result.party);
  } catch (error) {
    return errorResponse(error, "Failed to unclaim item");
  }
}
