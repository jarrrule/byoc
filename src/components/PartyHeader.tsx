import { Calendar, MapPin, PartyPopper } from "lucide-react";

interface PartyHeaderProps {
  name: string;
  date: string;
  location: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PartyHeader({ name, date, location }: PartyHeaderProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md shadow-indigo-100/80 ring-1 ring-indigo-100">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
          <PartyPopper className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
            You&apos;re invited
          </p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{name}</h1>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-600">
        {date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>{formatDate(date)}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
