import Card from '../../../components/ui/Card';
import { Users } from 'lucide-react';

export default function AttendanceOverview() {
  return (
    <Card className="p-6 border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Today's Attendance</h3>
        <Users className="h-5 w-5 text-slate-400" />
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Present</span>
            <span className="font-medium text-slate-900">94.4%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#008BE9] rounded-full" style={{ width: '94.4%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Absent</span>
            <span className="font-medium text-slate-900">5.6%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '5.6%' }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
