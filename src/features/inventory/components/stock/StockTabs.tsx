import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, ArrowLeftRight, SlidersHorizontal, Layers, ScrollText } from 'lucide-react';
import { cn } from '../../../../utils/cn';

const TABS = [
  { path: '/inventory/stock/purchases', label: 'Purchases', icon: ShoppingCart },
  { path: '/inventory/stock/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { path: '/inventory/stock/adjustments', label: 'Adjustments', icon: SlidersHorizontal },
  { path: '/inventory/stock/balances', label: 'Balances', icon: Layers },
  { path: '/inventory/stock/ledger', label: 'Ledger', icon: ScrollText },
];

export default function StockTabs() {
  const location = useLocation();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
