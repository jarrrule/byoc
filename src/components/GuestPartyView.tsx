"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, User } from "lucide-react";
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
  const [highlightName, setHighlightName] = useState(false);
  const nameSectionRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
    if (name.trim()) {
      setHighlightName(false);
    }
  }

  function promptForGuestName() {
    setHighlightName(true);
    setActionError("Enter your name above before claiming an item.");
    nameSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => nameInputRef.current?.focus(), 300);
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
  const hasGuestName = Boolean(guestName.trim());

  return (
    <div className="space-y-5">
      <PartyHeader
        name={party.name}
        date={party.date}
        location={party.location}
      />

      {!hasGuestName && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3.5 ring-1 ring-amber-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Start here</p>
            <p className="mt-0.5 text-sm text-amber-800">
              Add your name below before you can claim anything. It&apos;s saved for this session.
            </p>
          </div>
        </div>
      )}

      <div
        ref={nameSectionRef}
        className={`rounded-2xl bg-white p-5 shadow-md transition-all ${
          hasGuestName
            ? "shadow-indigo-100/80 ring-1 ring-indigo-100"
            : highlightName
              ? "shadow-amber-200/80 ring-2 ring-amber-400"
              : "shadow-amber-100/80 ring-2 ring-amber-300"
        }`}
      >
        <label htmlFor="guest-name" className="mb-2 block text-sm font-semibold text-slate-800">
          {hasGuestName ? "Your Name" : "Step 1: Your Name"}{" "}
          <span className="text-amber-600">*</span>
        </label>
        <div className="relative">
          <User
            className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
              hasGuestName ? "text-indigo-400" : "text-amber-500"
            }`}
          />
          <input
            ref={nameInputRef}
            id="guest-name"
            type="text"
            value={guestName}
            onChange={(e) => handleGuestNameChange(e.target.value)}
            placeholder="e.g. Sarah"
            autoComplete="name"
            className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
              hasGuestName
                ? "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                : "border-amber-300 focus:border-amber-400 focus:ring-amber-100"
            }`}
          />
        </div>
        {!hasGuestName && (
          <p className="mt-2 text-sm font-medium text-amber-700">
            Required to claim items — tap a claim button and we&apos;ll bring you back here.
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
              hasGuestName={hasGuestName}
              onClaim={handleClaim}
              onUnclaim={handleUnclaim}
              onNeedName={promptForGuestName}
              isBusy={busyItemId === item.id}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
