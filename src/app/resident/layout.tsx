"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'resident') {
      router.push('/');
      return;
    }
    
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!isAuthorized) return null;

  return (
    <div className="layout-resident">
      <Navbar role="resident" onLogout={handleLogout} />
      {children}
    </div>
  );
}
