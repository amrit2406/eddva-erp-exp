import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Building } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { mockCustomers, mockCustomerContacts } from '../../mock/customers.mock';
import { CUSTOMER_STATUS_COLORS } from '../../constants/customer.constants';

export default function ViewCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const customer = mockCustomers.find((c) => c.customerId === id);
  const contacts = mockCustomerContacts.filter((c) => c.customerId === id);

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{customer.customerName}</h1>
            <p className="text-slate-600 mt-1">{customer.customerCode}</p>
          </div>
        </div>
        <Link to={`/sales-purchase/customers/${customer.customerId}/edit`}>
          <Button variant="primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        </Link>
      </div>

      {/* Basic Information */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Customer Code</label>
              <p className="font-medium text-slate-900">{customer.customerCode}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Status</label>
              <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', CUSTOMER_STATUS_COLORS[customer.status])}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </span>
            </div>
            <div>
              <label className="text-sm text-slate-600">GSTIN</label>
              <p className="font-medium text-slate-900">{customer.gstin || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Tax ID</label>
              <p className="font-medium text-slate-900">{customer.taxId || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Payment Terms</label>
              <p className="font-medium text-slate-900">{customer.paymentTermName || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Credit Limit</label>
              <p className="font-medium text-slate-900">{customer.creditLimit ? `₹${customer.creditLimit.toLocaleString()}` : '-'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Address Information</h3>
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">{customer.addressLine1 || '-'}</p>
              <p className="text-slate-600">{customer.addressLine2 || ''}</p>
              <p className="text-slate-600">{customer.city || ''}, {customer.state || ''} - {customer.pincode || ''}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="border-slate-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
          {contacts.length > 0 ? (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.contactId} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{contact.name}</p>
                      <p className="text-sm text-slate-600">{contact.designation || ''}</p>
                    </div>
                    {contact.isPrimary && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Primary</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No contacts available</p>
          )}
        </div>
      </Card>
    </div>
  );
}
