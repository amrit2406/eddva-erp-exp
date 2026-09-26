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
  ComplaintEditData,
  ComplaintFormData,
  ComplaintParams,
  DisciplineFormData,
  FeePlan,
  FeePlanFormData,
  FeePlanParams,
  InvoiceFormData,
  InvoicePaymentFormData,
  MessAttendanceFormData,
  MessAttendanceParams,
  MessBulkPayload,
  MessMenuEntry,
  MessMenuFormData,
  VisitorFormData,
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

// Mess menu
function normalizeMenuEntry(raw: GenericRecord): MessMenuEntry {
  return {
    ...raw,
    menu_id: Number(raw.menu_id ?? raw.mess_menu_id ?? raw.id),
    items: Array.isArray(raw.items) ? raw.items.map(String) : [],
  } as unknown as MessMenuEntry;
}

// A menu entry has its own `items` field (the dishes), so unlike unwrapRecord this
// never mistakes it for a wrapped row list.
function unwrapMenuView(body: unknown): RecordResult {
  if (!isRecord(body)) return { data: [] };
  const payload = body.data ?? body;
  if (Array.isArray(payload) || isRecord(payload)) {
    return { data: payload as GenericRecord | GenericRecord[], pagination: body.pagination as Pagination | undefined };
  }
  return { data: [] };
}

function toMenuPayload(data: MessMenuFormData) {
  return {
    day_of_week: data.day_of_week.trim().toLowerCase(),
    meal_type: data.meal_type.trim().toLowerCase(),
    items: data.items.map((item) => item.trim()).filter(Boolean),
    effective_from: data.effective_from,
    is_active: data.is_active,
  };
}

export async function getMessMenu(params: ListParams = {}): Promise<ListResult<MessMenuEntry>> {
  const response = await axiosInstance.get('/hostel/mess/menu', { params: cleanParams(params) });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeMenuEntry), pagination: result.pagination };
}

export async function getWeeklyMessMenu(): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/mess/menu/weekly');
  return unwrapMenuView(response.data);
}

export async function getDayMessMenu(day: string): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/mess/menu/day/${encodeURIComponent(day.toLowerCase())}`);
  return unwrapMenuView(response.data);
}

export async function getMessMenuEntry(id: string | number): Promise<MessMenuEntry> {
  const response = await axiosInstance.get(`/hostel/mess/menu/${id}`);
  return normalizeMenuEntry(unwrapItem<GenericRecord>(response.data));
}

export async function createMessMenuEntry(data: MessMenuFormData): Promise<MessMenuEntry> {
  const response = await axiosInstance.post('/hostel/mess/menu', toMenuPayload(data));
  return normalizeMenuEntry(unwrapItem<GenericRecord>(response.data));
}

export async function updateMessMenuEntry(id: string | number, data: MessMenuFormData): Promise<MessMenuEntry> {
  const response = await axiosInstance.patch(`/hostel/mess/menu/${id}`, toMenuPayload(data));
  return normalizeMenuEntry(unwrapItem<GenericRecord>(response.data));
}

export async function deleteMessMenuEntry(id: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/mess/menu/${id}`);
}

// Visitors
export type VisitorView = 'active' | 'today';

export async function getVisitors(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/visitors', { params });
  return unwrapRecord(response.data);
}

export async function getVisitorView(view: VisitorView, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/visitors/${view}`, { params });
  return unwrapRecord(response.data);
}

export async function getResidentVisitors(residentId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/visitors/resident/${residentId}`, { params });
  return unwrapRecord(response.data);
}

