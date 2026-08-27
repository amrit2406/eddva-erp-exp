import { Link } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import type { SportsParticipant } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface ParticipantTableProps {
  participants: SportsParticipant[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function ParticipantTable({ participants, className, onDelete }: ParticipantTableProps) {
  const participantsArray = Array.isArray(participants) ? participants : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Photo</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Class/Section</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Roll No.</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Gender</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {participantsArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No participants found. Add your first participant.
              </td>
            </tr>
          ) : (
            participantsArray.map((participant) => (
              <tr key={participant.participant_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  {participant.photo_url ? (
                    <img
                      src={participant.photo_url}
                      alt={participant.name}
                      className="h-8 w-8 rounded-full object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-100" />
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900">{participant.name}</div>
                  {participant.external_ref_id && (
                    <div className="text-xs text-slate-500">{participant.external_ref_id}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{participant.class_section || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{participant.roll_number || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 capitalize">{participant.gender || '—'}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sports/participants/${participant.participant_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(participant.participant_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
