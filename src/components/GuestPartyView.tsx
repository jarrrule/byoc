"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import PartyHeader from "@/components/PartyHeader";
import ItemRow from "@/components/ItemRow";
import { getParty, updateParty } from "@/lib/party-storage";
import type { Party } from "@/types/party";

interface GuestPartyViewProps {
  partyId: string;
}

export default function GuestPartyView({ partyId }: GuestPartyViewProps) {
  const [party, setParty] = useState<Party | null>(null);
  const [guestName, setGuestName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = getParty(partyId);
    setParty(data);
    setLoaded(true);
  }, [partyId]);

  function handleClaim(itemId: string) {
    const name = guestName.trim();
    if (!name || !party) return;

    const updated: Party = {
      ...party,
      items: party.items.map((item) =>
        item.id === itemId && !item.claimedBy
          ? { ...item, claimedBy: name }
          : item
      ),
    };

    setParty(updated);
    updateParty(updated);
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
