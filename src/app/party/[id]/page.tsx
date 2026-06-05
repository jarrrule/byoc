import { PartyPopper } from "lucide-react";
import GuestPartyView from "@/components/GuestPartyView";

interface PartyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-full bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <header className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200">
            <PartyPopper className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-wide text-indigo-600">
            BYOC
          </span>
        </header>

        <GuestPartyView partyId={id} />
      </div>
    </div>
  );
}
