"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

export default function EngineerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'engineer') {
      router.push('/');
      return;
    }
    
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!isAuthorized) return null; // Avoid flicker

  return (
    <div className="layout-engineer">
      <Navbar role="engineer" onLogout={handleLogout} />
      {children}
    </div>
  );
}
