'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to edit and organize your study notes"
    >
      <LoginForm />
    </AuthLayout>
  );
}
