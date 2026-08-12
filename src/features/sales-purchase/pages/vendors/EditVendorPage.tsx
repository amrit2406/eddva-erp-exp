import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import VendorForm from '../../components/vendors/VendorForm';
import { mockVendors } from '../../mock/vendors.mock';

export default function EditVendorPage() {
  const { id } = useParams<{ id: string }>();
  const vendor = mockVendors.find((v) => v.vendorId === id);

  const handleSubmit = (data: any) => {
    console.log('Updating vendor:', id, data);
    // Handle form submission
  };

  if (!vendor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/sales-purchase/vendors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sales-purchase/vendors">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Vendor</h1>
          <p className="text-slate-600 mt-1">Update vendor information</p>
        </div>
      </div>

      <VendorForm 
        defaultValues={{
          vendorName: vendor.vendorName,
          gstin: vendor.gstin,
          taxId: vendor.taxId,
          addressLine1: vendor.addressLine1,
          addressLine2: vendor.addressLine2,
          city: vendor.city,
          state: vendor.state,
          pincode: vendor.pincode,
          paymentTermId: vendor.paymentTermId,
          creditLimit: vendor.creditLimit,
          status: vendor.status,
        }}
        onSubmit={handleSubmit}
        submitText="Update Vendor"
      />
    </div>
  );
}
