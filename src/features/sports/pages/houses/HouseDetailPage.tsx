import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Users, Trophy, Star } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { useToast } from '../../../../hooks/useToast';
import {
  getHouse,
  getHouseMembers,
  addHouseMember,
  getHousePointsHistory,
  awardHousePoints,
} from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import AddHouseMemberModal from '../../components/houses/AddHouseMemberModal';
import AwardPointsModal from '../../components/houses/AwardPointsModal';
import type {
  House,
  HouseMembership,
  HousePoint,
  AddHouseMemberFormData,
  AwardHousePointsFormData,
} from '../../types/sports.types';

export default function HouseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [house, setHouse] = useState<House | null>(null);
  const [members, setMembers] = useState<HouseMembership[]>([]);
  const [points, setPoints] = useState<HousePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      const [houseData, membersData, pointsData] = await Promise.all([
        getHouse(id),
        getHouseMembers(id),
        getHousePointsHistory(id),
      ]);
      setHouse(houseData);
      setMembers(membersData);
      setPoints(pointsData);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error(getApiErrorMessage(err, 'Failed to load house'));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(data: AddHouseMemberFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await addHouseMember(id, data);
      const membersData = await getHouseMembers(id);
      setMembers(membersData);
      setIsMemberModalOpen(false);
      toast.success('Member added to house.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAwardPoints(data: AwardHousePointsFormData) {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const record = await awardHousePoints(id, data);
      const pointsData = await getHousePointsHistory(id);
      setPoints(pointsData);
      setIsPointsModalOpen(false);
      toast.success(`${record.points >= 0 ? 'Awarded' : 'Deducted'} ${Math.abs(record.points)} points.`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalPoints = points.reduce((sum, p) => sum + p.points, 0);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (!house) {
    return <div className="text-center py-8 text-slate-500">House not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/sports/houses" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Houses
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-8 w-8 rounded-full border border-slate-200 flex-shrink-0"
            style={{ backgroundColor: house.color_code || '#e2e8f0' }}
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{house.name}</h1>
            {house.motto && <p className="text-slate-600 mt-1">"{house.motto}"</p>}
          </div>
        </div>
        <Link to={`/sports/houses/${house.house_id}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit House
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">House Master</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{house.house_master?.name ?? 'Unassigned'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Members
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{members.length}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Star className="h-3.5 w-3.5" /> Total Points
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-1">{totalPoints}</p>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Members
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsMemberModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Participant</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Class/Section</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Academic Year</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No members yet.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.membership_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900">{m.participant?.name ?? `#${m.participant_id}`}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{m.participant?.class_section ?? '—'}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{m.academic_year}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Points Ledger
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setIsPointsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Award Points
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Points</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Source</th>
                  <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Reason</th>
                </tr>
              </thead>
              <tbody>
                {points.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No points recorded yet.
                    </td>
                  </tr>
                ) : (
                  points.map((p) => (
                    <tr key={p.point_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-600">{new Date(p.awarded_date).toLocaleDateString()}</td>
                      <td className={`py-2 px-4 text-sm font-medium ${p.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {p.points >= 0 ? `+${p.points}` : p.points}
                      </td>
                      <td className="py-2 px-4 text-sm text-slate-600 capitalize">{p.source_type.replace(/_/g, ' ')}</td>
                      <td className="py-2 px-4 text-sm text-slate-600">{p.reason || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <AddHouseMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSubmit={handleAddMember}
        isLoading={isSubmitting}
      />
      <AwardPointsModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        onSubmit={handleAwardPoints}
        isLoading={isSubmitting}
      />
    </div>
  );
}
