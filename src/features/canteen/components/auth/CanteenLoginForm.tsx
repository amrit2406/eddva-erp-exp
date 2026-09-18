import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';

import FormField from '../../../../components/forms/FormField';
import FormError from '../../../../components/forms/FormError';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { canteenLoginSchema, type CanteenLoginFormData } from '../../schemas/canteen-login.schema';
import { useCanteenLogin } from '../../hooks/useCanteenLogin';

export default function CanteenLoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CanteenLoginFormData>({
    resolver: zodResolver(canteenLoginSchema),
  });

  const { login, isLoading, error } = useCanteenLogin();

  const onSubmit = (data: CanteenLoginFormData) => {
    login(data);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Canteen Staff Sign In
        </h2>
        <p className="text-sm text-slate-500 mt-1.5">
          Please enter your canteen credentials to continue
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <FormError message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField label="Username" error={errors.username?.message} required>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="canteen.staff"
              disabled={isLoading}
              className="pl-11 pr-4 py-2.5 w-full rounded-lg bg-slate-50/50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008BE9]/20 focus:border-[#008BE9] transition-all"
              {...register('username')}
            />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={isLoading}
              className="pl-11 pr-11 py-2.5 w-full rounded-lg bg-slate-50/50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008BE9]/20 focus:border-[#008BE9] transition-all"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-[#002C6D] focus:outline-none transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </FormField>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #002C6D 0%, #008BE9 100%)',
          }}
          className="w-full py-3 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-3"
        >
          <span>Sign In</span>
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-500">
        Institute admin?{' '}
        <a href="/login" className="font-semibold text-[#002C6D] hover:text-[#008BE9] hover:underline">
          Sign in via the main portal
        </a>
      </p>
    </div>
  );
}
