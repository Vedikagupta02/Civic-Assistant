import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type ForumCategory = 'Waste' | 'Water' | 'Air' | 'Roads' | 'Noise' | 'Other';

export interface ForumPost {
  id: string;
  userId: string;
  area: string;
  category: ForumCategory | string;
  title: string;
  description: string;
  upvotes: number;
  createdAt: number;
  comments?: Array<{ id: string; userId: string; text: string; createdAt: number }>
}

const STORAGE_KEY = 'forumPosts';

function readAll(): ForumPost[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(posts: ForumPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function useForum(area: string | undefined) {
  const { user } = useAuth();
  const all = useMemo(() => readAll(), []);

  const posts = useMemo(() => {
    if (!area) return all;
    return all.filter((p) => p.area === area).sort((a, b) => b.createdAt - a.createdAt);
  }, [all, area]);

  const createPost = useCallback((data: Omit<ForumPost, 'id' | 'userId' | 'createdAt' | 'upvotes' | 'comments'>) => {
    if (!user?.uid) throw new Error('Must be signed in');
    const fresh = readAll();
    const post: ForumPost = {
      id: crypto.randomUUID(),
      userId: user.uid,
      upvotes: 0,
      createdAt: Date.now(),
      comments: [],
      ...data,
    };
    fresh.push(post);
    writeAll(fresh);
    return post.id;
  }, [user?.uid]);

  const addComment = useCallback((postId: string, text: string) => {
    if (!user?.uid) throw new Error('Must be signed in');
    const fresh = readAll();
    const p = fresh.find((x) => x.id === postId);
    if (!p) return;
    p.comments = p.comments || [];
    p.comments.push({ id: crypto.randomUUID(), userId: user.uid, text, createdAt: Date.now() });
    writeAll(fresh);
  }, [user?.uid]);

  const upvote = useCallback((postId: string) => {
    const fresh = readAll();
    const p = fresh.find((x) => x.id === postId);
    if (!p) return;
    p.upvotes = (p.upvotes || 0) + 1;
    writeAll(fresh);
  }, []);

  return { posts, createPost, addComment, upvote };
}
