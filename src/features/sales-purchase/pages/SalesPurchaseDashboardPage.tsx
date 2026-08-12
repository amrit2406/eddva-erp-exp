import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Package,
  ArrowRight
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function SalesPurchaseDashboardPage() {
  const stats = [
    {
      title: 'Total Vendors',
      value: '24',
      icon: Users,
      color: 'blue',
      link: '/sales-purchase/vendors',
    },
    {
      title: 'Total Customers',
      value: '18',
      icon: ShoppingCart,
      color: 'green',
      link: '/sales-purchase/customers',
    },
    {
      title: 'Pending POs',
      value: '5',
      icon: FileText,
      color: 'yellow',
      link: '/sales-purchase/purchase-orders',
    },
    {
      title: 'Pending SOs',
      value: '3',
      icon: Package,
      color: 'purple',
      link: '/sales-purchase/sales-orders',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'purchase_order',
      message: 'PO-2024-002 approved for XYZ Materials Corp',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'sales_invoice',
      message: 'Invoice SINV-2024-001 generated for Tech Solutions',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'vendor',
      message: 'New vendor Global Supplies Inc added',
      time: '1 day ago',
    },
    {
      id: 4,
      type: 'grn',
      message: 'GRN-2024-001 verified for PO-2024-001',
      time: '1 day ago',
    },
  ];

  const financialSummary = [
    {
      title: 'Total Purchase (MTD)',
      amount: '₹2,45,000',
      icon: TrendingUp,
      color: 'red',
    },
    {
      title: 'Total Sales (MTD)',
      amount: '₹4,85,000',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Outstanding Payables',
      amount: '₹75,500',
      icon: FileText,
      color: 'yellow',
    },
    {
      title: 'Outstanding Receivables',
      amount: '₹1,25,000',
      icon: DollarSign,
      color: 'blue',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sales & Purchase Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of sales and purchase operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-full ${getColorClasses(stat.color)} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialSummary.map((item) => (
          <Card key={item.title} className="border-slate-200">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{item.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{item.amount}</p>
                </div>
                <div className={`h-10 w-10 rounded-full ${getColorClasses(item.color)} flex items-center justify-center`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-slate-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/sales-purchase/vendors/new">
                <Button variant="secondary" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Vendor
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/sales-purchase/customers/new">
                <Button variant="secondary" className="w-full justify-start">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add New Customer
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/sales-purchase/purchase-orders/new">
                <Button variant="secondary" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Purchase Order
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/sales-purchase/sales-orders/new">
                <Button variant="secondary" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Create Sales Order
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="border-slate-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-400 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
