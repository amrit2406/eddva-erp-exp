import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, MapPin, Phone, Mail, IndianRupee, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getCustomer } from '../../api/sales-purchase.api';
import type { Customer } from '../../types/sales-purchase.types';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCustomer(id);
    }
  }, [id]);

  async function loadCustomer(customerId: string) {
    try {
      setLoading(true);
      const data = await getCustomer(customerId);
      setCustomer(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/customers">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Customer Details</h1>
          <p className="text-slate-600 mt-1">View customer information</p>
        </div>
        <Link to={`/sales-purchase/customers/${id}/edit`}>
          <Button variant="primary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
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
      ) : customer ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Customer Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{customer.customerName}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">GSTIN</label>
                  <p className="mt-1 text-slate-900">{customer.gstin || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1 text-slate-900">{customer.status}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Address Line 1</label>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{customer.addressLine1 || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Address Line 2</label>
                  <p className="mt-1 text-slate-900">{customer.addressLine2 || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">City</label>
                  <p className="mt-1 text-slate-900">{customer.city || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">State</label>
                  <p className="mt-1 text-slate-900">{customer.state || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Pincode</label>
                  <p className="mt-1 text-slate-900">{customer.pincode || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Payment Term</label>
                  <p className="mt-1 text-slate-900">{customer.paymentTerm?.termName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Credit Limit</label>
                  <div className="mt-1 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <p className="text-slate-900">{customer.creditLimit ? `${customer.creditLimit?.toFixed(2)}` : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Contacts</h3>
              {customer.contacts && customer.contacts.length > 0 ? (
                <div className="space-y-3">
                  {customer.contacts.map((contact, index) => (
                    <div key={index} className="border-b border-slate-100 pb-3 last:border-0">
                      <p className="font-medium text-slate-900">{contact.name}</p>
                      <p className="text-sm text-slate-600">{contact.designation}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No contacts added</p>
              )}
            </div>
          </Card>

          <Card className="border-slate-200 lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Customer ID</label>
                  <p className="mt-1 text-slate-900">{customer.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{customer.createdAt ? new Date(customer.createdAt).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
