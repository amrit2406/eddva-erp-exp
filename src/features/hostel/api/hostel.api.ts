import axiosInstance from '../../../lib/axios';
import type {
  AllotmentPayload,
  AttendanceMarkPayload,
  AttendanceParams,
  BedListParams,
  BulkAttendancePayload,
  BlockFormData,
  GatePassFormData,
  GenericRecord,
  HostelBed,
  HostelBlock,
  HostelResident,
  ResidentFormData,
  ResidentListParams,
  TransferPayload,
  TransferRequestPayload,
  VacatePayload,
  HostelRoom,
  ListParams,
  ListResult,
  Pagination,
  RecordResult,
  RoomFormData,
  RoomListParams,
  ScanPayload,
} from '../types/hostel.types';

function isRecord(value: unknown): value is GenericRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanParams<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

const ROW_KEYS = ['items', 'rows', 'data', 'blocks', 'rooms', 'beds', 'residents'];

function findRows(payload: GenericRecord, keys: string[]): unknown[] | undefined {
  return keys.map((key) => payload[key]).find(Array.isArray);
}

// List endpoints may answer with a bare array or wrap the rows in an object
// (items/rows/data/...), with pagination beside or inside the payload.
function unwrapList<T = GenericRecord>(body: unknown): ListResult<T> {
  if (!isRecord(body)) return { data: [] };
  const payload = body.data ?? body;
  if (Array.isArray(payload)) {
    return { data: payload as T[], pagination: body.pagination as Pagination | undefined };
  }
  if (isRecord(payload)) {
    return {
      data: (findRows(payload, ROW_KEYS) as T[] | undefined) ?? [],
      pagination: (body.pagination ?? payload.pagination) as Pagination | undefined,
    };
  }
  return { data: [] };
}

// For responses whose shape isn't known: a list stays a list, a summary object
// stays an object (with any pagination lifted out of it).
function unwrapRecord(body: unknown): RecordResult {
  if (!isRecord(body)) return { data: [] };
  const payload = body.data ?? body;
  if (Array.isArray(payload)) {
    return { data: payload as GenericRecord[], pagination: body.pagination as Pagination | undefined };
  }
  if (isRecord(payload)) {
    const rows = findRows(payload, ['items', 'rows', 'data']);
    const pagination = (body.pagination ?? payload.pagination) as Pagination | undefined;
    if (rows) return { data: rows as GenericRecord[], pagination };
    const { pagination: _pagination, ...rest } = payload;
    void _pagination;
    return { data: rest, pagination };
  }
  return { data: [] };
}

function unwrapItem<T>(body: { data?: unknown }): T {
  return (body.data ?? body) as T;
}

function normalizeBlock(raw: GenericRecord): HostelBlock {
  return { ...raw, block_id: Number(raw.block_id ?? raw.id) } as unknown as HostelBlock;
}

function normalizeRoom(raw: GenericRecord): HostelRoom {
  return { ...raw, room_id: Number(raw.room_id ?? raw.id) } as unknown as HostelRoom;
}

function normalizeBed(raw: GenericRecord): HostelBed {
  return { ...raw, bed_id: Number(raw.bed_id ?? raw.id) } as unknown as HostelBed;
}

function normalizeResident(raw: GenericRecord): HostelResident {
  return { ...raw, resident_id: Number(raw.resident_id ?? raw.id) } as unknown as HostelResident;
}

