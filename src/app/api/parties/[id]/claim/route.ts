import { NextResponse } from "next/server";
import { claimPartyItem } from "@/lib/parties";

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
    const quantity =
      typeof body.quantity === "number" ? Math.floor(body.quantity) : 1;

    if (!itemId || !guestName) {
      return NextResponse.json(
        { error: "Item ID and guest name are required" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    const result = await claimPartyItem(id, itemId, guestName, quantity);

    if ("error" in result) {
      if (result.error === "not_found") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Not enough quantity remaining" },
        { status: 409 }
      );
    }

    return NextResponse.json(result.party);
  } catch (error) {
    return errorResponse(error, "Failed to claim item");
  }
}
