import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, User, Phone, IdCard, FileText, Bus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AddDocumentModal from '../../components/drivers/AddDocumentModal';
import AssignVehicleModal from '../../components/drivers/AssignVehicleModal';
import {
  getDriver,
  getDriverDocuments,
  createDriverDocument,
  getDriverVehicles,
  assignVehicleToDriver,
} from '../../api/drivers.api';
import { getVehicles } from '../../api/vehicles.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type {
  TransportDriver,
  TransportDriverDocument,
  TransportDriverDocumentFormData,
  TransportDriverVehicleHistory,
  TransportAssignVehicleToDriverFormData,
} from '../../types/driver.types';
import type { TransportVehicle } from '../../types/vehicle.types';

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = useState<TransportDriver | null>(null);
  const [documents, setDocuments] = useState<TransportDriverDocument[]>([]);
  const [vehicleHistory, setVehicleHistory] = useState<TransportDriverVehicleHistory[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [driverData, docData, historyData, vehicleData] = await Promise.all([
        getDriver(id),
        getDriverDocuments(id),
        getDriverVehicles(id),
        getVehicles(),
      ]);
      setDriver(driverData);
      setDocuments(docData);
      setVehicleHistory(historyData);
      setVehicles(vehicleData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load driver'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDocSubmit(data: TransportDriverDocumentFormData) {
    if (!id) return;
    setIsSubmittingDoc(true);
    try {
      await createDriverDocument(id, data);
      const docData = await getDriverDocuments(id);
      setDocuments(docData);
      setIsDocModalOpen(false);
    } finally {
      setIsSubmittingDoc(false);
    }
  }

  async function handleAssignSubmit(data: TransportAssignVehicleToDriverFormData) {
    if (!id) return;
    setIsSubmittingAssign(true);
    try {
      await assignVehicleToDriver(id, data.vehicle_id, { assigned_from: data.assigned_from });
      const historyData = await getDriverVehicles(id);
      setVehicleHistory(historyData);
      setIsAssignModalOpen(false);
    } finally {
      setIsSubmittingAssign(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!driver) {
    return <div className="text-center py-8 text-slate-500">Driver not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/transport/drivers" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Drivers
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <User className="h-6 w-6 text-slate-400" />
            {driver.name}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              )}
            >
              {driver.status}
            </span>
          </h1>
          <p className="text-slate-600 mt-1 flex items-center gap-3 flex-wrap">
            {driver.phone && (
              <span className="inline-flex items-center gap-1 text-sm">
                <Phone className="h-3.5 w-3.5" /> {driver.phone}
              </span>
            )}
            {driver.license_number && (
              <span className="inline-flex items-center gap-1 text-sm font-mono">
                <IdCard className="h-3.5 w-3.5" /> {driver.license_number}
                {driver.license_expiry && ` (exp. ${new Date(driver.license_expiry).toLocaleDateString()})`}
              </span>
            )}
          </p>
        </div>
        <Link to={`/transport/drivers/${driver.driver_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Driver
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Documents
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsDocModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">URL</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No documents uploaded for this driver yet.
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.document_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900 capitalize">
                        {doc.doc_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2 px-4 text-sm">
                        <a
                          href={doc.doc_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#008BE9] hover:underline truncate inline-block max-w-xs"
                        >
                          {doc.doc_url}
                        </a>
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              Vehicle Assignment History
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Vehicle
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Vehicle</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Assigned From</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {vehicleHistory.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No vehicles assigned to this driver yet.
                    </td>
                  </tr>
                ) : (
                  vehicleHistory.map((history) => (
                    <tr key={history.history_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <Bus className="h-3.5 w-3.5 text-slate-400" />
                          {history.vehicle?.registration_number ?? `#${history.vehicle_id}`}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {new Date(history.assigned_from).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600">
                        {history.assigned_to ? new Date(history.assigned_to).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <AddDocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmit={handleDocSubmit}
        isLoading={isSubmittingDoc}
      />

      <AssignVehicleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        vehicles={vehicles}
        onSubmit={handleAssignSubmit}
        isLoading={isSubmittingAssign}
      />
    </div>
  );
}