function toResidentPayload(data: ResidentFormData, mode: 'create' | 'update') {
  const optional = (value: string) => (value.trim() ? value.trim() : undefined);
  const payload = {
    // The student's reference and admission number identify them, so they're only sent on create.
    ...(mode === 'create'
      ? { student_ref: data.student_ref.trim(), admission_no: data.admission_no.trim() }
      : {}),
    student_name: data.student_name.trim(),
    gender: data.gender.trim(),
    grade: optional(data.grade),
    guardian_name: optional(data.guardian_name),
    guardian_phone: optional(data.guardian_phone),
    guardian_email: optional(data.guardian_email),
    admitted_on: optional(data.admitted_on),
  };
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function toBlockPayload(data: BlockFormData) {
  const warden = data.warden_user_id.trim();
  return {
    name: data.name.trim(),
    gender_type: data.gender_type.trim(),
    total_floors: Number(data.total_floors),
    ...(warden ? { warden_user_id: warden } : {}),
    description: data.description.trim(),
    is_active: data.is_active,
  };
}

function toRoomPayload(data: RoomFormData, mode: 'create' | 'update') {
  return {
    // A room's block is fixed once created, so it's only sent on create.
    ...(mode === 'create' ? { block_id: Number(data.block_id) } : {}),
    room_number: data.room_number.trim(),
    floor: Number(data.floor),
    room_type: data.room_type.trim(),
    capacity: Number(data.capacity),
    description: data.description.trim(),
  };
}

// Blocks
export async function getBlocks(): Promise<HostelBlock[]> {
  const response = await axiosInstance.get('/hostel/blocks');
  return unwrapList<GenericRecord>(response.data).data.map(normalizeBlock);
}

export async function getBlock(id: string | number): Promise<HostelBlock> {
  const response = await axiosInstance.get(`/hostel/blocks/${id}`);
  return normalizeBlock(unwrapItem<GenericRecord>(response.data));
}

export async function createBlock(data: BlockFormData): Promise<HostelBlock> {
  const response = await axiosInstance.post('/hostel/blocks', toBlockPayload(data));
  return normalizeBlock(unwrapItem<GenericRecord>(response.data));
}

export async function updateBlock(id: string | number, data: BlockFormData): Promise<HostelBlock> {
  const response = await axiosInstance.patch(`/hostel/blocks/${id}`, toBlockPayload(data));
  return normalizeBlock(unwrapItem<GenericRecord>(response.data));
}

export async function deleteBlock(id: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/blocks/${id}`);
}

export async function assignBlockWarden(id: string | number, wardenUserId: string): Promise<HostelBlock> {
  const response = await axiosInstance.post(`/hostel/blocks/${id}/assign-warden`, {
    warden_user_id: wardenUserId.trim(),
  });
  return normalizeBlock(unwrapItem<GenericRecord>(response.data));
}

export async function getBlockOccupancy(id: string | number): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/blocks/${id}/occupancy`);
  return unwrapRecord(response.data);
}

export async function getBlockRooms(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/blocks/${id}/rooms`, { params });
  return unwrapRecord(response.data);
}

export async function getBlockResidents(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/blocks/${id}/residents`, { params });
  return unwrapRecord(response.data);
}

// Rooms
export async function getRooms(params: RoomListParams = {}): Promise<ListResult<HostelRoom>> {
  const response = await axiosInstance.get('/hostel/rooms', { params: cleanParams(params) });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeRoom), pagination: result.pagination };
}

export async function getRoomVacancy(params: RoomListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/rooms/vacancy', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getAvailableRooms(params: RoomListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/rooms/available', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getRoom(id: string | number): Promise<HostelRoom> {
  const response = await axiosInstance.get(`/hostel/rooms/${id}`);
  return normalizeRoom(unwrapItem<GenericRecord>(response.data));
}

export async function createRoom(data: RoomFormData): Promise<HostelRoom> {
  const response = await axiosInstance.post('/hostel/rooms', toRoomPayload(data, 'create'));
  return normalizeRoom(unwrapItem<GenericRecord>(response.data));
}

export async function updateRoom(id: string | number, data: RoomFormData): Promise<HostelRoom> {
  const response = await axiosInstance.patch(`/hostel/rooms/${id}`, toRoomPayload(data, 'update'));
  return normalizeRoom(unwrapItem<GenericRecord>(response.data));
}

export async function deleteRoom(id: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/rooms/${id}`);
}

export async function getRoomOccupancy(id: string | number): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/rooms/${id}/occupancy`);
  return unwrapRecord(response.data);
}

export async function getRoomResidents(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/rooms/${id}/residents`, { params });
  return unwrapRecord(response.data);
}

export async function getRoomAllotmentHistory(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/rooms/${id}/allotment-history`, { params });
  return unwrapRecord(response.data);
}

// Beds
export async function getRoomBeds(roomId: string | number, params: ListParams = {}): Promise<ListResult<HostelBed>> {
  const response = await axiosInstance.get(`/hostel/rooms/${roomId}/beds`, { params });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeBed), pagination: result.pagination };
}

export async function createRoomBed(roomId: string | number, bedNumber: string): Promise<HostelBed> {
  const response = await axiosInstance.post(`/hostel/rooms/${roomId}/beds`, { bed_number: bedNumber.trim() });
  return normalizeBed(unwrapItem<GenericRecord>(response.data));
}

export async function getBeds(params: BedListParams = {}): Promise<ListResult<HostelBed>> {
  const response = await axiosInstance.get('/hostel/beds', { params: cleanParams(params) });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeBed), pagination: result.pagination };
}

