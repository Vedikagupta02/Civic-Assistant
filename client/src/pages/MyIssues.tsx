import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUserIssues, useSimulateFireStoreUpdate } from "@/hooks/use-firestore-issues";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPin, ArrowRight, RefreshCw, Calendar, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForum } from "@/hooks/use-forum";
import type { FirestoreIssue } from "@/lib/firestore";

export default function MyIssues() {
  const { user } = useAuth();
  const { data: issues, isLoading } = useUserIssues();
  const simulateUpdate = useSimulateFireStoreUpdate();
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'issues' | 'forum'>('issues');
  const latestArea = issues?.[0]?.location as string | undefined;
  const [forumArea, setForumArea] = useState<string | undefined>(latestArea);
  const { posts, createPost, addComment, upvote } = useForum(forumArea);
  const [newPost, setNewPost] = useState({ title: "", description: "", category: "Waste" });
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  // Sort by newest first
  const sortedIssues = (issues as FirestoreIssue[] | undefined)?.sort((a: FirestoreIssue, b: FirestoreIssue) => 
    b.createdAt.toMillis() - a.createdAt.toMillis()
  );

  const simulateDays = async () => {
    // This is a legacy function - we'll keep it for demo purposes
    setShowFollowUp(true);
  };

  // Show auth dialog if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 pt-4 md:pt-24">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-display mb-2">Sign In Required</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Please sign in to view and manage your civic complaints.
            </p>
            <Button onClick={() => setIsAuthDialogOpen(true)}>
              Sign In to Continue
            </Button>
          </div>
        </div>
        
        <AuthDialog 
          isOpen={isAuthDialogOpen} 
          onClose={() => setIsAuthDialogOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 pt-4 md:pt-24">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4">
        {showFollowUp && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 flex items-start gap-3 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Smart Follow-up Reminder</p>
              <p className="text-xs">One or more issues have remained unresolved for over 3 days. You may follow up with the municipal office directly.</p>
            </div>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="issues">My Issues</TabsTrigger>
            <TabsTrigger value="forum">Community Forum</TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            <div className="mb-8 mt-12 md:mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">My Issues</h1>
                <p className="text-muted-foreground mt-2">Track the progress of your civic complaints in real-time.</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={simulateDays}
                className="bg-white hover:bg-primary/5 border-primary/20 text-primary font-bold shadow-sm"
              >
                Simulate 3 Days Passed
              </Button>
            </div>

            {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : sortedIssues?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold font-display">No Issues Reported</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
              You haven't reported any civic issues yet. Use the chat to report your first issue.
            </p>
            <Button asChild>
              <a href="/">Go to Chat</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {sortedIssues?.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
                  <div className="h-2 w-full bg-gradient-to-r from-primary to-accent opacity-80" />
                  
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-primary/5 px-2.5 py-1 rounded-md text-xs font-bold text-primary uppercase tracking-wider">
                        {issue.category}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {issue.createdAt && formatDistanceToNow(issue.createdAt.toDate(), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-display font-semibold text-lg line-clamp-2 leading-tight">
                        {issue.description}
                      </h3>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                      <span className="truncate">{issue.location || 'Unknown Location'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Current Status</span>
                        <StatusBadge status={issue.status} />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Impact</span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-foreground">{issue.affectedCount} Citizens</span>
                          <span className="text-[10px] text-muted-foreground font-medium">Unresolved: {issue.daysUnresolved || 0} Days</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/20 p-4 flex justify-between items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs w-full hover:bg-white hover:text-primary transition-colors"
                      onClick={() => issue.id && simulateUpdate.mutate(issue.id)}
                      disabled={simulateUpdate.isPending || issue.status === "Resolved" || !issue.id}
                    >
                      {simulateUpdate.isPending ? (
                        <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                      )}
                      Simulate Update
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="forum">
            <div className="mt-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-display font-bold">Community Forum</h2>
                  <p className="text-muted-foreground text-sm">Area-based discussion of civic issues.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="border rounded-md px-2 py-1 text-sm bg-white"
                    placeholder="Area (e.g., MG Road)"
                    value={forumArea || ''}
                    onChange={(e) => setForumArea(e.target.value)}
                  />
                  <select
                    className="border rounded-md px-2 py-1 text-sm bg-white"
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  >
                    {['Waste','Water','Air','Roads','Noise','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Card className="bg-white border-border/60">
                <CardContent className="p-4 space-y-2">
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Describe the issue"
                    rows={3}
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  />
                  <div className="flex justify-end">
                    <Button
                      className="text-sm"
                      onClick={() => {
                        if (!forumArea) return;
                        if (!newPost.title.trim()) return;
                        createPost({ title: newPost.title, description: newPost.description, category: newPost.category, area: forumArea });
                        setNewPost({ title: "", description: "", category: newPost.category });
                      }}
                    >
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {posts.map((p) => (
                  <Card key={p.id} className="bg-white border-border/60">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold truncate">{p.title}</div>
                        <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{p.area} • {p.category}</div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">{p.description}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="text-xs" onClick={() => upvote(p.id)}>▲ Support ({p.upvotes || 0})</Button>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-semibold">Comments</div>
                        {(p.comments || []).map(c => (
                          <div key={c.id} className="text-xs bg-muted/30 rounded-md px-2 py-1">{c.text}</div>
                        ))}
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 border rounded-md px-2 py-1 text-xs bg-white"
                            placeholder="Add a comment"
                            value={commentText[p.id] || ''}
                            onChange={(e) => setCommentText({ ...commentText, [p.id]: e.target.value })}
                          />
                          <Button
                            className="text-xs"
                            onClick={() => {
                              const txt = (commentText[p.id] || '').trim();
                              if (!txt) return;
                              addComment(p.id, txt);
                              setCommentText({ ...commentText, [p.id]: '' });
                            }}
                          >
                            Comment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {posts.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-sm text-muted-foreground">No posts yet for this area.</CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </div>
  );
}
