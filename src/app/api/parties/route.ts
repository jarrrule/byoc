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
      .map(
        (item: {
          name?: string;
          quantityNeeded?: number;
          unit?: string;
          quantity?: string;
        }) => {
          const itemName = typeof item.name === "string" ? item.name.trim() : "";
          const unit = typeof item.unit === "string" ? item.unit.trim() : "";
          let quantityNeeded =
            typeof item.quantityNeeded === "number" ? item.quantityNeeded : 1;

          if (!Number.isInteger(quantityNeeded) || quantityNeeded < 1) {
            quantityNeeded = 1;
          }

          return { name: itemName, quantityNeeded, unit };
        }
      )
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

    const message =
      error instanceof Error ? error.message : "Failed to create party";

    const isSchemaError =
      message.includes("column") ||
      message.includes("relation") ||
      message.includes("does not exist");

    return NextResponse.json(
      {
        error: isSchemaError
          ? "Database schema is out of date. Redeploy the app to run migrations."
          : "Failed to create party",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
