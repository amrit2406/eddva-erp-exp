import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../../../components/forms/FormField';
import FormError from '../../../components/forms/FormError';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';
import { useLogin } from '../hooks/useLogin';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { login, isLoading, error } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Email"
        error={errors.email?.message}
        required
      >
        <Input
          type="email"
          placeholder="admin@school.edu"
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Password"
        error={errors.password?.message}
        required
      >
        <Input
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
      </FormField>

      {error && <FormError message={error} />}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign In
      </Button>
    </form>
  );
}
