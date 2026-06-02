'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/navigation';
import FormInput from './FormInput';
import { Mail, KeyRound, User as UserIcon, Loader } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function RegisterForm() {
  const { register: signup } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await signup(data.username, data.email, data.password);
    setLoading(false);

    if (res.success) {
      showToast('Account created successfully!', 'success');
      router.push('/');
    } else {
      showToast(res.error || 'Registration failed', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Username"
        name="username"
        placeholder="john_doe"
        register={register}
        error={errors.username}
        icon={UserIcon}
      />

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

      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        register={register}
        error={errors.confirmPassword}
        icon={KeyRound}
      />

      {/* Terms & Conditions Checkbox */}
      <div className="space-y-1 py-1">
        <label className="flex items-start gap-2.5 text-xs text-zinc-400 select-none cursor-pointer">
          <input
            type="checkbox"
            {...register('terms')}
            className="rounded bg-zinc-950 border-zinc-800 text-indigo-650 focus:ring-0 focus:ring-offset-0 h-4 w-4 mt-0.5"
          />
          <span>I accept the Terms and Conditions</span>
        </label>
        {errors.terms && (
          <p className="text-[10px] text-red-400 font-semibold tracking-wide block mt-0.5">
            {errors.terms.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-650 py-3 text-sm font-semibold text-white hover:bg-indigo-600 shadow-md shadow-indigo-650/20 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader size={16} className="animate-spin" /> : 'Sign Up'}
      </button>

      <div className="text-center text-xs text-zinc-550 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer">
          Sign In
        </Link>
      </div>
    </form>
  );
}
