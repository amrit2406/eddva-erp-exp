import { Info } from 'lucide-react';

interface AccessNoticeProps {
  isViewOnlyAdmin: boolean;
  className?: string;
}

export default function AccessNotice({ isViewOnlyAdmin, className }: AccessNoticeProps) {
  return (
    <div className={`flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 ${className ?? ''}`}>
      <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p>
        {isViewOnlyAdmin ? (
          <>
            Institute Admin has <strong>view-only</strong> access to Admission operations. To add or change records,
            sign in at <a href="/admission/login" className="underline font-medium">/admission/login</a> with an
            account that has an Admission role.
          </>
        ) : (
          <>Your Admission role doesn't allow this action. Ask an Institute Admin to update your role's permissions.</>
        )}
      </p>
    </div>
  );
}
