import { Mail, Phone, Building, User } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface PersonInfoProps {
  name: string;
  email?: string;
  phone?: string;
  organization?: string;
  designation?: string;
  avatar?: string;
  className?: string;
}

export default function PersonInfo({ name, email, phone, organization, designation, avatar, className }: PersonInfoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {avatar ? (
        <img src={avatar} alt={name} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-[#008BE9]/10 flex items-center justify-center">
          <User className="h-5 w-5 text-[#002C6D]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{name}</p>
        {designation && <p className="text-sm text-slate-600">{designation}</p>}
        {(email || phone || organization) && (
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
            {email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {email}
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {phone}
              </span>
            )}
            {organization && (
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {organization}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
