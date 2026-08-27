import axiosInstance from '../../../lib/axios';
import type {
  Permission,
  PermissionFormData,
  PermissionsCatalog,
  Role,
  RoleFormData,
  RolePermission,
  UserAssignment,
  UserAssignmentFormData,
  ResetPasswordFormData,
  ResetPasswordResponse,
  Sport,
  SportFormData,
  Venue,
  VenueFormData,
  SportsStaff,
  SportsStaffFormData,
  SportsParticipant,
  SportsParticipantFormData,
  House,
  HouseFormData,
  HouseMembership,
  AddHouseMemberFormData,
  HousePoint,
  AwardHousePointsFormData,
  HouseStanding,
  Tournament,
  TournamentFormData,
  TournamentTeam,
  TeamFormData,
  Fixture,
  FixtureFormData,
  FixtureResult,
  RecordResultFormData,
  PlayerMatchStat,
  RecordPlayerStatFormData,
} from '../types/sports.types';
import { sanitizeRolePermissions } from '../utils/rbac.utils';

// Permissions Catalog Endpoints (used by the role permission picker)
export async function getPermissionsCatalog(): Promise<PermissionsCatalog> {
  const response = await axiosInstance.get('/sports/roles/permissions/catalog');
  return response.data.data;
}

export async function getMyPermissions(): Promise<RolePermission[]> {
  const response = await axiosInstance.get('/sports/roles/permissions/me');
  return response.data.data;
}

// Dynamic Permissions Registry Endpoints
export async function getPermissions(): Promise<Permission[]> {
  const response = await axiosInstance.get('/sports/permissions');
  // This endpoint returns the same catalog shape as the roles/permissions/catalog endpoint
  if (response.data.data?.all_permissions) {
    return response.data.data.all_permissions;
  }
  if (response.data.all_permissions) {
    return response.data.all_permissions;
  }
  // Fallback for a plain array response
  return response.data.data || response.data || [];
}

export async function createPermission(data: PermissionFormData): Promise<Permission> {
  const response = await axiosInstance.post('/sports/permissions', data);
  return response.data.data || response.data;
}

export async function getPermission(id: string | number): Promise<Permission> {
  const response = await axiosInstance.get(`/sports/permissions/${id}`);
  return response.data.data || response.data;
}

export async function updatePermission(id: string | number, data: Partial<PermissionFormData>): Promise<Permission> {
  const response = await axiosInstance.patch(`/sports/permissions/${id}`, data);
  return response.data.data || response.data;
}

export async function deletePermission(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/permissions/${id}`);
}

// Role Management Endpoints
export async function getRoles(): Promise<Role[]> {
  const response = await axiosInstance.get('/sports/roles');
  return response.data.data;
}

export async function getRole(id: string | number): Promise<Role> {
  const response = await axiosInstance.get(`/sports/roles/${id}`);
  return response.data.data;
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const response = await axiosInstance.post('/sports/roles', {
    ...data,
    permissions: sanitizeRolePermissions(data.permissions),
  });
  return response.data.data;
}

export async function updateRole(id: string | number, data: Partial<RoleFormData>): Promise<Role> {
  const payload = { ...data };
  if (data.permissions) {
    payload.permissions = sanitizeRolePermissions(data.permissions);
  }
  const response = await axiosInstance.patch(`/sports/roles/${id}`, payload);
  return response.data.data;
}

export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/roles/${id}`);
}

// Sports Catalog Endpoints
export async function getSports(): Promise<Sport[]> {
  const response = await axiosInstance.get('/sports/catalog');
  return response.data.data || response.data || [];
}

export async function getSport(id: string | number): Promise<Sport> {
  const response = await axiosInstance.get(`/sports/catalog/${id}`);
  return response.data.data || response.data;
}

export async function createSport(data: SportFormData): Promise<Sport> {
  const response = await axiosInstance.post('/sports/catalog', data);
  return response.data.data || response.data;
}

export async function updateSport(id: string | number, data: Partial<SportFormData>): Promise<Sport> {
  const response = await axiosInstance.patch(`/sports/catalog/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteSport(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/catalog/${id}`);
}

// Venue Endpoints
export async function getVenues(): Promise<Venue[]> {
  const response = await axiosInstance.get('/sports/venues');
  return response.data.data || response.data || [];
}

export async function getVenue(id: string | number): Promise<Venue> {
  const response = await axiosInstance.get(`/sports/venues/${id}`);
  return response.data.data || response.data;
}

export async function createVenue(data: VenueFormData): Promise<Venue> {
  const response = await axiosInstance.post('/sports/venues', data);
  return response.data.data || response.data;
}

export async function updateVenue(id: string | number, data: Partial<VenueFormData>): Promise<Venue> {
  const response = await axiosInstance.patch(`/sports/venues/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteVenue(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/venues/${id}`);
}

// Staff Endpoints
export async function getStaffList(): Promise<SportsStaff[]> {
  const response = await axiosInstance.get('/sports/staff');
  return response.data.data || response.data || [];
}

export async function getStaffMember(id: string | number): Promise<SportsStaff> {
  const response = await axiosInstance.get(`/sports/staff/${id}`);
  return response.data.data || response.data;
}

export async function createStaffMember(data: SportsStaffFormData): Promise<SportsStaff> {
  const response = await axiosInstance.post('/sports/staff', data);
  return response.data.data || response.data;
}

export async function updateStaffMember(id: string | number, data: Partial<SportsStaffFormData>): Promise<SportsStaff> {
  const response = await axiosInstance.patch(`/sports/staff/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteStaffMember(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/staff/${id}`);
}

