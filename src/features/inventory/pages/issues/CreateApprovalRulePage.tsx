import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import IssuesTabs from '../../components/issues/IssuesTabs';
import { createApprovalRule } from '../../api/issues.api';
import { getCategories } from '../../api/categories.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryApprovalRuleFormData } from '../../types/issue.types';
import type { InventoryCategory } from '../../types/category.types';

export default function CreateApprovalRulePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [valueThreshold, setValueThreshold] = useState<string>('');
  const [quantityThreshold, setQuantityThreshold] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueThreshold && !quantityThreshold) {
      setError('Please set at least one threshold.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const payload: InventoryApprovalRuleFormData = {
        category_id: categoryId || undefined,
        value_threshold: valueThreshold ? Number(valueThreshold) : undefined,
        quantity_threshold: quantityThreshold ? Number(quantityThreshold) : undefined,
        is_active: isActive,
      };
      await createApprovalRule(payload);
      navigate('/inventory/issues/approval-rules');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to create approval rule'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Approval Rule</h1>
        <p className="text-slate-600 mt-1">Issues meeting or exceeding a threshold are held for approval</p>
      </div>

      <IssuesTabs />

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <Select
                id="category_id"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                placeholder="All Categories (Global)"
                options={categories.map((c) => ({ value: String(c.category_id), label: c.name }))}
              />
              <p className="text-xs text-slate-500 mt-1">Leave blank for a global rule applying to all categories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="value_threshold" className="block text-sm font-medium text-slate-700 mb-1">
                  Value Threshold
                </label>
                <input
                  type="number"
                  id="value_threshold"
                  min={0}
                  step="0.01"
                  value={valueThreshold}
                  onChange={(e) => setValueThreshold(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Held for approval once quantity × last purchase price reaches this.</p>
              </div>

              <div>
                <label htmlFor="quantity_threshold" className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity Threshold
                </label>
                <input
                  type="number"
                  id="quantity_threshold"
                  min={1}
                  value={quantityThreshold}
                  onChange={(e) => setQuantityThreshold(e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Held for approval once the requested quantity reaches this.</p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#008BE9] focus:ring-[#008BE9]"
              />
              Active
            </label>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/issues/approval-rules')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Rule'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
