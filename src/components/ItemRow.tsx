import { Check } from "lucide-react";
import type { PartyItem } from "@/types/party";

interface ItemRowProps {
  item: PartyItem;
  guestName: string;
  onClaim: (itemId: string) => void;
}

export default function ItemRow({ item, guestName, onClaim }: ItemRowProps) {
  const isClaimed = Boolean(item.claimedBy);

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
      <div className="min-w-0 flex-1">
        <p
          className={`font-medium text-slate-800 ${isClaimed ? "line-through decoration-slate-300" : ""}`}
        >
          {item.name}
        </p>
        {item.quantity && (
          <p
            className={`mt-0.5 text-sm text-slate-500 ${isClaimed ? "line-through decoration-slate-300" : ""}`}
          >
            {item.quantity}
          </p>
        )}
      </div>

      {isClaimed ? (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <Check className="h-3.5 w-3.5" />
          Claimed by {item.claimedBy}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onClaim(item.id)}
          disabled={!guestName.trim()}
          className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-600 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          Claim
        </button>
      )}
    </li>
  );
}
