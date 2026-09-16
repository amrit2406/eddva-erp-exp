import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, MapPin, Phone, Mail, IndianRupee, Calendar, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import {
  getCustomer,
  addCustomerContact,
  updateCustomerContact,
  deleteCustomerContact,
} from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { Customer, CustomerContact, CustomerContactFormData } from '../../types/sales-purchase.types';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null);
  const [contactForm, setContactForm] = useState<CustomerContactFormData>({
    name: '',
    designation: '',
    phone: '',
    email: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

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
      setError(getApiErrorMessage(err, 'Failed to load customer'));
    } finally {
      setLoading(false);
    }
  }

  const openAddContactModal = () => {
    setEditingContact(null);
    setContactForm({ name: '', designation: '', phone: '', email: '' });
    setContactError(null);
    setContactModalOpen(true);
  };

  const openEditContactModal = (contact: CustomerContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      designation: contact.designation,
      phone: contact.phone,
      email: contact.email,
    });
    setContactError(null);
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    setContactModalOpen(false);
    setEditingContact(null);
    setContactError(null);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setContactSubmitting(true);
      setContactError(null);
      if (editingContact) {
        await updateCustomerContact(id, editingContact.contact_id, contactForm);
      } else {
        await addCustomerContact(id, contactForm);
      }
      await loadCustomer(id);
      closeContactModal();
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setContactError(getApiErrorMessage(err, 'Failed to save contact'));
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }
    try {
      await deleteCustomerContact(id, contactId);
      await loadCustomer(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete contact'));
    }
  };

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
                    <p className="text-lg font-medium text-slate-900">{customer.customer_name}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">GSTIN</label>
                  <p className="mt-1 text-slate-900">{customer.gstin || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Tax ID</label>
                  <p className="mt-1 text-slate-900">{customer.tax_id || '-'}</p>
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
                    <p className="text-slate-900">{customer.address_line1 || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Address Line 2</label>
                  <p className="mt-1 text-slate-900">{customer.address_line2 || '-'}</p>
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
                  <p className="mt-1 text-slate-900">{customer.payment_term?.term_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Credit Limit</label>
                  <div className="mt-1 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <p className="text-slate-900">{customer.credit_limit ? Number(customer.credit_limit).toFixed(2) : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Contacts</h3>
                <Button variant="secondary" size="sm" onClick={openAddContactModal}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Contact
                </Button>
              </div>
              {customer.contacts && customer.contacts.length > 0 ? (
                <div className="space-y-3">
                  {customer.contacts.map((contact) => (
                    <div
                      key={contact.contact_id}
                      className="border-b border-slate-100 pb-3 last:border-0 flex items-start justify-between gap-2"
                    >
                      <div>
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
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                          title="Edit"
                          onClick={() => openEditContactModal(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                          title="Delete"
                          onClick={() => handleDeleteContact(contact.contact_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                  <p className="mt-1 text-slate-900">{customer.customer_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{customer.created_at ? new Date(customer.created_at).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      <Modal
        isOpen={contactModalOpen}
        onClose={closeContactModal}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="sm"
      >
        <form onSubmit={handleContactSubmit} className="space-y-4">
          {contactError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {contactError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Priya Sharma"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactForm.designation}
              onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Procurement Head"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="9876500000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="priya@northwind.example"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeContactModal} disabled={contactSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={contactSubmitting}>
              {contactSubmitting ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
