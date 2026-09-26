import axiosInstance from '../../../lib/axios';
import type {
  AdmissionPayment,
  AdmissionPaymentListParams,
  AdmissionSession,
  AdmissionProgram,
  Applicant,
  ApplicantFormData,
  Application,
  ApplicationActivity,
  ApplicationCreateData,
  ApplicationDocument,
  ApplicationFeePayment,
  ApplicationListParams,
  ApplicationStatus,
  ApplicationStatusChange,
  ApplicationUpdateData,
  Confirmation,
  ConfirmationListParams,
  ConvertEnquiryData,
  DocumentUploadData,
  Enquiry,
  EnquiryFollowup,
  EnquiryFormData,
  EnquiryListParams,
  EnquiryStatus,
  EntranceTest,
  EvaluationFormData,
  FeePaymentFormData,
  FeePaymentUpdateData,
  FeeStructure,
  FeeStructureFormData,
  FeeStructureListParams,
  FollowupFormData,
  Interview,
  InterviewFormData,
  InterviewListParams,
  InterviewStatus,
  ListParams,
  MeritEntryPayload,
  MeritList,
  MeritListFormData,
  MeritListParams,
  Offer,
  OfferFormData,
  OfferListParams,
  Pagination,
  PaginatedResult,
  ProgramFormData,
  SessionFormData,
  SessionListParams,
  RegistrationStatus,
  TestFormData,
  TestListParams,
  TestRegistration,
  TestResult,
  TestResultEntry,
} from '../types/admission.types';
import { fromDateTimeInput } from '../utils/format';

function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined)
  ) as Partial<T>;
}

