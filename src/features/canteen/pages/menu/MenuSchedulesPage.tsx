import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Database } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getMenuItems, getItemSchedules, deleteMenuSchedule } from '../../api/canteen.api';
import type { MenuItem, MenuSchedule } from '../../types/canteen.types';

interface ItemWithSchedules extends MenuItem {
  schedules: MenuSchedule[];
}

export default function MenuSchedulesPage() {
  const [itemsWithSchedules, setItemsWithSchedules] = useState<ItemWithSchedules[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const items = await getMenuItems();
      
      const itemsWithSchedulesData = await Promise.all(
        items.map(async (item) => {
          try {
            const schedules = await getItemSchedules(item.id);
            return { ...item, schedules };
          } catch {
            return { ...item, schedules: [] };
          }
        })
      );
      
      setItemsWithSchedules(itemsWithSchedulesData);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    try {
      await deleteMenuSchedule(scheduleId);
      setItemsWithSchedules(itemsWithSchedules.map(item => ({
        ...item,
        schedules: item.schedules.filter(s => s.id !== scheduleId)
      })));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to delete schedule');
    }
  };

  const allSchedules = itemsWithSchedules.flatMap(item => 
    item.schedules.map(schedule => ({
      ...schedule,
      itemName: item.name,
      itemId: item.id
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Schedules</h1>
          <p className="text-slate-600 mt-1">Manage menu item availability schedules</p>
        </div>
        <Link to="/canteen/menu/schedules/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Item</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Day</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Start Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">End Time</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No schedules found
                    </td>
                  </tr>
                ) : (
                  allSchedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900">{schedule.itemName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{schedule.dayOfWeek}</td>
                      <td className="py-3 px-4 text-slate-600">{schedule.startTime}</td>
                      <td className="py-3 px-4 text-slate-600">{schedule.endTime}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/canteen/menu/schedules/${schedule.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
