'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
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
      title="Create your Account"
      subtitle="Join NoteMaker and start organizing your knowledge base"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
