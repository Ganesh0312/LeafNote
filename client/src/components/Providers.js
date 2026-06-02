'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { NoteProvider } from '../context/NoteContext';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from '../context/ToastContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <NoteProvider>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </NoteProvider>
    </AuthProvider>
  );
}
