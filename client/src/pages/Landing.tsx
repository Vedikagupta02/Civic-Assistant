import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';

export default function Landing() {
  const { user, isLoading } = useAuth();
  const { role } = useRole();
  const [, navigate] = useLocation();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (role === 'admin') navigate('/admin');
    else if (role === 'worker') navigate('/worker');
    else navigate('/assistant');
  }, [isLoading, user, role, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-muted/10 to-white">
      <div className="min-h-screen grid lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-12 lg:px-12 bg-primary text-primary-foreground">
          <div className="w-full max-w-xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <span className="font-display text-xl font-semibold">Nagrik Seva</span>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                Empowering Citizens,
                <br />
                Building Better Cities
              </h1>
              <p className="text-primary-foreground/90 text-base leading-relaxed">
                Nagrik Seva helps citizens report civic issues, track their resolution, and keep problems visible through community participation and transparent dashboards.
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold">
                Civic issues shouldn’t disappear. We make them visible.
              </h2>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                "AI-powered issue classification",
                "Real-time status tracking",
                "Direct channel to authorities",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-primary-foreground/90">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle2 size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            <Card className="border-border/60 shadow-lg bg-white">
              <CardContent className="p-7 text-center">
                <h3 className="text-xl font-semibold text-foreground">Welcome Back</h3>
                <p className="mt-2 text-sm text-muted-foreground">Sign in to start reporting issues</p>

                <div className="mt-6 grid gap-3">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => setIsAuthDialogOpen(true)}
                    disabled={isLoading}
                  >
                    Sign Up
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsAuthDialogOpen(true)}
                    disabled={isLoading}
                  >
                    Log In
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  After login, you’ll be redirected to the appropriate dashboard based on your role.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  );
}
