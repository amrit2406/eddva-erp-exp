import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import CustomerForm from '../../components/customers/CustomerForm';
import { mockCustomers } from '../../mock/customers.mock';

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const customer = mockCustomers.find((c) => c.customerId === id);

  const handleSubmit = (data: any) => {
    console.log('Updating customer:', id, data);
    // Handle form submission
  };

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
      <div className="flex items-center gap-4">
        <Link to="/sales-purchase/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Customer</h1>
          <p className="text-slate-600 mt-1">Update customer information</p>
        </div>
      </div>

      <CustomerForm 
        defaultValues={{
          customerName: customer.customerName,
          gstin: customer.gstin,
          taxId: customer.taxId,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2,
          city: customer.city,
          state: customer.state,
          pincode: customer.pincode,
          paymentTermId: customer.paymentTermId,
          creditLimit: customer.creditLimit,
          status: customer.status,
        }}
        onSubmit={handleSubmit}
        submitText="Update Customer"
      />
    </div>
  );
}
