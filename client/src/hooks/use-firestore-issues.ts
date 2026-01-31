import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createIssue,
  getUserIssues,
  getAllIssues,
  getIssueById,
  updateIssue,
  addIssueUpdate,
  getIssuesByCategory,
  getIssuesByLocation,
  getIssuesStats,
  FirestoreIssue
} from "@/lib/firestore";

// Query keys
export const fireStoreKeys = {
  userIssues: (userId: string) => ['userIssues', userId] as const,
  allIssues: () => ['allIssues'] as const,
  issue: (id: string) => ['issue', id] as const,
  issuesByCategory: () => ['issuesByCategory'] as const,
  issuesByLocation: () => ['issuesByLocation'] as const,
  issuesStats: () => ['issuesStats'] as const,
};

// Hooks for user-specific issues
export function useUserIssues() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: fireStoreKeys.userIssues(user?.uid || ''),
    queryFn: () => {
      if (!user?.uid) return [];
      return getUserIssues(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

// Hook for all issues (public view)
export function useAllIssues() {
  return useQuery({
    queryKey: fireStoreKeys.allIssues(),
    queryFn: () => getAllIssues(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for single issue
export function useFireStoreIssue(id: string) {
  return useQuery({
    queryKey: fireStoreKeys.issue(id),
    queryFn: () => getIssueById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating issues
export function useCreateFireStoreIssue() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<FirestoreIssue, 'id' | 'createdAt' | 'daysUnresolved' | 'userId'>) => {
      if (!user?.uid) {
        throw new Error('User must be authenticated to create an issue');
      }
      
      const issueId = await createIssue({
        ...data,
        userId: user.uid,
      });
      
      return issueId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.userIssues(user?.uid || '') });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.allIssues() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesByCategory() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesByLocation() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesStats() });
      
      toast({
        title: "Issue Reported",
        description: "Your issue has been successfully submitted to the department.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to report issue",
        variant: "destructive",
      });
    },
  });
}

// Hook for updating issues
export function useUpdateFireStoreIssue() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FirestoreIssue> }) => {
      await updateIssue(id, data);
      return id;
    },
    onSuccess: (issueId) => {
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issue(issueId) });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.allIssues() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesByCategory() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesByLocation() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesStats() });
      
      toast({
        title: "Issue Updated",
        description: "Issue has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update issue",
        variant: "destructive",
      });
    },
  });
}

// Hook for adding issue updates (status changes)
export function useAddIssueUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: string; comment?: string }) => {
      await addIssueUpdate(id, status, comment);
      return id;
    },
    onSuccess: (issueId) => {
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issue(issueId) });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.allIssues() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesStats() });
      
      toast({
        title: "Status Updated",
        description: `Issue status changed to: ${status}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Status Update Failed",
        description: error.message || "Failed to update issue status",
        variant: "destructive",
      });
    },
  });
}

// Hooks for analytics (public data)
export function useIssuesByCategory() {
  return useQuery({
    queryKey: fireStoreKeys.issuesByCategory(),
    queryFn: getIssuesByCategory,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useIssuesByLocation() {
  return useQuery({
    queryKey: fireStoreKeys.issuesByLocation(),
    queryFn: getIssuesByLocation,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useIssuesStats() {
  return useQuery({
    queryKey: fireStoreKeys.issuesStats(),
    queryFn: getIssuesStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for simulating issue updates (for demo purposes)
export function useSimulateFireStoreUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (issueId: string) => {
      // Simulate status progression
      const statuses = ['Pending', 'In Progress', 'Resolved'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      await addIssueUpdate(issueId, randomStatus, 'System update');
      return { id: issueId, status: randomStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issue(data.id) });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.allIssues() });
      queryClient.invalidateQueries({ queryKey: fireStoreKeys.issuesStats() });
      
      toast({
        title: "Status Updated",
        description: `Issue status changed to: ${data.status}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to simulate update",
        variant: "destructive",
      });
    },
  });
}
