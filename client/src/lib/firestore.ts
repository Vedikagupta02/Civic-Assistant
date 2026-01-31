import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types for Firestore documents
export interface FirestoreIssue {
  id?: string;
  userId: string;
  description: string;
  category: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  affectedCount: number;
  daysUnresolved: number;
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  updates: IssueUpdate[];
  lat?: number;
  lng?: number;
  // Assignment (optional)
  assignedWorkerId?: string;
  assignedWorkerName?: string;
}

export interface IssueUpdate {
  status: string;
  date: string;
  comment?: string;
}

export interface FirestoreUser {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// Issues collection reference
const issuesCollection = collection(db, 'issues');
const usersCollection = collection(db, 'users');

// Issue CRUD operations
export const createIssue = async (issueData: Omit<FirestoreIssue, 'id' | 'createdAt' | 'daysUnresolved'>) => {
  try {
    const docRef = await addDoc(issuesCollection, {
      ...issueData,
      createdAt: serverTimestamp(),
      daysUnresolved: 0,
      updates: [{
        status: 'Pending',
        date: new Date().toISOString(),
        comment: 'Issue reported'
      }]
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
};

export const getUserIssues = async (userId: string) => {
  try {
    const q = query(
      issuesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }

    const issues = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreIssue[];
    
    return issues;
  } catch (error: any) {
    console.error('Error fetching user issues:', error);
    throw error;
  }
};

export const getAllIssues = async (limitCount?: number) => {
  try {
    const q = query(
      issuesCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount || 100)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreIssue[];
  } catch (error) {
    console.error('Error fetching all issues:', error);
    throw error;
  }
};

export const getIssueById = async (issueId: string) => {
  try {
    const docRef = doc(db, 'issues', issueId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as FirestoreIssue;
    } else {
      throw new Error('Issue not found');
    }
  } catch (error) {
    console.error('Error fetching issue:', error);
    throw error;
  }
};

export const updateIssue = async (issueId: string, updateData: Partial<FirestoreIssue>) => {
  try {
    const docRef = doc(db, 'issues', issueId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    throw error;
  }
};

export const addIssueUpdate = async (issueId: string, status: string, comment?: string) => {
  try {
    const docRef = doc(db, 'issues', issueId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const issue = docSnap.data() as FirestoreIssue;
      const newUpdate: IssueUpdate = {
        status,
        date: new Date().toISOString(),
        comment
      };
      
      await updateDoc(docRef, {
        status,
        updates: [...issue.updates, newUpdate],
        updatedAt: serverTimestamp(),
        ...(status === 'Resolved' && { resolvedAt: serverTimestamp() })
      });
    }
  } catch (error) {
    console.error('Error adding issue update:', error);
    throw error;
  }
};

// User operations
export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreUser;
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updateData: Partial<FirestoreUser>) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Analytics functions for public views
export const getIssuesByCategory = async () => {
  try {
    const querySnapshot = await getDocs(issuesCollection);
    const issues = querySnapshot.docs.map(doc => doc.data() as FirestoreIssue);
    
    const categoryCount: Record<string, number> = {};
    issues.forEach(issue => {
      categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
    });
    
    return categoryCount;
  } catch (error) {
    console.error('Error fetching issues by category:', error);
    throw error;
  }
};

export const getIssuesByLocation = async () => {
  try {
    const querySnapshot = await getDocs(issuesCollection);
    const issues = querySnapshot.docs.map(doc => doc.data() as FirestoreIssue);
    
    const locationCount: Record<string, number> = {};
    issues.forEach(issue => {
      locationCount[issue.location] = (locationCount[issue.location] || 0) + 1;
    });
    
    return locationCount;
  } catch (error) {
    console.error('Error fetching issues by location:', error);
    throw error;
  }
};

export const getIssuesStats = async () => {
  try {
    const querySnapshot = await getDocs(issuesCollection);
    const issues = querySnapshot.docs.map(doc => doc.data() as FirestoreIssue);
    
    const stats = {
      total: issues.length,
      pending: issues.filter(i => i.status === 'Pending').length,
      inProgress: issues.filter(i => i.status === 'In Progress').length,
      resolved: issues.filter(i => i.status === 'Resolved').length,
      rejected: issues.filter(i => i.status === 'Rejected').length,
      avgResolutionTime: 0,
      totalAffected: issues.reduce((sum, i) => sum + i.affectedCount, 0)
    };
    
    // Calculate average resolution time
    const resolvedIssues = issues.filter(i => i.status === 'Resolved' && i.resolvedAt);
    if (resolvedIssues.length > 0) {
      const totalResolutionTime = resolvedIssues.reduce((sum, issue) => {
        const resolutionTime = issue.resolvedAt!.toMillis() - issue.createdAt.toMillis();
        return sum + resolutionTime;
      }, 0);
      stats.avgResolutionTime = totalResolutionTime / resolvedIssues.length / (1000 * 60 * 60 * 24); // Convert to days
    }
    
    return stats;
  } catch (error) {
    console.error('Error fetching issues stats:', error);
    throw error;
  }
};
