import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRole } from '@/contexts/RoleContext';
import { Navbar } from '@/components/layout/Navbar';

export default function Landing() {
  const { role } = useRole();
  const [, navigate] = useLocation();

  useEffect(() => {
    const t = setTimeout(() => {
      if (role === 'admin') navigate('/admin');
      else if (role === 'worker') navigate('/worker');
      else navigate('/my-issues');
    }, 400);
    return () => clearTimeout(t);
  }, [role, navigate]);

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 pt-4 md:pt-24">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 mt-12 md:mt-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center">
          <h1 className="text-3xl font-display font-bold">Nagrik Seva</h1>
          <p className="text-muted-foreground mt-2">Civic assistance for everyone.</p>
          <div className="mt-6 flex items-center justify-center">
            <div className="h-9 w-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground mt-4">Redirecting to your dashboard…</p>
        </div>
      </div>
    </div>
  );
}
