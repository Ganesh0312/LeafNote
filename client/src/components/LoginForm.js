'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/navigation';
import FormInput from './FormInput';
import { Mail, KeyRound, Loader } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export default function LoginForm() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await login(data.email, data.password);
    setLoading(false);

    if (res.success) {
      showToast('Logged in successfully!', 'success');
      router.push('/');
    } else {
      showToast(res.error || 'Invalid credentials', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Email Address"
        name="email"
        type="email"
        placeholder="name@example.com"
        register={register}
        error={errors.email}
        icon={Mail}
      />

      <FormInput
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        register={register}
        error={errors.password}
        icon={KeyRound}
      />

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between py-1 text-xs">
        <label className="flex items-center gap-2 text-zinc-400 select-none cursor-pointer">
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="rounded bg-zinc-950 border-zinc-800 text-indigo-650 focus:ring-0 focus:ring-offset-0 h-4 w-4"
          />
          <span>Remember me</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-650 py-3 text-sm font-semibold text-white hover:bg-indigo-600 shadow-md shadow-indigo-650/20 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader size={16} className="animate-spin" /> : 'Sign In'}
      </button>

      <div className="text-center text-xs text-zinc-500 mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer">
          Sign Up
        </Link>
      </div>
    </form>
  );
}
