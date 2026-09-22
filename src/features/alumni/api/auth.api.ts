import axiosInstance from '../../../lib/axios';
import type { AlumniRegisterFormData } from '../types/profile.types';

// Staff-only: creates the alumni's profile and portal login in one call.
// Needs alumni:create + alumni:issue_account.
export async function registerAlumniAccount(data: AlumniRegisterFormData): Promise<unknown> {
  const response = await axiosInstance.post('/alumni/auth/register', {
    full_name: data.full_name.trim(),
    email: data.email.trim(),
    batch_year: Number(data.batch_year),
    graduation_year: Number(data.graduation_year),
    program: data.program.trim(),
    phone: data.phone.trim(),
    student_ref: data.student_ref.trim(),
    admission_no: data.admission_no.trim(),
    current_company: data.current_company.trim(),
    current_designation: data.current_designation.trim(),
    industry: data.industry.trim(),
    city: data.city.trim(),
    country: data.country.trim(),
    linkedin_url: data.linkedin_url.trim(),
    visibility: data.visibility,
    contact_visible: data.contact_visible,
    email_opt_in: data.email_opt_in,
    sms_opt_in: data.sms_opt_in,
    password: data.password,
    verification_status: data.verification_status,
    verification_note: data.verification_note.trim(),
  });
  return response.data.data ?? response.data;
}

// Changes the current alumni portal session's own password. This targets the
// alumni-facing portal, not this staff admin UI, so nothing here calls it yet.
export async function changeAlumniPassword(currentPassword: string, newPassword: string): Promise<void> {
  await axiosInstance.post('/alumni/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}
