import AdmissionLoginForm from '../../components/auth/AdmissionLoginForm';

export default function AdmissionLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Admission Portal
            </h1>
            <p className="mt-2 text-slate-500">
              Sign in to manage enquiries, applications and admissions
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(0,44,109,0.08)] p-7 sm:p-9">
            <div className="h-1 w-16 rounded-full bg-[#008BE9] mx-auto mb-7" />
            <AdmissionLoginForm />
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Secure access to the admission management portal
          </p>
        </div>
      </main>

      <footer className="py-5 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Eddva ERP
        <span className="mx-2">•</span>
        All Rights Reserved
      </footer>
    </div>
  );
}
