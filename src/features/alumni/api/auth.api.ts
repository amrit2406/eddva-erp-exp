import axiosInstance from '../../../lib/axios';
import type { AlumniRegisterFormData } from '../types/alumni.types';

// Staff-only: creates the alumni's profile and portal login in one call.
// Needs alumni:create + alumni:issue_account. The exact response/profile
// field set isn't confirmed yet — see the summary this was added with.
export async function registerAlumniAccount(data: AlumniRegisterFormData): Promise<unknown> {
  const response = await axiosInstance.post('/alumni/auth/register', {
    full_name: data.full_name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    graduation_year: data.graduation_year.trim(),
    program: data.program.trim(),
    username: data.username.trim(),
    password: data.password,
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
