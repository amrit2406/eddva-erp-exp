import { GraduationCap } from 'lucide-react';

export default function LoginLogo() {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
        <GraduationCap className="h-10 w-10 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">School ERP</h1>
      <p className="text-sm text-gray-600">Sign in to your account</p>
    </div>
  );
}
