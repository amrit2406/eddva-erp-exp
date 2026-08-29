import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';

export default function KioskLandingPage() {
  const navigate = useNavigate();
  const [appointmentId, setAppointmentId] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appointmentId.trim()) return;
    navigate(`/kiosk/${appointmentId.trim()}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
            <QrCode className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
          <p className="text-slate-600 mt-2">Scan your appointment QR code, or enter your appointment ID below to check in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            min="1"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            placeholder="Appointment ID"
            autoFocus
            className="w-full text-center text-xl px-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!appointmentId.trim()}
            className="w-full text-lg font-semibold py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
