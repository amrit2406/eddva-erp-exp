import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import LocationTable from '../../components/locations/LocationTable';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import { LOCATION_TYPE_OPTIONS } from '../../constants/location.constants';
import type { InventoryLocation, InventoryLocationType } from '../../types/location.types';

export default function LocationsPage() {
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<InventoryLocationType | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(loadLocations, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type]);

  async function loadLocations() {
    try {
      setLoading(true);
      const data = await getLocations({ search: search || undefined, type: type || undefined });
      setLocations(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load locations'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Locations</h1>
          <p className="text-slate-600 mt-1">Manage inventory stores, departments, classrooms, and labs</p>
        </div>
        <Link to="/inventory/locations/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search locations by name..."
            className="flex-1"
          />
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as InventoryLocationType | '')}
            placeholder="All Types"
            options={LOCATION_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            className="w-full sm:w-48"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <LocationTable locations={locations} />
        )}
      </Card>
    </div>
  );
}
