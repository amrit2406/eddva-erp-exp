
// import LoginLogo from '../components/LoginLogo';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Header */}
      {/* <header className="w-full px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <LoginLogo />
        </div>
      </header> */}

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-slate-500">
              Sign in to continue to your school dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(0,44,109,0.08)] p-7 sm:p-9">

            {/* Accent */}
            <div className="h-1 w-16 rounded-full bg-[#008BE9] mx-auto mb-7" />

            <LoginForm />

          </div>

          {/* Footer Message */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Secure access to your school management portal
          </p>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Eddva ERP
        <span className="mx-2">•</span>
        All Rights Reserved
      </footer>

    </div>
  );
}
