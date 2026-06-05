import { NextResponse } from "next/server";
import { createParty } from "@/lib/parties";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const date = typeof body.date === "string" ? body.date : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const items = Array.isArray(body.items) ? body.items : [];

    if (!name) {
      return NextResponse.json({ error: "Party name is required" }, { status: 400 });
    }

    const parsedItems = items
      .map((item: { name?: string; quantity?: string }) => ({
        name: typeof item.name === "string" ? item.name.trim() : "",
        quantity: typeof item.quantity === "string" ? item.quantity.trim() : "",
      }))
      .filter((item: { name: string }) => item.name);

    if (parsedItems.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const party = await createParty({
      name,
      date,
      location,
      items: parsedItems,
    });

    return NextResponse.json(party, { status: 201 });
  } catch (error) {
    console.error("Failed to create party:", error);
    return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
  }
}
