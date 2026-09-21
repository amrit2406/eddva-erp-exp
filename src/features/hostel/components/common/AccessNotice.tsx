import { Info } from 'lucide-react';

interface AccessNoticeProps {
  className?: string;
}

export default function AccessNotice({ className }: AccessNoticeProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 ${className ?? ''}`}
    >
      <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p>Your Hostel role doesn't allow this action. Ask an Institute Admin to update your role's permissions.</p>
    </div>
  );
}