export async function getVisitor(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/visitors/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function createVisitor(data: VisitorFormData): Promise<GenericRecord> {
  const optional = (value: string) => (value.trim() ? value.trim() : undefined);
  const payload = {
    resident_id: Number(data.resident_id),
    visitor_name: data.visitor_name.trim(),
    relation: data.relation.trim(),
    id_proof_type: optional(data.id_proof_type),
    id_proof_number: optional(data.id_proof_number),
    purpose: data.purpose.trim(),
    // Left out when blank so the server stamps the arrival time itself.
    in_time: data.in_time ? new Date(data.in_time).toISOString() : undefined,
  };
  const response = await axiosInstance.post(
    '/hostel/visitors',
    Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
  );
  return unwrapItem<GenericRecord>(response.data);
}

export async function checkoutVisitor(id: string | number): Promise<void> {
  await axiosInstance.post(`/hostel/visitors/${id}/checkout`);
}

// Mess attendance
// The list and summary filters are sent under both the body's field name and the
// plain `date` the hostel attendance list uses, since either may be what's read.
function messFilters(params: MessAttendanceParams) {
  const { date, ...rest } = params;
  return cleanParams({ ...rest, ...(date ? { date, meal_date: date } : {}) });
}

export async function getMessAttendance(params: MessAttendanceParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/mess/attendance', { params: messFilters(params) });
  return unwrapRecord(response.data);
}

export async function getMessAttendanceSummary(params: MessAttendanceParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/mess/attendance/summary', { params: messFilters(params) });
  return unwrapRecord(response.data);
}

export async function getResidentMessAttendance(residentId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/mess/attendance/resident/${residentId}`, { params });
  return unwrapRecord(response.data);
}

export async function markMessAttendance(data: MessAttendanceFormData): Promise<GenericRecord> {
  const response = await axiosInstance.post('/hostel/mess/attendance', {
    resident_id: Number(data.resident_id),
    meal_date: data.meal_date,
    meal_type: data.meal_type.trim().toLowerCase(),
    status: data.status,
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function bulkMarkMessAttendance(data: MessBulkPayload): Promise<GenericRecord> {
  const response = await axiosInstance.post('/hostel/mess/attendance/bulk', {
    meal_date: data.meal_date,
    meal_type: data.meal_type.trim().toLowerCase(),
    entries: data.entries,
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function updateMessAttendance(id: string | number, status: string): Promise<GenericRecord> {
  const response = await axiosInstance.patch(`/hostel/mess/attendance/${id}`, { status });
  return unwrapItem<GenericRecord>(response.data);
}

// Complaints & maintenance
function notesBody(key: string, value: string) {
  const trimmed = value.trim();
  return trimmed ? { [key]: trimmed } : {};
}

export async function getComplaints(params: ComplaintParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/complaints', { params: cleanParams(params) });
  return unwrapRecord(response.data);
}

export async function getComplaint(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/complaints/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function createComplaint(data: ComplaintFormData): Promise<GenericRecord> {
  const response = await axiosInstance.post('/hostel/complaints', {
    resident_id: Number(data.resident_id),
    // A complaint about a common area has no room.
    ...(data.room_id ? { room_id: Number(data.room_id) } : {}),
    category: data.category.trim().toLowerCase(),
    description: data.description.trim(),
    priority: data.priority,
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function updateComplaint(id: string | number, data: ComplaintEditData): Promise<GenericRecord> {
  const response = await axiosInstance.patch(`/hostel/complaints/${id}`, {
    category: data.category.trim().toLowerCase(),
    description: data.description.trim(),
    priority: data.priority,
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function assignComplaint(id: string | number, assignedTo: string, notes: string): Promise<void> {
  await axiosInstance.post(`/hostel/complaints/${id}/assign`, {
    assigned_to: assignedTo.trim(),
    ...notesBody('notes', notes),
  });
}

export async function changeComplaintStatus(id: string | number, status: string, notes: string): Promise<void> {
  await axiosInstance.post(`/hostel/complaints/${id}/status`, { status, ...notesBody('notes', notes) });
}

export async function resolveComplaint(id: string | number, resolutionNotes: string): Promise<void> {
  await axiosInstance.post(`/hostel/complaints/${id}/resolve`, { resolution_notes: resolutionNotes.trim() });
}

export async function closeComplaint(id: string | number, notes: string): Promise<void> {
  await axiosInstance.post(`/hostel/complaints/${id}/close`, notesBody('notes', notes));
}

export async function getComplaintUpdates(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/complaints/${id}/updates`, { params });
  return unwrapRecord(response.data);
}

export async function addComplaintUpdate(id: string | number, notes: string): Promise<void> {
  await axiosInstance.post(`/hostel/complaints/${id}/updates`, { notes: notes.trim() });
}

