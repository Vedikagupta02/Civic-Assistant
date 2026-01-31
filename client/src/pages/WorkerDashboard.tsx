import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAllIssues, useAddIssueUpdate } from "@/hooks/use-firestore-issues";
import type { FirestoreIssue } from "@/lib/firestore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MapPin } from "lucide-react";

// Derive a mock workerId from email for demo
function getWorkerId(): string | null {
  const email = (window as any)._authEmail || null;
  try {
    const stored = localStorage.getItem("_authEmail");
    const e = email || stored || "";
    if (!e) return null;
    if (e.toLowerCase().includes("worker2")) return "w2";
    if (e.toLowerCase().includes("worker3")) return "w3";
    return "w1";
  } catch {
    return "w1";
  }
}

// Simulated geotagging persisted in localStorage so Admin can view movement
function setWorkerLocation(workerId: string, loc: { lat: number; lng: number }) {
  const key = "workerLocations";
  const data = JSON.parse(localStorage.getItem(key) || "{}");
  data[workerId] = { ...loc, ts: Date.now() };
  localStorage.setItem(key, JSON.stringify(data));
}

export default function WorkerDashboard() {
  const { data: issues } = useAllIssues();
  const addUpdate = useAddIssueUpdate();
  const workerId = getWorkerId();

  const assigned: FirestoreIssue[] = useMemo(() => {
    return (issues || []).filter((i: FirestoreIssue) => i.assignedWorkerId === workerId);
  }, [issues, workerId]);

  // Simulate live location moving slightly
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const base = { lat: 28.6139, lng: 77.2090 };
    setLocation(base);
    if (!workerId) return;
    setWorkerLocation(workerId, base);

    intervalRef.current = window.setInterval(() => {
      setLocation((prev) => {
        const next = {
          lat: (prev?.lat || base.lat) + (Math.random() - 0.5) * 0.0005,
          lng: (prev?.lng || base.lng) + (Math.random() - 0.5) * 0.0005,
        };
        setWorkerLocation(workerId, next);
        return next;
      });
    }, 4000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [workerId]);

  const markResolved = async (issueId: string) => {
    await addUpdate.mutateAsync({ id: issueId, status: "Resolved", comment: "Work completed" });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 pt-4 md:pt-24">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 mt-12 md:mt-0">
          <h1 className="text-3xl font-display font-bold text-foreground">Worker Dashboard</h1>
          <p className="text-muted-foreground mt-2">View and complete your assigned issues.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="text-sm text-muted-foreground">Live Location (Simulated)</div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>
                {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Locating..."}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {assigned.map((issue) => (
            <Card key={issue.id} className="bg-white border-border/60">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{issue.description}</div>
                  <div className="text-xs text-muted-foreground">{issue.location} • {issue.category}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={issue.status} />
                  {issue.status !== "Resolved" && (
                    <Button onClick={() => issue.id && markResolved(issue.id)} className="text-xs">Mark Resolved</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {assigned.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">No assigned issues.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