export async function getAvailableBeds(params: BedListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/beds/available', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getOccupiedBeds(params: BedListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/beds/occupied', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getBedsOccupancy(params: BedListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/beds/occupancy', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getBed(id: string | number): Promise<HostelBed> {
  const response = await axiosInstance.get(`/hostel/beds/${id}`);
  return normalizeBed(unwrapItem<GenericRecord>(response.data));
}

export async function updateBed(id: string | number, bedNumber: string): Promise<HostelBed> {
  const response = await axiosInstance.patch(`/hostel/beds/${id}`, { bed_number: bedNumber.trim() });
  return normalizeBed(unwrapItem<GenericRecord>(response.data));
}

export async function deleteBed(id: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/beds/${id}`);
}

// Residents
export async function getResidents(params: ResidentListParams = {}): Promise<ListResult<HostelResident>> {
  const response = await axiosInstance.get('/hostel/residents', { params: cleanParams(params) });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeResident), pagination: result.pagination };
}

export async function getResident(id: string | number): Promise<HostelResident> {
  const response = await axiosInstance.get(`/hostel/residents/${id}`);
  return normalizeResident(unwrapItem<GenericRecord>(response.data));
}

export async function createResident(data: ResidentFormData): Promise<HostelResident> {
  const response = await axiosInstance.post('/hostel/residents', toResidentPayload(data, 'create'));
  return normalizeResident(unwrapItem<GenericRecord>(response.data));
}

export async function updateResident(id: string | number, data: ResidentFormData): Promise<HostelResident> {
  const response = await axiosInstance.patch(`/hostel/residents/${id}`, toResidentPayload(data, 'update'));
  return normalizeResident(unwrapItem<GenericRecord>(response.data));
}

export async function suspendResident(id: string | number, reason: string): Promise<void> {
  await axiosInstance.post(`/hostel/residents/${id}/suspend`, { reason: reason.trim() });
}

export async function reinstateResident(id: string | number, remarks: string): Promise<void> {
  await axiosInstance.post(`/hostel/residents/${id}/reinstate`, { remarks: remarks.trim() });
}

export async function readmitResident(id: string | number, admittedOn: string): Promise<void> {
  await axiosInstance.post(`/hostel/residents/${id}/readmit`, { admitted_on: admittedOn });
}

export async function allotResident(id: string | number, data: AllotmentPayload): Promise<void> {
  await axiosInstance.post(`/hostel/residents/${id}/allotment`, data);
}

// Resolves to null when the resident has no current allotment.
export async function getResidentAllotment(id: string | number): Promise<RecordResult | null> {
  try {
    const response = await axiosInstance.get(`/hostel/residents/${id}/allotment`);
    const body = response.data;
    if (isRecord(body) && 'data' in body && (body.data === null || body.data === undefined)) return null;
    return unwrapRecord(body);
  } catch (error) {
    if ((error as { response?: { status?: number } }).response?.status === 404) return null;
    throw error;
  }
}

export async function getResidentAllotmentHistory(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/residents/${id}/allotment-history`, { params });
  return unwrapRecord(response.data);
}

export async function vacateResident(id: string | number, data: VacatePayload): Promise<void> {
  await axiosInstance.post(`/hostel/residents/${id}/vacate`, {
    vacate_date: data.vacate_date,
    reason: data.reason.trim(),
  });
}

export async function transferResident(id: string | number, data: TransferPayload): Promise<void> {
  await axiosInstance.post(`/hostel/residents/${id}/transfer`, { ...data, reason: data.reason.trim() });
}

export async function requestResidentTransfer(id: string | number, data: TransferRequestPayload): Promise<void> {
  await axiosInstance.post(`/hostel/residents/${id}/transfer-request`, { ...data, reason: data.reason.trim() });
}

export async function getResidentTransferHistory(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/residents/${id}/transfer-history`, { params });
  return unwrapRecord(response.data);
}

// Allotments
export async function getAllotments(params: ListParams & { academic_year?: string } = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/allotments', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getAllotment(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/allotments/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

// Transfer requests
export async function getTransferRequests(params: ListParams & { status?: string } = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/transfer-requests', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getTransferRequest(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/transfer-requests/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function approveTransferRequest(id: string | number, bedId: number, remarks: string): Promise<void> {
  const trimmed = remarks.trim();
  await axiosInstance.post(`/hostel/transfer-requests/${id}/approve`, {
    bed_id: bedId,
    ...(trimmed ? { remarks: trimmed } : {}),
  });
}

export async function rejectTransferRequest(id: string | number, remarks: string): Promise<void> {
  await axiosInstance.post(`/hostel/transfer-requests/${id}/reject`, { remarks: remarks.trim() });
}

export async function cancelTransferRequest(id: string | number): Promise<void> {
  await axiosInstance.post(`/hostel/transfer-requests/${id}/cancel`);
}

// Gate passes
export async function getGatePasses(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/gate-passes', { params });
  return unwrapRecord(response.data);
}

export type GatePassView = 'pending' | 'out' | 'overdue' | 'today';

export async function getGatePassView(view: GatePassView, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/gate-passes/${view}`, { params });
  return unwrapRecord(response.data);
}

