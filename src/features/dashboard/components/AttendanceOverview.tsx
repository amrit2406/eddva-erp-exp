import Card from '../../../components/ui/Card';
import { Users } from 'lucide-react';

export default function AttendanceOverview() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
        <Users className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Present</span>
            <span className="font-medium">94.4%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '94.4%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Absent</span>
            <span className="font-medium">5.6%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '5.6%' }} />
          </div>
        </div>
      </div>
    </Card>
  );
}