// Academic Sessions
export async function getSessions(params: SessionListParams = {}): Promise<PaginatedResult<AdmissionSession>> {
  const response = await axiosInstance.get('/admission/sessions', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getSession(id: string | number): Promise<AdmissionSession> {
  const response = await axiosInstance.get(`/admission/sessions/${id}`);
  return response.data.data;
}

export async function createSession(data: SessionFormData): Promise<AdmissionSession> {
  const response = await axiosInstance.post('/admission/sessions', data);
  return response.data.data;
}

export async function updateSession(id: string | number, data: Partial<SessionFormData>): Promise<AdmissionSession> {
  const response = await axiosInstance.patch(`/admission/sessions/${id}`, data);
  return response.data.data;
}

export async function deleteSession(id: string | number): Promise<void> {
  await axiosInstance.delete(`/admission/sessions/${id}`);
}

// Programs
export async function getPrograms(params: ListParams = {}): Promise<PaginatedResult<AdmissionProgram>> {
  const response = await axiosInstance.get('/admission/programs', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getProgram(id: string | number): Promise<AdmissionProgram> {
  const response = await axiosInstance.get(`/admission/programs/${id}`);
  return response.data.data;
}

export async function createProgram(data: ProgramFormData): Promise<AdmissionProgram> {
  const response = await axiosInstance.post('/admission/programs', toProgramPayload(data, 'create'));
  return response.data.data;
}

export async function updateProgram(id: string | number, data: Partial<ProgramFormData>): Promise<AdmissionProgram> {
  const response = await axiosInstance.patch(`/admission/programs/${id}`, toProgramPayload(data, 'update'));
  return response.data.data;
}

export async function deleteProgram(id: string | number): Promise<void> {
  await axiosInstance.delete(`/admission/programs/${id}`);
}

// Create omits an empty eligibility_criteria; update sends null so a cleared
// field is actually cleared instead of silently keeping the old value.
function toProgramPayload(data: Partial<ProgramFormData>, mode: 'create' | 'update') {
  const payload: Record<string, unknown> = { ...data };
  if (typeof data.name === 'string') payload.name = data.name.trim();
  if (typeof data.level === 'string') payload.level = data.level.trim();
  if (typeof data.eligibility_criteria === 'string') {
    const criteria = data.eligibility_criteria.trim();
    if (criteria) payload.eligibility_criteria = criteria;
    else if (mode === 'update') payload.eligibility_criteria = null;
    else delete payload.eligibility_criteria;
  }
  return payload;
}

// Applicants (no delete endpoint — applicants are created, viewed and edited only)
export async function getApplicants(params: ListParams = {}): Promise<PaginatedResult<Applicant>> {
  const response = await axiosInstance.get('/admission/applicants', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getApplicant(id: string | number): Promise<Applicant> {
  const response = await axiosInstance.get(`/admission/applicants/${id}`);
  return response.data.data;
}

export async function createApplicant(data: ApplicantFormData): Promise<Applicant> {
  const response = await axiosInstance.post('/admission/applicants', toApplicantPayload(data, 'create'));
  return response.data.data;
}

export async function updateApplicant(id: string | number, data: Partial<ApplicantFormData>): Promise<Applicant> {
  const response = await axiosInstance.patch(`/admission/applicants/${id}`, toApplicantPayload(data, 'update'));
  return response.data.data;
}

const APPLICANT_OPTIONAL_FIELDS = ['email', 'phone', 'address', 'guardian_name', 'guardian_contact', 'photo_url'] as const;

// Same convention as programs: create omits empty optional fields, update sends
// null so a cleared field is actually cleared rather than keeping the old value.
function toApplicantPayload(data: Partial<ApplicantFormData>, mode: 'create' | 'update') {
  const payload: Record<string, unknown> = { ...data };
  if (typeof data.name === 'string') payload.name = data.name.trim();
  for (const field of APPLICANT_OPTIONAL_FIELDS) {
    const value = data[field];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) payload[field] = trimmed;
    else if (mode === 'update') payload[field] = null;
    else delete payload[field];
  }
  return payload;
}

// Enquiries & Leads
export async function getEnquiries(params: EnquiryListParams = {}): Promise<PaginatedResult<Enquiry>> {
  const response = await axiosInstance.get('/admission/enquiries', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getEnquiry(id: string | number): Promise<Enquiry> {
  const response = await axiosInstance.get(`/admission/enquiries/${id}`);
  return response.data.data;
}

export async function createEnquiry(data: EnquiryFormData): Promise<Enquiry> {
  const response = await axiosInstance.post('/admission/enquiries', toEnquiryPayload(data, 'create'));
  return response.data.data;
}

export async function updateEnquiry(id: string | number, data: Partial<EnquiryFormData>): Promise<Enquiry> {
  const response = await axiosInstance.patch(`/admission/enquiries/${id}`, toEnquiryPayload(data, 'update'));
  return response.data.data;
}

export async function deleteEnquiry(id: string | number): Promise<void> {
  await axiosInstance.delete(`/admission/enquiries/${id}`);
}

export async function assignEnquiry(id: string | number, assignedTo: string): Promise<Enquiry> {
  const response = await axiosInstance.post(`/admission/enquiries/${id}/assign`, { assigned_to: assignedTo.trim() });
  return response.data.data;
}

export async function changeEnquiryStatus(id: string | number, status: EnquiryStatus): Promise<Enquiry> {
  const response = await axiosInstance.post(`/admission/enquiries/${id}/status`, { status });
  return response.data.data;
}

// Converts the enquiry into an application (the result is not used by the UI yet).
export async function convertEnquiry(id: string | number, data: ConvertEnquiryData): Promise<unknown> {
  const response = await axiosInstance.post(`/admission/enquiries/${id}/convert`, data);
  return response.data.data;
}

export async function getFollowups(enquiryId: string | number): Promise<EnquiryFollowup[]> {
  const response = await axiosInstance.get(`/admission/enquiries/${enquiryId}/followups`);
  return response.data.data;
}

export async function createFollowup(enquiryId: string | number, data: FollowupFormData): Promise<EnquiryFollowup> {
  const response = await axiosInstance.post(`/admission/enquiries/${enquiryId}/followups`, toFollowupPayload(data, 'create'));
  return response.data.data;
}

export async function updateFollowup(
  enquiryId: string | number,
  followupId: string | number,
  data: Partial<FollowupFormData>
): Promise<EnquiryFollowup> {
  const response = await axiosInstance.patch(
    `/admission/enquiries/${enquiryId}/followups/${followupId}`,
    toFollowupPayload(data, 'update')
  );
  return response.data.data;
}

const ENQUIRY_OPTIONAL_FIELDS = ['phone', 'email', 'assigned_to'] as const;

// Same convention as programs/applicants: create omits empty optional fields,
// update sends null so a cleared field is actually cleared.
function toEnquiryPayload(data: Partial<EnquiryFormData>, mode: 'create' | 'update') {
  const payload: Record<string, unknown> = { ...data };
  if (typeof data.name === 'string') payload.name = data.name.trim();
  for (const field of ENQUIRY_OPTIONAL_FIELDS) {
    const value = data[field];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) payload[field] = trimmed;
    else if (mode === 'update') payload[field] = null;
    else delete payload[field];
  }
  if ('program_id' in data) {
    if (typeof data.program_id === 'number' && !Number.isNaN(data.program_id)) payload.program_id = data.program_id;
    else if (mode === 'update') payload.program_id = null;
    else delete payload.program_id;
  }
  return payload;
}

function toFollowupPayload(data: Partial<FollowupFormData>, mode: 'create' | 'update') {
  const payload: Record<string, unknown> = { ...data };
  if (typeof data.notes === 'string') payload.notes = data.notes.trim();
  if (typeof data.next_followup_date === 'string' && !data.next_followup_date) {
    if (mode === 'update') payload.next_followup_date = null;
    else delete payload.next_followup_date;
  }
  return payload;
}

// Applications
export async function getApplications(params: ApplicationListParams = {}): Promise<PaginatedResult<Application>> {
  const response = await axiosInstance.get('/admission/applications', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getApplication(id: string | number): Promise<Application> {
  const response = await axiosInstance.get(`/admission/applications/${id}`);
  return response.data.data;
}

export async function createApplication(data: ApplicationCreateData): Promise<Application> {
  const { applicant, ...rest } = data;
  const payload = applicant ? { ...rest, applicant: toApplicantPayload(applicant, 'create') } : rest;
  const response = await axiosInstance.post('/admission/applications', payload);
  return response.data.data;
}

export async function updateApplication(id: string | number, data: Partial<ApplicationUpdateData>): Promise<Application> {
  const response = await axiosInstance.patch(`/admission/applications/${id}`, data);
  return response.data.data;
}

export async function deleteApplication(id: string | number): Promise<void> {
  await axiosInstance.delete(`/admission/applications/${id}`);
}

export async function changeApplicationStatus(
  id: string | number,
  status: ApplicationStatus,
  reason?: string
): Promise<Application> {
  const trimmed = reason?.trim();
  const response = await axiosInstance.post(`/admission/applications/${id}/status`, {
    status,
    ...(trimmed && { reason: trimmed }),
  });
  return response.data.data;
}

export async function getApplicationStatusHistory(id: string | number): Promise<ApplicationStatusChange[]> {
  const response = await axiosInstance.get(`/admission/applications/${id}/status`);
  return response.data.data;
}

export async function getApplicationActivity(id: string | number): Promise<ApplicationActivity[]> {
  const response = await axiosInstance.get(`/admission/applications/${id}/activity`);
  return response.data.data;
}

// Application Documents
export async function getApplicationDocuments(applicationId: string | number): Promise<ApplicationDocument[]> {
  const response = await axiosInstance.get(`/admission/applications/${applicationId}/documents`);
  return response.data.data;
}

// Multipart upload: the file plus its document_type.
export async function uploadApplicationDocument(
  applicationId: string | number,
  data: DocumentUploadData
): Promise<ApplicationDocument> {
  const body = new FormData();
  body.append('file', data.file);
  body.append('document_type', data.document_type.trim());
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/documents`, body);
  return response.data.data;
}

export async function verifyApplicationDocument(
  applicationId: string | number,
  documentId: string | number
): Promise<ApplicationDocument> {
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/documents/${documentId}/verify`);
  return response.data.data;
}

export async function rejectApplicationDocument(
  applicationId: string | number,
  documentId: string | number,
  reason: string
): Promise<ApplicationDocument> {
  const response = await axiosInstance.post(
    `/admission/applications/${applicationId}/documents/${documentId}/reject`,
    { reason: reason.trim() }
  );
  return response.data.data;
}

export interface DownloadedFile {
  blob: Blob;
  filename: string | null;
}

// File endpoints need the auth header, so they can't be plain links: fetch the
// file as a blob and let the caller save or preview it.
async function fetchBlob(path: string, params?: object): Promise<DownloadedFile> {
  try {
    const response = await axiosInstance.get(path, { params, responseType: 'blob' });
    const disposition: string | undefined = response.headers['content-disposition'];
    const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    return { blob: response.data, filename: match ? decodeURIComponent(match[1]) : null };
  } catch (error: any) {
    // With responseType 'blob' an error body arrives as a Blob too; decode it
    // so getApiErrorMessage can read the API's message.
    if (error?.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        // not JSON — leave it, the generic message will be used
      }
    }
    throw error;
  }
}

export function downloadApplicationDocument(
  applicationId: string | number,
  documentId: string | number
): Promise<DownloadedFile> {
  return fetchBlob(`/admission/applications/${applicationId}/documents/${documentId}/download`);
}

// Application Fee
export async function getApplicationFeePayments(applicationId: string | number): Promise<ApplicationFeePayment[]> {
  const response = await axiosInstance.get(`/admission/applications/${applicationId}/application-fee-payments`);
  return response.data.data;
}

// The caller supplies the idempotency key and must reuse it when retrying the
// same payment, so a double click or a retry after a timeout can't record it twice.
export async function payApplicationFee(
  applicationId: string | number,
  data: FeePaymentFormData,
  idempotencyKey: string
): Promise<ApplicationFeePayment> {
  const transactionRef = data.transaction_ref.trim();
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/pay-application-fee`, {
    amount: Number(data.amount),
    payment_date: data.payment_date,
    payment_mode: data.payment_mode,
    status: data.status,
    ...(transactionRef && { transaction_ref: transactionRef }),
    idempotency_key: idempotencyKey,
  });
  return response.data.data;
}

export async function updateApplicationFeePayment(
  applicationId: string | number,
  paymentId: string | number,
  data: FeePaymentUpdateData
): Promise<ApplicationFeePayment> {
  const response = await axiosInstance.patch(
    `/admission/applications/${applicationId}/application-fee-payments/${paymentId}`,
    data
  );
  return response.data.data;
}

// Entrance Tests (no delete endpoint)
export async function getTests(params: TestListParams = {}): Promise<PaginatedResult<EntranceTest>> {
  const response = await axiosInstance.get('/admission/tests', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getTest(id: string | number): Promise<EntranceTest> {
  const response = await axiosInstance.get(`/admission/tests/${id}`);
  return response.data.data;
}

export async function createTest(data: TestFormData): Promise<EntranceTest> {
  const response = await axiosInstance.post('/admission/tests', toTestPayload(data, 'create'));
  return response.data.data;
}

export async function updateTest(id: string | number, data: TestFormData): Promise<EntranceTest> {
  const response = await axiosInstance.patch(`/admission/tests/${id}`, toTestPayload(data, 'update'));
  return response.data.data;
}

// The date input is local time; the API takes an ISO timestamp. Venue follows the
// usual convention: omitted on create when empty, null on update so it clears.
function toTestPayload(data: TestFormData, mode: 'create' | 'update') {
  const venue = data.venue.trim();
  return {
    name: data.name.trim(),
    session_id: Number(data.session_id),
    program_id: Number(data.program_id),
    test_date: fromDateTimeInput(data.test_date),
    mode: data.mode,
    max_marks: Number(data.max_marks),
    ...(venue ? { venue } : mode === 'update' ? { venue: null } : {}),
  };
}

export async function registerForTest(testId: string | number, applicationIds: number[]): Promise<unknown> {
  const response = await axiosInstance.post(`/admission/tests/${testId}/register`, { application_ids: applicationIds });
  return response.data.data;
}

export async function getTestRegistrations(testId: string | number): Promise<TestRegistration[]> {
  const response = await axiosInstance.get(`/admission/tests/${testId}/registrations`);
  return response.data.data;
}

export async function updateTestRegistration(
  testId: string | number,
  registrationId: string | number,
  status: RegistrationStatus
): Promise<TestRegistration> {
  const response = await axiosInstance.patch(`/admission/tests/${testId}/registrations/${registrationId}`, { status });
  return response.data.data;
}

export async function getTestResults(testId: string | number): Promise<TestResult[]> {
  const response = await axiosInstance.get(`/admission/tests/${testId}/results`);
  return response.data.data;
}

export async function submitTestResults(testId: string | number, results: TestResultEntry[]): Promise<unknown> {
  const response = await axiosInstance.post(`/admission/tests/${testId}/results`, { results });
  return response.data.data;
}

// Interviews (no delete endpoint)
export async function getInterviews(params: InterviewListParams = {}): Promise<PaginatedResult<Interview>> {
  const response = await axiosInstance.get('/admission/interviews', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getInterview(id: string | number): Promise<Interview> {
  const response = await axiosInstance.get(`/admission/interviews/${id}`);
  return response.data.data;
}

export async function createInterview(data: InterviewFormData): Promise<Interview> {
  const venue = data.venue_or_link.trim();
  const response = await axiosInstance.post('/admission/interviews', {
    application_id: Number(data.application_id),
    scheduled_datetime: fromDateTimeInput(data.scheduled_datetime),
    mode: data.mode,
    ...(venue && { venue_or_link: venue }),
    ...(data.panelist_ids.length > 0 && { panelist_ids: data.panelist_ids }),
  });
  return response.data.data;
}

// The application can't be changed once scheduled, so it isn't sent. A cleared
// venue is sent as null and an emptied panel as [] so they actually clear.
export async function updateInterview(id: string | number, data: InterviewFormData): Promise<Interview> {
  const venue = data.venue_or_link.trim();
  const response = await axiosInstance.patch(`/admission/interviews/${id}`, {
    scheduled_datetime: fromDateTimeInput(data.scheduled_datetime),
    mode: data.mode,
    venue_or_link: venue || null,
    panelist_ids: data.panelist_ids,
  });
  return response.data.data;
}

export async function changeInterviewStatus(id: string | number, status: InterviewStatus): Promise<Interview> {
  const response = await axiosInstance.post(`/admission/interviews/${id}/status`, { status });
  return response.data.data;
}

export async function evaluateInterview(id: string | number, data: EvaluationFormData): Promise<Interview> {
  const remarks = data.remarks.trim();
  const response = await axiosInstance.post(`/admission/interviews/${id}/evaluate`, {
    score: Number(data.score),
    recommendation: data.recommendation,
    ...(remarks && { remarks }),
  });
  return response.data.data;
}

// Merit Lists (no delete endpoint)
export async function getMeritLists(params: MeritListParams = {}): Promise<PaginatedResult<MeritList>> {
  const response = await axiosInstance.get('/admission/merit-lists', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getMeritList(id: string | number): Promise<MeritList> {
  const response = await axiosInstance.get(`/admission/merit-lists/${id}`);
  return response.data.data;
}

export async function createMeritList(data: MeritListFormData, entries: MeritEntryPayload[]): Promise<MeritList> {
  const criteria = data.criteria_description.trim();
  const response = await axiosInstance.post('/admission/merit-lists', {
    name: data.name.trim(),
    session_id: Number(data.session_id),
    program_id: Number(data.program_id),
    ...(criteria && { criteria_description: criteria }),
    ...(entries.length > 0 && { entries }),
  });
  return response.data.data;
}

// Session and program are fixed once the list exists (its entries depend on
// them), so only the name and criteria are editable. A cleared criteria is null.
export async function updateMeritList(
  id: string | number,
  data: Pick<MeritListFormData, 'name' | 'criteria_description'>
): Promise<MeritList> {
  const response = await axiosInstance.patch(`/admission/merit-lists/${id}`, {
    name: data.name.trim(),
    criteria_description: data.criteria_description.trim() || null,
  });
  return response.data.data;
}

// PUT replaces the whole entry list, so callers send every entry, not a diff.
export async function replaceMeritListEntries(id: string | number, entries: MeritEntryPayload[]): Promise<MeritList> {
  const response = await axiosInstance.put(`/admission/merit-lists/${id}/entries`, { entries });
  return response.data.data;
}

export async function publishMeritList(id: string | number): Promise<MeritList> {
  const response = await axiosInstance.post(`/admission/merit-lists/${id}/publish`);
  return response.data.data;
}

// Fee Structures (no delete endpoint)
export async function getFeeStructures(params: FeeStructureListParams = {}): Promise<PaginatedResult<FeeStructure>> {
  const response = await axiosInstance.get('/admission/fee-structures', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getFeeStructure(id: string | number): Promise<FeeStructure> {
  const response = await axiosInstance.get(`/admission/fee-structures/${id}`);
  return response.data.data;
}

export async function createFeeStructure(data: FeeStructureFormData): Promise<FeeStructure> {
  const response = await axiosInstance.post('/admission/fee-structures', {
    program_id: Number(data.program_id),
    session_id: Number(data.session_id),
    amount: Number(data.amount),
    due_date: data.due_date,
  });
  return response.data.data;
}

// Program and session identify the structure, so an edit changes only the amount
// and due date.
export async function updateFeeStructure(
  id: string | number,
  data: Pick<FeeStructureFormData, 'amount' | 'due_date'>
): Promise<FeeStructure> {
  const response = await axiosInstance.patch(`/admission/fee-structures/${id}`, {
    amount: Number(data.amount),
    due_date: data.due_date,
  });
  return response.data.data;
}

// Offers
export async function getOffers(params: OfferListParams = {}): Promise<PaginatedResult<Offer>> {
  const response = await axiosInstance.get('/admission/offers', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getOffer(id: string | number): Promise<Offer> {
  const response = await axiosInstance.get(`/admission/offers/${id}`);
  return response.data.data;
}

// An application that hasn't been made an offer yet may answer 404 or an empty
// body; both mean "no offer" rather than an error.
export async function getApplicationOffer(applicationId: string | number): Promise<Offer | null> {
  try {
    const response = await axiosInstance.get(`/admission/applications/${applicationId}/offer`);
    return response.data.data ?? null;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

// offer_date is left to the server, which stamps it when the offer is issued.
export async function issueOffer(applicationId: string | number, data: OfferFormData): Promise<Offer> {
  const category = data.seat_category.trim();
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/offer`, {
    offer_expiry_date: fromDateTimeInput(data.offer_expiry_date),
    ...(category && { seat_category: category }),
  });
  return response.data.data;
}

export async function acceptOffer(applicationId: string | number): Promise<Offer> {
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/offer/accept`);
  return response.data.data;
}

export async function declineOffer(applicationId: string | number, reason: string): Promise<Offer> {
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/offer/decline`, {
    reason: reason.trim(),
  });
  return response.data.data;
}

// Admission Fee Payments (recorded once; there is no update endpoint)
export async function getAdmissionPayments(params: AdmissionPaymentListParams = {}): Promise<PaginatedResult<AdmissionPayment>> {
  const response = await axiosInstance.get('/admission/payments', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getAdmissionPayment(id: string | number): Promise<AdmissionPayment> {
  const response = await axiosInstance.get(`/admission/payments/${id}`);
  return response.data.data;
}

export async function getApplicationAdmissionPayments(applicationId: string | number): Promise<AdmissionPayment[]> {
  const response = await axiosInstance.get(`/admission/applications/${applicationId}/admission-payments`);
  return response.data.data;
}

// Takes the same form data as the application fee (its status is not sent) and
// the caller's idempotency key, which must be reused when retrying.
export async function payAdmissionFee(
  applicationId: string | number,
  data: FeePaymentFormData,
  idempotencyKey: string
): Promise<AdmissionPayment> {
  const transactionRef = data.transaction_ref.trim();
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/pay-admission-fee`, {
    amount_paid: Number(data.amount),
    payment_date: data.payment_date,
    payment_mode: data.payment_mode,
    ...(transactionRef && { transaction_ref: transactionRef }),
    idempotency_key: idempotencyKey,
  });
  return response.data.data;
}

// Confirmation
export async function getConfirmations(params: ConfirmationListParams = {}): Promise<PaginatedResult<Confirmation>> {
  const response = await axiosInstance.get('/admission/confirmations', { params: cleanParams(params) });
  return { data: response.data.data, pagination: response.data.pagination };
}

export async function getConfirmation(id: string | number): Promise<Confirmation> {
  const response = await axiosInstance.get(`/admission/confirmations/${id}`);
  return response.data.data;
}

// An application that hasn't been confirmed yet may answer 404 or an empty
// body; both mean "no confirmation" rather than an error.
export async function getApplicationConfirmation(applicationId: string | number): Promise<Confirmation | null> {
  try {
    const response = await axiosInstance.get(`/admission/applications/${applicationId}/confirmation`);
    return response.data.data ?? null;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export async function confirmAdmission(applicationId: string | number): Promise<Confirmation> {
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/confirm`);
  return response.data.data;
}

export async function cancelConfirmation(applicationId: string | number, reason: string): Promise<Confirmation> {
  const response = await axiosInstance.post(`/admission/applications/${applicationId}/confirmation/cancel`, {
    reason: reason.trim(),
  });
  return response.data.data;
}

export async function linkStudent(confirmationId: string | number, studentRef: string): Promise<Confirmation> {
  const response = await axiosInstance.post(`/admission/confirmations/${confirmationId}/link-student`, {
    student_ref: studentRef.trim(),
  });
  return response.data.data;
}

// Notification log (read-only). Rows are returned as-is; pagination is optional
// because the endpoint's envelope isn't pinned down.
export async function getNotifications(
  params: ListParams = {}
): Promise<{ data: Record<string, unknown>[]; pagination?: Pagination }> {
  const response = await axiosInstance.get('/admission/notifications', { params: cleanParams(params) });
  const rows = response.data.data;
  return { data: Array.isArray(rows) ? rows : [], pagination: response.data.pagination };
}

// Shape of GET /admission/dashboard/summary (same block the main dashboard embeds).
export interface AdmissionDashboardSummary {
  filters?: Record<string, unknown>;
  kpis: {
    total_enquiries: number;
    new_enquiries: number;
    enquiry_followups_due: number;
    applications: number;
    applications_under_review: number;
    tests_scheduled: number;
    interviews_scheduled: number;
    shortlisted: number;
    offers_issued: number;
    offers_accepted: number;
    admission_fees_paid: {
      applications_fully_paid: number;
      payments_recorded: number;
      // Arrives as a string, e.g. "0".
      amount_collected: number | string;
    };
    confirmed_admissions: number;
    available_seats: number;
  };
  funnel: { stage: string; count: number }[];
  applications_by_status: Record<string, number>;
  seats: { total_seats: number; offered: number; accepted: number; confirmed: number; available: number };
  recent?: {
    applications?: {
      application_id: number;
      application_number: string;
      status: string;
      application_date: string;
      applicant?: { name?: string };
      program?: { name?: string };
    }[];
    // Item shape not seen yet; rendered defensively.
    confirmations?: Record<string, unknown>[];
  };
}

export async function getDashboardSummary(): Promise<AdmissionDashboardSummary> {
  const response = await axiosInstance.get('/admission/dashboard/summary');
  return response.data.data ?? response.data;
}

// Reports (read-only). The response shapes vary per report, so the payload is
// returned as-is for the page to render generically.
export async function getReport(report: string, params: object = {}): Promise<unknown> {
  const response = await axiosInstance.get(`/admission/reports/${report}`, { params: cleanParams(params) });
  return response.data.data ?? response.data;
}

export function exportReport(report: string, params: object = {}): Promise<DownloadedFile> {
  return fetchBlob(`/admission/reports/${report}/export`, cleanParams(params));
}
