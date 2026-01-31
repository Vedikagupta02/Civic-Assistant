import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Phone, ArrowRight } from 'lucide-react';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const { signInWithGoogle, signInWithPhone, verifyOtp } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) return;
    
    setIsLoading(true);
    try {
      // Initialize reCAPTCHA
      const recaptchaVerifier = (window as any).recaptchaVerifier;
      if (!recaptchaVerifier) {
        // Create invisible reCAPTCHA
        const container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
        
        const { setupRecaptcha } = await import('@/lib/firebase');
        (window as any).recaptchaVerifier = setupRecaptcha(container);
      }
      
      const confirmation = await signInWithPhone(
        `+91${phoneNumber}`, // Assuming Indian numbers
        (window as any).recaptchaVerifier
      );
      
      setVerificationId(confirmation.verificationId);
      setShowOtpInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationId || !otp) return;
    
    setIsLoading(true);
    try {
      await verifyOtp(verificationId, otp);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!authMethod) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">Welcome to Nagrik Seva</CardTitle>
          <CardDescription>
            Sign in to track your civic complaints and get updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleGoogleSignIn()}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button
            onClick={() => setAuthMethod('phone')}
            className="w-full"
            variant="outline"
          >
            <Phone className="mr-2 h-4 w-4" />
            Continue with Phone Number
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (authMethod === 'phone' && !showOtpInput) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-display">Phone Sign In</CardTitle>
          <CardDescription>
            Enter your phone number to receive a verification code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="rounded-l-none"
                maxLength={10}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAuthMethod(null)}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handlePhoneSignIn}
              disabled={isLoading || phoneNumber.length !== 10}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Send Code
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authMethod === 'phone' && showOtpInput) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-display">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to +91 {phoneNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowOtpInput(false);
                setOtp('');
              }}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Verify
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
