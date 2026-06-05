"use client";

import { useEffect, useState } from "react";
import { Check, Undo2 } from "lucide-react";
import {
  formatQuantityLabel,
  getGuestClaim,
  getRemainingQuantity,
  isFullyClaimed,
  type PartyItem,
} from "@/types/party";

interface ItemRowProps {
  item: PartyItem;
  guestName: string;
  onClaim: (itemId: string, quantity: number) => void;
  onUnclaim: (itemId: string) => void;
  isBusy?: boolean;
}

export default function ItemRow({
  item,
  guestName,
  onClaim,
  onUnclaim,
  isBusy = false,
}: ItemRowProps) {
  const remaining = getRemainingQuantity(item);
  const fullyClaimed = isFullyClaimed(item);
  const ownClaim = guestName.trim() ? getGuestClaim(item, guestName) : undefined;
  const otherClaims = item.claims.filter(
    (claim) => claim.guestName.trim().toLowerCase() !== guestName.trim().toLowerCase()
  );

  const [claimAmount, setClaimAmount] = useState(1);

  useEffect(() => {
    setClaimAmount((current) => Math.min(Math.max(1, current), Math.max(1, remaining)));
  }, [remaining]);

  const progressPercent = Math.min(
    100,
    Math.round((item.quantityClaimed / item.quantityNeeded) * 100)
  );

  const unitLabel = item.unit.trim();
  const quantitySuffix = unitLabel ? ` ${unitLabel}` : "";

  return (
    <li
      className={`rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100 ${
        fullyClaimed ? "opacity-90" : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p
            className={`font-medium text-slate-800 ${
              fullyClaimed ? "line-through decoration-slate-300" : ""
            }`}
          >
            {item.name}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            Need {formatQuantityLabel(item)}
          </p>

          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>
                {item.quantityClaimed} of {item.quantityNeeded} claimed
              </span>
              {!fullyClaimed && (
                <span className="text-indigo-500">
                  {remaining} more needed
                </span>
              )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {item.claims.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {otherClaims.map((claim) => (
                <span
                  key={claim.id}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  <Check className="h-3 w-3 text-emerald-500" />
                  {claim.guestName}: {claim.quantity}
                  {quantitySuffix}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {ownClaim && (
            <div className="flex flex-col gap-2 sm:items-end">
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <Check className="h-3.5 w-3.5" />
                You&apos;re bringing {ownClaim.quantity}
                {quantitySuffix}
              </span>
              <button
                type="button"
                onClick={() => onUnclaim(item.id)}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 hover:ring-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Unclaim
              </button>
            </div>
          )}

          {!fullyClaimed && (
            <div className="flex items-center gap-2">
              <select
                value={claimAmount}
                onChange={(e) => setClaimAmount(Number(e.target.value))}
                disabled={!guestName.trim() || isBusy}
                aria-label={`How many ${item.name} to claim`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {Array.from({ length: remaining }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onClaim(item.id, claimAmount)}
                disabled={!guestName.trim() || isBusy || remaining < 1}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-600 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                Claim
              </button>
            </div>
          )}

          {fullyClaimed && !ownClaim && (
            <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <Check className="h-3.5 w-3.5" />
              Fully claimed
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
