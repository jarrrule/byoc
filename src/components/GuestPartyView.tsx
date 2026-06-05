"use client";

import { useCallback, useEffect, useState } from "react";
import { User } from "lucide-react";
import PartyHeader from "@/components/PartyHeader";
import ItemRow from "@/components/ItemRow";
import type { Party } from "@/types/party";

interface GuestPartyViewProps {
  partyId: string;
}

export default function GuestPartyView({ partyId }: GuestPartyViewProps) {
  const [party, setParty] = useState<Party | null>(null);
  const [guestName, setGuestName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [claimError, setClaimError] = useState("");

  const loadParty = useCallback(async () => {
    const response = await fetch(`/api/parties/${partyId}`);
    if (response.ok) {
      setParty(await response.json());
    } else {
      setParty(null);
    }
    setLoaded(true);
  }, [partyId]);

  useEffect(() => {
    loadParty();
  }, [loadParty]);

  async function handleClaim(itemId: string) {
    const name = guestName.trim();
    if (!name || !party) return;

    setClaimError("");

    const response = await fetch(`/api/parties/${partyId}/claim`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, guestName: name }),
    });

    if (response.ok) {
      setParty(await response.json());
      return;
    }

    if (response.status === 409) {
      setClaimError("Someone else just claimed that item. Refreshing...");
      await loadParty();
      return;
    }

    const data = await response.json().catch(() => null);
    setClaimError(data?.error ?? "Failed to claim item");
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
      </div>
    );
  }

  if (!party) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-md ring-1 ring-indigo-100">
        <p className="text-lg font-semibold text-slate-800">Party not found</p>
        <p className="mt-2 text-sm text-slate-500">
          This link may have expired or the party hasn&apos;t been created yet.
        </p>
      </div>
    );
  }

  const claimedCount = party.items.filter((item) => item.claimedBy).length;

  return (
    <div className="space-y-5">
      <PartyHeader
        name={party.name}
        date={party.date}
        location={party.location}
      />

      <div className="rounded-2xl bg-white p-5 shadow-md shadow-indigo-100/80 ring-1 ring-indigo-100">
        <label htmlFor="guest-name" className="mb-2 block text-sm font-medium text-slate-700">
          Your Name <span className="text-indigo-500">*</span>
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
          <input
            id="guest-name"
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name to claim items"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        {!guestName.trim() && (
          <p className="mt-2 text-xs text-slate-500">
            Required before you can claim an item.
          </p>
        )}
      </div>

      {claimError && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">
          {claimError}
        </p>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-slate-800">What to Bring</h2>
          <span className="text-xs font-medium text-indigo-500">
            {claimedCount}/{party.items.length} claimed
          </span>
        </div>

        <ul className="space-y-2.5">
          {party.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              guestName={guestName}
              onClaim={handleClaim}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
