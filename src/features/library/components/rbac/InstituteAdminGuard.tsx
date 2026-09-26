import { ShieldAlert } from 'lucide-react';

interface InstituteAdminGuardProps {
  section: string;
}

export default function InstituteAdminGuard({ section }: InstituteAdminGuardProps) {
  return (
    <div className="rounded-3xl bg-white px-6 py-12 text-center shadow-soft ring-1 ring-slate-200/70">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
        <ShieldAlert className="h-7 w-7 text-amber-500" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Only the Institute Admin can do this</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        {section} can only be managed by the Institute Admin. Please sign in through the admin (SSO) login to continue.
      </p>
    </div>
  );
}
