
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  job_type: string;
  salary: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [checkoutJobId, setCheckoutJobId] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/login");
          return;
        }

        setUserEmail(user.email || "");

        const { data, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("employer_id", user.id)
          .order("created_at", { ascending: false });

        if (jobsError) {
          throw jobsError;
        }

        setJobs(data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  // Delete a job
  const handleDelete = async (jobId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId);

    if (error) {
      setError(error.message);
      return;
    }

    setJobs((currentJobs) =>
      currentJobs.filter((job) => job.id !== jobId)
    );
  };

  // Simulate a featured-job payment (demo mode only)
  const handleMakeFeatured = async (jobId: string) => {
    try {
      setError("");
      setCheckoutJobId(jobId);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/demo-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          accessToken: sessionData.session.access_token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Demo payment failed.");
      }

      alert(result.message);

      // Reload dashboard to show the featured job
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Demo payment failed. Please try again."
      );
      setCheckoutJobId(null);
    }
  };

  // Logout employer
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg text-slate-600">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="/" className="text-2xl font-bold text-blue-700">
            JobBoard<span className="text-slate-900">Lite</span>
          </a>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">
              {userEmail}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Employer Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage and monitor your job listings.
            </p>
          </div>

          <a
            href="/post-job"
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            + Post a New Job
          </a>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Jobs</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {jobs.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Published Jobs</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {jobs.filter((job) => job.status === "published").length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Featured Jobs</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-700">
              {jobs.filter((job) => job.is_featured).length}
            </h2>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">
            Your Job Listings
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Featured payment is currently simulated for demonstration.
            No real payment is processed.
          </p>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {jobs.length === 0 && !error ? (
            <div className="mt-5 rounded-xl border bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                No jobs posted yet
              </h3>

              <p className="mt-2 text-slate-500">
                Start by publishing your first job listing.
              </p>

              <a
                href="/post-job"
                className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
              >
                Post Your First Job
              </a>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {job.company} · {job.location}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span>{job.category}</span>
                    <span>•</span>
                    <span>{job.job_type}</span>

                    {job.salary && (
                      <>
                        <span>•</span>
                        <span>{job.salary}</span>
                      </>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </p>

                  {job.is_featured && (
                    <span className="mt-3 inline-block rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Featured Job
                    </span>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        router.push(`/edit-job/${job.id}`)
                      }
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                    >
                      Edit Job
                    </button>

                    <button
                      onClick={() => handleDelete(job.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete Job
                    </button>

                    {!job.is_featured && (
                      <button
                        onClick={() => handleMakeFeatured(job.id)}
                        disabled={checkoutJobId === job.id}
                        className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {checkoutJobId === job.id
                          ? "Processing Demo..."
                          : "Simulate Featured Payment (Demo)"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
