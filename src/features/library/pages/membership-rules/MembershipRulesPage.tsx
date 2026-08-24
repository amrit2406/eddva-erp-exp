import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import MembershipRuleTable from '../../components/membership-rules/MembershipRuleTable';
import { getMembershipRules } from '../../api/library.api';
import type { MembershipRule } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function MembershipRulesPage() {
  const [rules, setRules] = useState<MembershipRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      setLoading(true);
      const data = await getMembershipRules();
      setRules(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load membership rules');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Membership Rules</h1>
          <p className="text-slate-600 mt-1">Manage library membership rules and policies</p>
        </div>
        <Link to={ROUTES.LIBRARY_MEMBERSHIP_RULES_NEW}>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
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
      ) : (
        <Card className="border-slate-200">
          <MembershipRuleTable rules={rules} />
        </Card>
      )}
    </div>
  );
}