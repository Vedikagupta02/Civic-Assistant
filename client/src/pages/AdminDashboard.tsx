import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAllIssues, useUpdateFireStoreIssue } from "@/hooks/use-firestore-issues";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { FirestoreIssue } from "@/lib/firestore";

const WORKERS = [
  { id: "w1", name: "Worker A", phone: "9991110001" },
  { id: "w2", name: "Worker B", phone: "9991110002" },
  { id: "w3", name: "Worker C", phone: "9991110003" },
];

export default function AdminDashboard() {
  const { data: issues, isLoading } = useAllIssues();
  const updateIssue = useUpdateFireStoreIssue();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories: string[] = useMemo(() => {
    const list = (issues || []).map((i: FirestoreIssue) => i.category);
    return Array.from(new Set(list));
  }, [issues]);

  const filtered: FirestoreIssue[] = useMemo(() => {
    return (issues || []).filter((i: FirestoreIssue) => {
      const sOk = statusFilter === "all" || i.status === statusFilter;
      const cOk = categoryFilter === "all" || i.category === categoryFilter;
      return sOk && cOk;
    });
  }, [issues, statusFilter, categoryFilter]);

  const handleAssign = async (issueId: string, workerId: string) => {
    const w = WORKERS.find((x) => x.id === workerId);
    if (!w) return;
    await updateIssue.mutateAsync({
      id: issueId,
      data: { status: "In Progress", assignedWorkerId: w.id, assignedWorkerName: w.name },
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-24 md:pb-12 pt-4 md:pt-24">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 mt-12 md:mt-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Monitor and assign reported issues.</p>
          </div>
          <div className="flex gap-2">
            <select
              className="border rounded-md px-2 py-1 text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              className="border rounded-md px-2 py-1 text-sm bg-white"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <Card className="border-border/60 shadow-sm bg-white">
          <CardHeader>
            <div className="text-sm text-muted-foreground">All Reported Issues</div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Issue ID</th>
                      <th className="p-2">Issue description</th>
                      <th className="p-2">Location</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Assigned</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <tr key={i.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 align-top text-xs">{i.id}</td>
                        <td className="p-2 align-top max-w-sm">{i.description}</td>
                        <td className="p-2 align-top">{i.location}</td>
                        <td className="p-2 align-top">{i.category}</td>
                        <td className="p-2 align-top text-xs">{i.createdAt?.toDate?.().toLocaleDateString?.() || ''}</td>
                        <td className="p-2 align-top"><StatusBadge status={i.status} /></td>
                        <td className="p-2 align-top text-xs">{i.assignedWorkerName || '-'}</td>
                        <td className="p-2 align-top">
                          <div className="flex items-center gap-2">
                            <select className="border rounded-md px-2 py-1 text-xs bg-white" defaultValue="">
                              <option value="" disabled>Assign worker</option>
                              {WORKERS.map((w) => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                            </select>
                            <Button
                              className="text-xs"
                              onClick={(e) => {
                                const select = (e.currentTarget.previousSibling as HTMLSelectElement);
                                const val = select?.value;
                                if (i.id && val) handleAssign(i.id, val);
                              }}
                            >
                              Assign
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td className="p-4 text-center text-muted-foreground" colSpan={8}>No issues found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
