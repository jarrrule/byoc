import { PartyPopper } from "lucide-react";
import HostCreateForm from "@/components/HostCreateForm";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <PartyPopper className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            BYOC
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Bring Your Own Contribution
          </p>
          <p className="mt-3 text-base text-slate-600">
            Create your party list and share a link so guests can claim what
            they&apos;ll bring.
          </p>
        </header>

        <HostCreateForm />
      </div>
    </div>
  );
}
