import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, MapPin, Phone, Mail, IndianRupee, Calendar, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import {
  getVendor,
  addVendorContact,
  updateVendorContact,
  deleteVendorContact,
  addVendorBankDetail,
  updateVendorBankDetail,
  deleteVendorBankDetail,
} from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type {
  Vendor,
  VendorContact,
  VendorContactFormData,
  VendorBankDetail,
  VendorBankDetailFormData,
} from '../../types/sales-purchase.types';

export default function VendorDetailsPage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null);
  const [contactForm, setContactForm] = useState<VendorContactFormData>({
    name: '',
    designation: '',
    phone: '',
    email: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<VendorBankDetail | null>(null);
  const [bankForm, setBankForm] = useState<VendorBankDetailFormData>({
    account_no: '',
    ifsc: '',
    swift: '',
    bank_name: '',
    is_primary: false,
  });
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVendor(id);
    }
  }, [id]);

  async function loadVendor(vendorId: string) {
    try {
      setLoading(true);
      const data = await getVendor(vendorId);
      setVendor(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load vendor'));
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

  const openEditContactModal = (contact: VendorContact) => {
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
        await updateVendorContact(id, editingContact.contact_id, contactForm);
      } else {
        await addVendorContact(id, contactForm);
      }
      await loadVendor(id);
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
      await deleteVendorContact(id, contactId);
      await loadVendor(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete contact'));
    }
  };

  const openAddBankModal = () => {
    setEditingBank(null);
    setBankForm({ account_no: '', ifsc: '', swift: '', bank_name: '', is_primary: false });
    setBankError(null);
    setBankModalOpen(true);
  };

  const openEditBankModal = (bank: VendorBankDetail) => {
    setEditingBank(bank);
    setBankForm({
      account_no: bank.account_no,
      ifsc: bank.ifsc,
      swift: bank.swift,
      bank_name: bank.bank_name,
      is_primary: bank.is_primary,
    });
    setBankError(null);
    setBankModalOpen(true);
  };

  const closeBankModal = () => {
    setBankModalOpen(false);
    setEditingBank(null);
    setBankError(null);
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setBankSubmitting(true);
      setBankError(null);
      if (editingBank) {
        await updateVendorBankDetail(id, editingBank.bank_id, bankForm);
      } else {
        await addVendorBankDetail(id, bankForm);
      }
      await loadVendor(id);
      closeBankModal();
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setBankError(getApiErrorMessage(err, 'Failed to save bank detail'));
    } finally {
      setBankSubmitting(false);
    }
  };

  const handleDeleteBank = async (bankId: number) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this bank detail?')) {
      return;
    }
    try {
      await deleteVendorBankDetail(id, bankId);
      await loadVendor(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(err, 'Failed to delete bank detail'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/vendors">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Vendor Details</h1>
          <p className="text-slate-600 mt-1">View vendor information</p>
        </div>
        <Link to={`/sales-purchase/vendors/${id}/edit`}>
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
      ) : vendor ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Vendor Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Vendor Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{vendor.vendor_name}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">GSTIN</label>
                  <p className="mt-1 text-slate-900">{vendor.gstin || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Tax ID</label>
                  <p className="mt-1 text-slate-900">{vendor.tax_id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1 text-slate-900">{vendor.status}</p>
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
                    <p className="text-slate-900">{vendor.address_line1 || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Address Line 2</label>
                  <p className="mt-1 text-slate-900">{vendor.address_line2 || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">City</label>
                  <p className="mt-1 text-slate-900">{vendor.city || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">State</label>
                  <p className="mt-1 text-slate-900">{vendor.state || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Pincode</label>
                  <p className="mt-1 text-slate-900">{vendor.pincode || '-'}</p>
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
                  <p className="mt-1 text-slate-900">{vendor.payment_term?.term_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Credit Limit</label>
                  <div className="mt-1 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <p className="text-slate-900">{vendor.credit_limit ? Number(vendor.credit_limit).toFixed(2) : '-'}</p>
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
              {vendor.contacts && vendor.contacts.length > 0 ? (
                <div className="space-y-3">
                  {vendor.contacts.map((contact) => (
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Bank Details</h3>
                <Button variant="secondary" size="sm" onClick={openAddBankModal}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Bank Detail
                </Button>
              </div>
              {vendor.bank_details && vendor.bank_details.length > 0 ? (
                <div className="space-y-3">
                  {vendor.bank_details.map((bank) => (
                    <div
                      key={bank.bank_id}
                      className="border-b border-slate-100 pb-3 last:border-0 flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{bank.bank_name}</p>
                        <p className="text-sm text-slate-600">Account: {bank.account_no}</p>
                        <p className="text-sm text-slate-600">IFSC: {bank.ifsc}</p>
                        <p className="text-sm text-slate-600">SWIFT: {bank.swift}</p>
                        {bank.is_primary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                          title="Edit"
                          onClick={() => openEditBankModal(bank)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                          title="Delete"
                          onClick={() => handleDeleteBank(bank.bank_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No bank details added</p>
              )}
            </div>
          </Card>

          <Card className="border-slate-200 lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Vendor ID</label>
                  <p className="mt-1 text-slate-900">{vendor.vendor_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{vendor.created_at ? new Date(vendor.created_at).toLocaleString() : '-'}</p>
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
              placeholder="Suresh Mehta"
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
              placeholder="Sales Manager"
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
              placeholder="9876543210"
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
              placeholder="suresh@brightelectronics.example"
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

      <Modal
        isOpen={bankModalOpen}
        onClose={closeBankModal}
        title={editingBank ? 'Edit Bank Detail' : 'Add Bank Detail'}
        size="sm"
      >
        <form onSubmit={handleBankSubmit} className="space-y-4">
          {bankError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {bankError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankForm.bank_name}
              onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="HDFC Bank"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankForm.account_no}
              onChange={(e) => setBankForm({ ...bankForm, account_no: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123456789012"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              IFSC <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bankForm.ifsc}
              onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase"
              placeholder="HDFC0001234"
              maxLength={11}
              pattern="[A-Z]{4}0[A-Z0-9]{6}"
              title="4 letters (bank code) + 0 + 6 alphanumeric characters, e.g. HDFC0001234"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Format: 4 letters, then 0, then 6 letters/numbers (11 characters total)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SWIFT</label>
            <input
              type="text"
              value={bankForm.swift}
              onChange={(e) => setBankForm({ ...bankForm, swift: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase"
              placeholder="HDFCINBB"
              maxLength={11}
              pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
              title="8 or 11 characters: 6 letters + 2 alphanumeric, optionally + 3 more alphanumeric, e.g. HDFCINBB"
            />
            <p className="text-xs text-slate-500 mt-1">Format: 8 or 11 characters (bank + country + location [+ branch])</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={bankForm.is_primary}
              onChange={(e) => setBankForm({ ...bankForm, is_primary: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Set as primary account
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeBankModal} disabled={bankSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={bankSubmitting}>
              {bankSubmitting ? 'Saving...' : editingBank ? 'Update Bank Detail' : 'Add Bank Detail'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
