// RBAC Types
export interface Permission {
  permission_id: number;
  key: string;
  resource: string;
  action: string;
  name: string;
  category: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionFormData {
  resource: string;
  action: string;
  name: string;
  category: string;
  description: string;
  is_active?: boolean;
}

export interface PermissionResource {
  resource: string;
  name: string;
  available_actions: string[];
  permissions: Permission[];
}

export interface PermissionsCatalog {
  total: number;
  resources: PermissionResource[];
  all_permissions: Permission[];
}

export interface RolePermission {
  resource: string;
  actions: string[];
}

export interface Role {
  role_id: number;
  institute_id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  created_at: string;
  updated_at: string;
  _count?: {
    user_roles: number;
  };
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: RolePermission[];
}

export interface UserAssignment {
  id: number;
  eddva_user_id: string;
  user_name: string;
  user_email: string;
  username: string;
  role_id: number;
  role?: Pick<Role, 'role_id' | 'name'>;
  created_at?: string;
  updated_at?: string;
}

export interface UserAssignmentFormData {
  eddva_user_id: string;
  user_name: string;
  user_email: string;
  username: string;
  password: string;
  role_id: number;
}

export interface ResetPasswordFormData {
  new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Shared Core Catalog Types
export type SportCategory = 'team' | 'individual';

export interface Sport {
  sport_id: number;
  name: string;
  category: SportCategory;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SportFormData {
  name: string;
  category: SportCategory;
  description?: string;
}

export type VenueType = 'ground' | 'court' | 'pool' | 'hall';

export interface Venue {
  venue_id: number;
  name: string;
  type: VenueType;
  capacity?: number;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VenueFormData {
  name: string;
  type: VenueType;
  capacity?: number;
  location?: string;
}

export interface SportsStaff {
  staff_id: number;
  external_ref_id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SportsStaffFormData {
  external_ref_id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface SportsParticipant {
  participant_id: number;
  external_ref_id?: string;
  name: string;
  class_section?: string;
  photo_url?: string;
  roll_number?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SportsParticipantFormData {
  external_ref_id?: string;
  name: string;
  class_section?: string;
  photo_url?: string;
  roll_number?: string;
  gender?: string;
}

// House Management Types
export interface House {
  house_id: number;
  name: string;
  color_code?: string;
  house_master_id?: number;
  motto?: string;
  house_master?: SportsStaff;
  _count?: { memberships: number };
  standings?: HouseStanding[];
  created_at?: string;
  updated_at?: string;
}

export interface HouseFormData {
  name: string;
  color_code?: string;
  house_master_id?: number;
  motto?: string;
}

export type HouseMembershipStatus = 'active' | 'transferred';

export interface HouseMembership {
  membership_id: number;
  house_id: number;
  participant_id: number;
  academic_year: string;
  status: HouseMembershipStatus;
  created_at: string;
  participant?: SportsParticipant;
  house?: House;
}

export interface AddHouseMemberFormData {
  participant_id: number;
  academic_year: string;
  status?: HouseMembershipStatus;
}

export type HousePointSourceType = 'tournament_result' | 'discipline' | 'participation' | 'other';

export interface HousePoint {
  point_id: number;
  house_id: number;
  points: number;
  source_type: HousePointSourceType;
  source_reference_id?: number;
  reason?: string;
  awarded_date: string;
  awarded_by?: number;
  created_at: string;
  awarder_user?: { user_id: number; staff?: SportsStaff } | null;
}

export interface AwardHousePointsFormData {
  points: number;
  source_type: HousePointSourceType;
  source_reference_id?: number;
  reason?: string;
  awarded_date: string;
  academic_year: string;
}

export interface HouseStanding {
  house_id: number;
  academic_year: string;
  total_points: number;
  rank?: number;
  last_updated_at: string;
  house?: House;
}

// Tournament Management Types
export type TournamentLevel = 'inter_house' | 'inter_school' | 'inter_district';
export type TournamentFormat = 'knockout' | 'league' | 'round_robin';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type FixtureStatus = 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'walkover';

export interface Tournament {
  tournament_id: number;
  name: string;
  sport_id: number;
  level: TournamentLevel;
  format: TournamentFormat;
  start_date: string;
  end_date: string;
  venue_id?: number;
  status: TournamentStatus;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  sport?: Sport;
  venue?: Venue;
  _count?: { teams: number; fixtures: number };
  teams?: TournamentTeam[];
  fixtures?: Fixture[];
}

export interface TournamentFormData {
  name: string;
  sport_id: number;
  level?: TournamentLevel;
  format?: TournamentFormat;
  start_date: string;
  end_date: string;
  venue_id?: number;
  status?: TournamentStatus;
}

export interface TeamMemberInput {
  participant_id: number;
  role?: string;
}

export interface TournamentTeamMember {
  member_id: number;
  tournament_team_id: number;
  participant_id: number;
  role: string;
  created_at: string;
  participant?: SportsParticipant;
}

export interface TournamentTeam {
  tournament_team_id: number;
  tournament_id: number;
  house_id?: number;
  team_name: string;
  coach_id?: number;
  created_at: string;
  house?: House;
  coach?: SportsStaff;
  members?: TournamentTeamMember[];
}

export interface TeamFormData {
  team_name: string;
  house_id?: number;
  coach_id?: number;
  members?: TeamMemberInput[];
}

export interface Fixture {
  fixture_id: number;
  tournament_id: number;
  round: string;
  team_a_id: number;
  team_b_id: number;
  venue_id?: number;
  scheduled_date: string;
  status: FixtureStatus;
  created_at?: string;
  updated_at?: string;
  team_a?: TournamentTeam;
  team_b?: TournamentTeam;
  venue?: Venue;
  result?: FixtureResult | null;
}

export interface FixtureFormData {
  round: string;
  team_a_id: number;
  team_b_id: number;
  venue_id?: number;
  scheduled_date: string;
  status?: FixtureStatus;
}

export interface FixtureResult {
  result_id: number;
  fixture_id: number;
  team_a_score: string;
  team_b_score: string;
  winner_team_id?: number | null;
  result_notes?: string;
  recorded_by?: number;
  recorded_at: string;
  winner_team?: TournamentTeam;
}

export interface RecordResultFormData {
  team_a_score: string;
  team_b_score: string;
  winner_team_id?: number;
  result_notes?: string;
  house_points_award?: number;
  academic_year?: string;
}

export interface PlayerMatchStat {
  stat_id: number;
  fixture_id: number;
  participant_id: number;
  stat_type: string;
  stat_value: number;
  participant?: SportsParticipant;
}

export interface RecordPlayerStatFormData {
  participant_id: number;
  stat_type: string;
  stat_value: number;
}

// Records & Awards Types
export type SportsRecordType = 'personal_best' | 'tournament_win' | 'milestone' | 'school_record';

export interface SportsRecord {
  record_id: number;
  participant_id?: number | null;
  tournament_team_id?: number | null;
  sport_id: number;
  record_type: SportsRecordType;
  description: string;
  value: string;
  achieved_date: string;
  source_fixture_id?: number | null;
  verified_by?: number | null;
  created_at: string;
  participant?: SportsParticipant;
  sport?: Sport;
  tournament_team?: TournamentTeam;
  source_fixture?: Fixture;
}

export interface SportsRecordFormData {
  participant_id?: number;
  tournament_team_id?: number;
  sport_id: number;
  record_type: SportsRecordType;
  description: string;
  value: string;
  achieved_date: string;
  source_fixture_id?: number;
}

export interface SportsAward {
  award_id: number;
  participant_id?: number | null;
  tournament_team_id?: number | null;
  tournament_id: number;
  award_type: string;
  issued_date: string;
  created_at: string;
  participant?: SportsParticipant;
  tournament_team?: TournamentTeam;
  tournament?: Tournament;
}

export interface IssueAwardFormData {
  participant_id?: number;
  tournament_team_id?: number;
  award_type: string;
  issued_date: string;
}
