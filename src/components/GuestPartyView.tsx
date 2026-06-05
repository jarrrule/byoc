"use client";

import { useCallback, useEffect, useState } from "react";
import { User } from "lucide-react";
import PartyHeader from "@/components/PartyHeader";
import ItemRow from "@/components/ItemRow";
import { getGuestName, setGuestName } from "@/lib/guest-session";
import { isFullyClaimed, type Party } from "@/types/party";

interface GuestPartyViewProps {
  partyId: string;
}

export default function GuestPartyView({ partyId }: GuestPartyViewProps) {
  const [party, setParty] = useState<Party | null>(null);
  const [guestName, setGuestNameState] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

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
    setGuestNameState(getGuestName(partyId));
    loadParty();
  }, [partyId, loadParty]);

  function handleGuestNameChange(name: string) {
    setGuestNameState(name);
    setGuestName(partyId, name);
  }

  async function handleClaim(itemId: string, quantity: number) {
    const name = guestName.trim();
    if (!name || !party) return;

    setActionError("");
    setBusyItemId(itemId);

    try {
      const response = await fetch(`/api/parties/${partyId}/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, guestName: name, quantity }),
      });

      if (response.ok) {
        setParty(await response.json());
        return;
      }

      if (response.status === 409) {
        setActionError("Someone else just claimed the last of that item. Refreshing...");
        await loadParty();
        return;
      }

      const data = await response.json().catch(() => null);
      setActionError(
        [data?.error, data?.detail].filter(Boolean).join(" — ") ||
          "Failed to claim item"
      );
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleUnclaim(itemId: string) {
    const name = guestName.trim();
    if (!name || !party) return;

    setActionError("");
    setBusyItemId(itemId);

    try {
      const response = await fetch(`/api/parties/${partyId}/unclaim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, guestName: name }),
      });

      if (response.ok) {
        setParty(await response.json());
        return;
      }

      const data = await response.json().catch(() => null);
      setActionError(
        [data?.error, data?.detail].filter(Boolean).join(" — ") ||
          "Failed to unclaim item"
      );
    } finally {
      setBusyItemId(null);
    }
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

  const fullyClaimedCount = party.items.filter((item) => isFullyClaimed(item)).length;

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
            onChange={(e) => handleGuestNameChange(e.target.value)}
            placeholder="Enter your name to claim items"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        {!guestName.trim() && (
          <p className="mt-2 text-xs text-slate-500">
            Required before you can claim an item. Saved for this session so you can unclaim later.
          </p>
        )}
      </div>

      {actionError && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-100">
          {actionError}
        </p>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-slate-800">What to Bring</h2>
          <span className="text-xs font-medium text-indigo-500">
            {fullyClaimedCount}/{party.items.length} complete
          </span>
        </div>

        <ul className="space-y-2.5">
          {party.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              guestName={guestName}
              onClaim={handleClaim}
              onUnclaim={handleUnclaim}
              isBusy={busyItemId === item.id}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
