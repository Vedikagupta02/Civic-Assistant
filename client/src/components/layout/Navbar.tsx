import { Link, useLocation } from "wouter";
import { Home, ListChecks, Map, AlertCircle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";

export function Navbar() {
  const [location] = useLocation();
  const { user, userProfile, logout } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Chat", icon: Home },
    { href: "/my-issues", label: "My Issues", icon: ListChecks },
    { href: "/area", label: "Area Overview", icon: Map },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/50 shadow-lg md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Desktop Logo */}
        <div className="hidden md:flex items-center gap-2 font-display text-xl font-bold text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          Nagrik Seva
        </div>

        {/* Navigation Links */}
        <div className="w-full md:w-auto flex items-center justify-around md:gap-8">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href}>
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer group md:flex-row md:gap-2 md:px-4 md:py-2",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("w-6 h-6 md:w-5 md:h-5 transition-transform", isActive && "scale-110")} />
                  <span className={cn("text-[10px] mt-1 font-medium md:text-sm md:mt-0")}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Authentication */}
        <div className="hidden md:flex items-center gap-2">
          {user && userProfile ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                {userProfile.photoURL ? (
                  <img 
                    src={userProfile.photoURL} 
                    alt={userProfile.displayName || 'User'} 
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {userProfile.displayName || userProfile.email || userProfile.phoneNumber}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setIsAuthDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Auth Button */}
      {!user && (
        <div className="md:hidden px-4 pb-2">
          <Button
            size="sm"
            onClick={() => setIsAuthDialogOpen(true)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Sign In
          </Button>
        </div>
      )}
      <div className="hidden md:block max-w-5xl mx-auto px-4 pb-2">
        <p className="text-[10px] text-muted-foreground text-center italic border-t border-border/30 pt-2">
          "We don't promise faster fixes. We promise that problems won't be silently ignored."
        </p>
      </div>
      
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </nav>
  );
}
