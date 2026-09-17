import { ShieldAlert } from 'lucide-react';
import Card from '../../../../components/ui/Card';

interface InstituteAdminGuardProps {
  section: string;
}

export default function InstituteAdminGuard({ section }: InstituteAdminGuardProps) {
  return (
    <Card className="border-slate-200">
      <div className="p-10 text-center">
        <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Institute Admin access required</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          {section} can only be managed by the Institute Admin. Please log in through the SSO admin flow to access this
          section.
        </p>
      </div>
    </Card>
  );
}
