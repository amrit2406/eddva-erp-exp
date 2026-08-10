import { cn } from '../../../../utils/cn';

interface RecordDetailsProps {
  title: string;
  details: Array<{ label: string; value: string | React.ReactNode }>;
  className?: string;
}

export default function RecordDetails({ title, details, className }: RecordDetailsProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-lg p-6', className)}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail, index) => (
          <div key={index}>
            <dt className="text-sm font-medium text-slate-600">{detail.label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