// Participant Endpoints
export async function getParticipants(): Promise<SportsParticipant[]> {
  const response = await axiosInstance.get('/sports/participants');
  return response.data.data || response.data || [];
}

export async function getParticipant(id: string | number): Promise<SportsParticipant> {
  const response = await axiosInstance.get(`/sports/participants/${id}`);
  return response.data.data || response.data;
}

export async function createParticipant(data: SportsParticipantFormData): Promise<SportsParticipant> {
  const response = await axiosInstance.post('/sports/participants', data);
  return response.data.data || response.data;
}

export async function updateParticipant(id: string | number, data: Partial<SportsParticipantFormData>): Promise<SportsParticipant> {
  const response = await axiosInstance.patch(`/sports/participants/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteParticipant(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/participants/${id}`);
}

// House Management Endpoints
export async function getHouses(): Promise<House[]> {
  const response = await axiosInstance.get('/sports/houses');
  return response.data.data || response.data || [];
}

export async function getHouseStandings(academicYear?: string): Promise<HouseStanding[]> {
  const response = await axiosInstance.get('/sports/houses/standings', {
    params: academicYear ? { academic_year: academicYear } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function getHouse(id: string | number): Promise<House> {
  const response = await axiosInstance.get(`/sports/houses/${id}`);
  return response.data.data || response.data;
}

export async function createHouse(data: HouseFormData): Promise<House> {
  const response = await axiosInstance.post('/sports/houses', data);
  return response.data.data || response.data;
}

export async function updateHouse(id: string | number, data: Partial<HouseFormData>): Promise<House> {
  const response = await axiosInstance.patch(`/sports/houses/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteHouse(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/houses/${id}`);
}

export async function getHouseMembers(houseId: string | number, academicYear?: string): Promise<HouseMembership[]> {
  const response = await axiosInstance.get(`/sports/houses/${houseId}/members`, {
    params: academicYear ? { academic_year: academicYear } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function addHouseMember(houseId: string | number, data: AddHouseMemberFormData): Promise<HouseMembership> {
  const response = await axiosInstance.post(`/sports/houses/${houseId}/members`, data);
  return response.data.data || response.data;
}

export async function getHousePointsHistory(houseId: string | number): Promise<HousePoint[]> {
  const response = await axiosInstance.get(`/sports/houses/${houseId}/points`);
  return response.data.data || response.data || [];
}

export async function awardHousePoints(houseId: string | number, data: AwardHousePointsFormData): Promise<HousePoint> {
  const response = await axiosInstance.post(`/sports/houses/${houseId}/points`, data);
  return response.data.data || response.data;
}

// Tournament Management Endpoints
export async function getTournaments(): Promise<Tournament[]> {
  const response = await axiosInstance.get('/sports/tournaments');
  return response.data.data || response.data || [];
}

export async function getTournament(id: string | number): Promise<Tournament> {
  const response = await axiosInstance.get(`/sports/tournaments/${id}`);
  return response.data.data || response.data;
}

export async function createTournament(data: TournamentFormData): Promise<Tournament> {
  const response = await axiosInstance.post('/sports/tournaments', data);
  return response.data.data || response.data;
}

export async function updateTournament(id: string | number, data: Partial<TournamentFormData>): Promise<Tournament> {
  const response = await axiosInstance.patch(`/sports/tournaments/${id}`, data);
  return response.data.data || response.data;
}

// Teams Endpoints
export async function getTeams(tournamentId: string | number): Promise<TournamentTeam[]> {
  const response = await axiosInstance.get(`/sports/tournaments/${tournamentId}/teams`);
  return response.data.data || response.data || [];
}

export async function createTeam(tournamentId: string | number, data: TeamFormData): Promise<TournamentTeam> {
  const response = await axiosInstance.post(`/sports/tournaments/${tournamentId}/teams`, data);
  return response.data.data || response.data;
}

// Fixtures & Results Endpoints
export async function getFixtures(tournamentId: string | number): Promise<Fixture[]> {
  const response = await axiosInstance.get(`/sports/tournaments/${tournamentId}/fixtures`);
  return response.data.data || response.data || [];
}

export async function createFixture(tournamentId: string | number, data: FixtureFormData): Promise<Fixture> {
  const response = await axiosInstance.post(`/sports/tournaments/${tournamentId}/fixtures`, data);
  return response.data.data || response.data;
}

export async function recordFixtureResult(fixtureId: string | number, data: RecordResultFormData): Promise<FixtureResult> {
  const response = await axiosInstance.post(`/sports/fixtures/${fixtureId}/result`, data);
  return response.data.data || response.data;
}

export async function recordPlayerStat(fixtureId: string | number, data: RecordPlayerStatFormData): Promise<PlayerMatchStat> {
  const response = await axiosInstance.post(`/sports/fixtures/${fixtureId}/stats`, data);
  return response.data.data || response.data;
}

// User Assignment Endpoints
export async function getUserAssignments(): Promise<UserAssignment[]> {
  const response = await axiosInstance.get('/sports/roles/user-assignments');
  return response.data.data;
}

export async function createUserAssignment(data: UserAssignmentFormData): Promise<UserAssignment> {
  const response = await axiosInstance.post('/sports/roles/user-assignments', data);
  return response.data.data;
}

export async function revokeUserAssignment(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/roles/user-assignments/${id}`);
}

export async function resetUserAssignmentPassword(
  id: string | number,
  data: ResetPasswordFormData
): Promise<ResetPasswordResponse> {
  const response = await axiosInstance.patch(`/sports/roles/user-assignments/${id}/password`, data);
  return response.data.data;
}
