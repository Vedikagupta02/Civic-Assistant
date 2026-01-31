import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, setupRecaptcha } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: any;
  lastLoginAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: any) => Promise<any>;
  verifyOtp: (verificationId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Save or update user profile in Firestore
  const saveUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const profileData: UserProfile = {
        uid: user.uid,
        email: user.email || undefined,
        phoneNumber: user.phoneNumber || undefined,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      // Remove undefined values to prevent Firestore errors
      const cleanedData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined)
      ) as UserProfile;

      await setDoc(userRef, cleanedData, { merge: true });
      return profileData;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      } else {
        // Create profile if it doesn't exist
        return await saveUserProfile(user);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await saveUserProfile(result.user);
      setUserProfile(profile);
      
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google",
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  // Phone Sign In
  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: any) => {
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmation;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      toast({
        title: "Phone Sign In Failed",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Verify OTP
  const verifyOtp = async (verificationId: string, otp: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      const profile = await saveUserProfile(result.user);
      setUserProfile(profile);
      
      toast({
        title: "Welcome!",
        description: "Successfully signed in with phone number",
      });
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const profile = await loadUserProfile(user);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    signInWithGoogle,
    signInWithPhone,
    verifyOtp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
