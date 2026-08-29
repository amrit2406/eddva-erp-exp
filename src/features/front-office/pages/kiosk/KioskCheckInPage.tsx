import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Calendar, Clock, User, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { lookupKioskAppointment, kioskCheckIn } from '../../api/kiosk.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { KioskAppointmentLookup, KioskCheckInResult } from '../../types/kiosk.types';

type Step = 'phone' | 'details' | 'success';

const STATUS_MESSAGE: Record<string, string> = {
  cancelled: 'This appointment has been cancelled.',
  completed: 'This appointment has already been completed.',
  no_show: 'This appointment was marked as a no-show.',
};

export default function KioskCheckInPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [appointment, setAppointment] = useState<KioskAppointmentLookup | null>(null);
  const [checkInResult, setCheckInResult] = useState<KioskCheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!appointmentId || !phone.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const data = await lookupKioskAppointment(appointmentId, phone.trim());
      setAppointment(data);
      setStep('details');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not find this appointment'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!appointmentId) return;
    setError(null);
    setLoading(true);
    try {
      const result = await kioskCheckIn(appointmentId, phone.trim());
      setCheckInResult(result);
      setStep('success');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Check-in failed'));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep('phone');
    setPhone('');
    setAppointment(null);
    setCheckInResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {step === 'phone' && (
          <>
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Confirm Your Phone Number</h1>
              <p className="text-slate-600">Enter the phone number used to book appointment #{appointmentId}</p>
            </div>
            <form onSubmit={handleLookup} className="space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                autoFocus
                className="w-full text-center text-xl px-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full text-lg font-semibold py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors"
              >
                {loading ? 'Looking up...' : 'Find My Appointment'}
              </button>
            </form>
          </>
        )}

        {step === 'details' && appointment && (
          <>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900">Hello, {appointment.visitor_name}</h1>
              <p className="text-slate-600 mt-1">Please confirm your appointment details</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>Meeting with <strong>{appointment.host_name}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>{appointment.department}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span>{new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {appointment.purpose && (
                <p className="text-sm text-slate-500 pt-2 border-t border-slate-200">{appointment.purpose}</p>
              )}
            </div>

            {appointment.can_check_in ? (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full text-lg font-semibold py-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white transition-colors"
              >
                {loading ? 'Checking In...' : 'Check In'}
              </button>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2">
                <XCircle className="h-5 w-5" />
                {STATUS_MESSAGE[appointment.status] ?? `This appointment cannot be checked in (status: ${appointment.status}).`}
              </div>
            )}

            <button onClick={reset} className="w-full text-sm text-slate-500 hover:text-slate-700">
              Start Over
            </button>
          </>
        )}

        {step === 'success' && checkInResult && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">You're Checked In!</h1>
            <p className="text-slate-600">{checkInResult.host_name} has been notified.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-sm text-slate-500">Your Badge Number</p>
              <p className="text-3xl font-bold text-slate-900 font-mono mt-1">{checkInResult.badge_number}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(checkInResult.check_in_time).toLocaleString()}</p>
            </div>

            <p className="text-sm text-slate-500">Please take a seat — someone will be with you shortly.</p>

            <button onClick={reset} className="w-full text-sm text-slate-500 hover:text-slate-700 pt-2">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