export async function getComplaintHistory(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/complaints/${id}/history`, { params });
  return unwrapRecord(response.data);
}

// Fee plans
function normalizeFeePlan(raw: GenericRecord): FeePlan {
  return { ...raw, fee_plan_id: Number(raw.fee_plan_id ?? raw.plan_id ?? raw.id) } as unknown as FeePlan;
}

function toFeePlanPayload(data: FeePlanFormData) {
  return {
    name: data.name.trim(),
    room_type: data.room_type.trim().toLowerCase(),
    includes_mess: data.includes_mess,
    amount: Number(data.amount),
    billing_cycle: data.billing_cycle.trim().toLowerCase(),
    description: data.description.trim(),
    is_active: data.is_active,
  };
}

export async function getFeePlans(params: FeePlanParams = {}): Promise<ListResult<FeePlan>> {
  const response = await axiosInstance.get('/hostel/fee-plans', { params: cleanParams(params) });
  const result = unwrapList<GenericRecord>(response.data);
  return { data: result.data.map(normalizeFeePlan), pagination: result.pagination };
}

export async function getFeePlan(id: string | number): Promise<FeePlan> {
  const response = await axiosInstance.get(`/hostel/fee-plans/${id}`);
  return normalizeFeePlan(unwrapItem<GenericRecord>(response.data));
}

export async function createFeePlan(data: FeePlanFormData): Promise<FeePlan> {
  const response = await axiosInstance.post('/hostel/fee-plans', toFeePlanPayload(data));
  return normalizeFeePlan(unwrapItem<GenericRecord>(response.data));
}

export async function updateFeePlan(id: string | number, data: FeePlanFormData): Promise<FeePlan> {
  const response = await axiosInstance.patch(`/hostel/fee-plans/${id}`, toFeePlanPayload(data));
  return normalizeFeePlan(unwrapItem<GenericRecord>(response.data));
}

export async function deleteFeePlan(id: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/fee-plans/${id}`);
}

// Fee invoices
export type InvoiceView = 'outstanding' | 'due' | 'overdue';

export async function getInvoices(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/invoices', { params });
  return unwrapRecord(response.data);
}

export async function getInvoiceView(view: InvoiceView, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/invoices/${view}`, { params });
  return unwrapRecord(response.data);
}

export async function getInvoice(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/invoices/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function createInvoice(data: InvoiceFormData): Promise<GenericRecord> {
  const remarks = data.remarks.trim();
  const response = await axiosInstance.post('/hostel/invoices', {
    resident_id: Number(data.resident_id),
    fee_plan_id: Number(data.fee_plan_id),
    billing_period_start: data.billing_period_start,
    due_date: data.due_date,
    ...(remarks ? { remarks } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function cancelInvoice(id: string | number, reason: string): Promise<void> {
  await axiosInstance.post(`/hostel/invoices/${id}/cancel`, { reason: reason.trim() });
}

export async function getInvoicePayments(id: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/invoices/${id}/payments`, { params });
  return unwrapRecord(response.data);
}

