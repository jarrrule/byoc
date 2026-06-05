"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Link2, MapPin, Plus, Trash2 } from "lucide-react";

interface DraftItem {
  id: string;
  name: string;
  quantityNeeded: number;
  unit: string;
}

export default function HostCreateForm() {
  const router = useRouter();
  const [partyName, setPartyName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemUnit, setItemUnit] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleAddItem() {
    const name = itemName.trim();
    if (!name) return;

    const quantityNeeded = Math.max(1, parseInt(itemQuantity, 10) || 1);

    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        quantityNeeded,
        unit: itemUnit.trim(),
      },
    ]);
    setItemName("");
    setItemQuantity("1");
    setItemUnit("");
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleGenerateLink() {
    if (!partyName.trim() || items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: partyName.trim(),
          date,
          location: location.trim(),
          items: items.map((item) => ({
            name: item.name,
            quantityNeeded: item.quantityNeeded,
            unit: item.unit,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          [data?.error, data?.detail].filter(Boolean).join(" — ") ||
            "Failed to create party"
        );
      }

      const party = await response.json();
      console.log("Party data:", party);
      router.push(`/party/${party.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canGenerate = partyName.trim() && items.length > 0 && !isSubmitting;

  function formatDraftQuantity(item: DraftItem): string {
    if (!item.unit) return `${item.quantityNeeded}`;
    return `${item.quantityNeeded} ${item.unit}`;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-md shadow-indigo-100/80 ring-1 ring-indigo-100">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Party Details</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="party-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Party Name
            </label>
            <input
              id="party-name"
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Summer BBQ Bash"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="party-date" className="mb-1.5 block text-sm font-medium text-slate-700">
              Date
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
              <input
                id="party-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="party-location" className="mb-1.5 block text-sm font-medium text-slate-700">
              Location
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
              <input
                id="party-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="123 Backyard Lane"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-md shadow-indigo-100/80 ring-1 ring-indigo-100">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Items Needed</h2>

        <div className="mb-4 flex flex-col gap-3">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
            placeholder="Item name (e.g. Beer)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              min={1}
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              placeholder="Qty needed"
              aria-label="Quantity needed"
              className="sm:w-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <input
              type="text"
              value={itemUnit}
              onChange={(e) => setItemUnit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddItem())}
              placeholder="Unit (e.g. beers, bottles)"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!itemName.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
              >
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">Need {formatDraftQuantity(item)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-100">
            No items yet. Add what guests should bring!
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerateLink}
        disabled={!canGenerate}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-600 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        <Link2 className="h-5 w-5" />
        {isSubmitting ? "Creating..." : "Generate Party Link"}
      </button>
    </div>
  );
}