export async function getResidentGatePasses(residentId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/gate-passes/resident/${residentId}`, { params });
  return unwrapRecord(response.data);
}

export async function getGatePass(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/gate-passes/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function createGatePass(data: GatePassFormData): Promise<GenericRecord> {
  const response = await axiosInstance.post('/hostel/gate-passes', {
    resident_id: Number(data.resident_id),
    pass_type: data.pass_type.trim(),
    reason: data.reason.trim(),
    destination: data.destination.trim(),
    requested_out_at: new Date(data.requested_out_at).toISOString(),
    expected_return_at: new Date(data.expected_return_at).toISOString(),
  });
  return unwrapItem<GenericRecord>(response.data);
}

function remarksBody(remarks: string) {
  const trimmed = remarks.trim();
  return trimmed ? { remarks: trimmed } : {};
}

export async function approveGatePass(id: string | number, remarks: string): Promise<void> {
  await axiosInstance.post(`/hostel/gate-passes/${id}/approve`, remarksBody(remarks));
}

export async function rejectGatePass(id: string | number, remarks: string): Promise<void> {
  await axiosInstance.post(`/hostel/gate-passes/${id}/reject`, { remarks: remarks.trim() });
}

export async function cancelGatePass(id: string | number, remarks: string): Promise<void> {
  await axiosInstance.post(`/hostel/gate-passes/${id}/cancel`, remarksBody(remarks));
}

function toScanBody(data: ScanPayload) {
  return {
    ...(data.resident_id !== undefined ? { resident_id: data.resident_id } : {}),
    ...(data.admission_no?.trim() ? { admission_no: data.admission_no.trim() } : {}),
    ...(data.pass_no?.trim() ? { pass_no: data.pass_no.trim() } : {}),
    ...remarksBody(data.remarks ?? ''),
  };
}

// Scan at the gate by pass number, admission number or resident id.
export async function scanGate(direction: 'out' | 'in', data: ScanPayload): Promise<GenericRecord> {
  const response = await axiosInstance.post(`/hostel/gate-passes/scan-${direction}`, toScanBody(data));
  return unwrapItem<GenericRecord>(response.data);
}

// Scan a specific pass, confirming the resident it belongs to.
export async function scanGatePass(
  id: string | number,
  direction: 'out' | 'in',
  data: ScanPayload
): Promise<GenericRecord> {
  const response = await axiosInstance.post(`/hostel/gate-passes/${id}/scan-${direction}`, toScanBody(data));
  return unwrapItem<GenericRecord>(response.data);
}

// Attendance
export async function getAttendance(params: AttendanceParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/attendance', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getAttendanceSummary(params: AttendanceParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/attendance/summary', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getAttendanceAbsences(params: AttendanceParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/attendance/absences', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getResidentAttendance(residentId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/attendance/resident/${residentId}`, { params });
  return unwrapRecord(response.data);
}

export async function getAttendanceRecord(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/attendance/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function markAttendance(data: AttendanceMarkPayload): Promise<GenericRecord> {
  const remarks = data.remarks?.trim();
  const response = await axiosInstance.post('/hostel/attendance', {
    resident_id: data.resident_id,
    attendance_date: data.attendance_date,
    session: data.session,
    status: data.status,
    ...(remarks ? { remarks } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function bulkMarkAttendance(data: BulkAttendancePayload): Promise<GenericRecord> {
  const response = await axiosInstance.post('/hostel/attendance/bulk', {
    attendance_date: data.attendance_date,
    session: data.session,
    entries: data.entries.map((entry) => {
      const remarks = entry.remarks?.trim();
      return { resident_id: entry.resident_id, status: entry.status, ...(remarks ? { remarks } : {}) };
    }),
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function updateAttendance(id: string | number, status: string, remarks: string): Promise<GenericRecord> {
  const trimmed = remarks.trim();
  const response = await axiosInstance.patch(`/hostel/attendance/${id}`, {
    status,
    ...(trimmed ? { remarks: trimmed } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}