export async function recordInvoicePayment(id: string | number, data: InvoicePaymentFormData): Promise<GenericRecord> {
  const reference = data.transaction_ref.trim();
  const remarks = data.remarks.trim();
  const response = await axiosInstance.post(`/hostel/invoices/${id}/payments`, {
    amount_paid: Number(data.amount_paid),
    payment_date: data.payment_date,
    payment_mode: data.payment_mode,
    ...(reference ? { transaction_ref: reference } : {}),
    ...(remarks ? { remarks } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function getResidentInvoices(residentId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/residents/${residentId}/invoices`, { params });
  return unwrapRecord(response.data);
}

export async function getResidentPayments(residentId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/residents/${residentId}/payments`, { params });
  return unwrapRecord(response.data);
}

export interface DownloadedFile {
  blob: Blob;
  filename: string | null;
}

// File endpoints need the auth header, so they can't be plain links: fetch the
// file as a blob and let the caller show or save it.
async function fetchBlob(path: string, params?: object): Promise<DownloadedFile> {
  try {
    const response = await axiosInstance.get(path, { params, responseType: 'blob' });
    const disposition: string | undefined = response.headers['content-disposition'];
    const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    return { blob: response.data, filename: match ? decodeURIComponent(match[1]) : null };
  } catch (error) {
    // With responseType 'blob' an error body arrives as a Blob too; decode it so
    // getApiErrorMessage can read the API's message.
    const failure = error as { response?: { data?: unknown } };
    if (failure.response?.data instanceof Blob) {
      try {
        failure.response.data = JSON.parse(await failure.response.data.text());
      } catch {
        // not JSON — leave it, the generic message will be used
      }
    }
    throw error;
  }
}

// Fee payments (read-only)
export async function getPayments(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/payments', { params });
  return unwrapRecord(response.data);
}

export async function getPayment(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/payments/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

// The receipt may be a document (PDF/HTML) or JSON data; the caller checks the type.
export function getPaymentReceipt(id: string | number): Promise<DownloadedFile> {
  return fetchBlob(`/hostel/payments/${id}/receipt`);
}

// Discipline
export async function getDisciplineRecords(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/discipline-records', { params });
  return unwrapRecord(response.data);
}

export async function getDisciplineRecord(id: string | number): Promise<GenericRecord> {
  const response = await axiosInstance.get(`/hostel/discipline-records/${id}`);
  return unwrapItem<GenericRecord>(response.data);
}

export async function getResidentDisciplineRecords(residentId: string | number, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/residents/${residentId}/discipline-records`, { params });
  return unwrapRecord(response.data);
}

export async function createDisciplineRecord(data: DisciplineFormData): Promise<GenericRecord> {
  const fine = data.fine_amount.trim();
  const response = await axiosInstance.post(`/hostel/residents/${data.resident_id}/discipline-records`, {
    incident_date: data.incident_date,
    category: data.category.trim().toLowerCase().replace(/\s+/g, '_'),
    description: data.description.trim(),
    action_taken: data.action_taken.trim().toLowerCase().replace(/\s+/g, '_'),
    ...(fine ? { fine_amount: Number(fine) } : {}),
    ...(data.gate_pass_id ? { gate_pass_id: Number(data.gate_pass_id) } : {}),
  });
  return unwrapItem<GenericRecord>(response.data);
}

export async function linkDisciplineGatePass(id: string | number, gatePassId: number): Promise<void> {
  await axiosInstance.post(`/hostel/discipline-records/${id}/link-gate-pass`, { gate_pass_id: gatePassId });
}

// Alerts
export type AlertView = 'summary' | 'overdue-passes' | 'unaccounted-absences';

export async function getAlerts(view: AlertView, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/alerts/${view}`, { params });
  return unwrapRecord(response.data);
}

// Dashboard — GET /hostel/dashboard/summary. Money fields arrive as strings ("5000.00").
interface SessionAttendance {
  present: number;
  absent: number;
  on_leave: number;
}

export interface HostelDashboardSummary {
  occupancy: {
    total_blocks: number;
    active_blocks: number;
    total_rooms: number;
    rooms_available: number;
    rooms_full: number;
    rooms_under_maintenance: number;
    total_capacity: number;
    occupied_places: number;
    vacant_places: number;
    occupancy_percentage: number;
    beds: { total_beds: number; occupied_beds: number; vacant_beds: number };
    residents: { total_residents: number; active: number; vacated: number; suspended: number };
  };
  gate: {
    currently_out: number;
    expected_returns_today: number;
    overdue_passes: number;
    todays_outings: number;
    todays_returns: number;
    pending_approvals: number;
  };
  attendance: {
    date: string;
    present: number;
    absent: number;
    on_leave: number;
    unaccounted_absences: number;
    by_session: Record<string, SessionAttendance>;
    unmarked: Record<string, number>;
  };
  complaints: { open: number; in_progress: number; urgent: number; unassigned: number; resolved: number; closed: number };
  fees: {
    total_invoices: number;
    total_due: string;
    total_paid: string;
    outstanding: string;
    outstanding_invoices: number;
    overdue_invoices: number;
    overdue_amount: string;
  };
  mess: {
    date: string;
    expected_meals: number;
    opted_in: number;
    opted_out: number;
    consumed: number;
    missed: number;
    by_meal: {
      meal_type: string;
      opted_in: number;
      opted_out: number;
      consumed: number;
      missed: number;
      expected_meals: number;
      consumption_rate: number | null;
    }[];
  };
}

export async function getDashboardSummary(): Promise<HostelDashboardSummary> {
  const response = await axiosInstance.get('/hostel/dashboard/summary');
  return response.data.data ?? response.data;
}

// Reports
export async function getHostelReport(report: string, params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get(`/hostel/reports/${encodeURIComponent(report)}`, { params });
  return unwrapRecord(response.data);
}

export function exportHostelReport(report: string): Promise<DownloadedFile> {
  return fetchBlob(`/hostel/reports/${encodeURIComponent(report)}/export`);
}

// Notification log
export async function getNotifications(params: ListParams = {}): Promise<RecordResult> {
  const response = await axiosInstance.get('/hostel/notifications', { params });
  return unwrapRecord(response.data);
}
