
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  job_type: string;
  salary: string | null;
  description: string;
  is_featured: boolean;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [jobType, setJobType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  const categories = [
    "All",
    "Development",
    "Design",
    "Marketing",
    "Writing",
    "Data",
    "Business",
  ];

  const jobTypes = [
    "All",
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchMatch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());

      const categoryMatch =
        category === "All" || job.category === category;

      const typeMatch =
        jobType === "All" || job.job_type === jobType;

      return searchMatch && categoryMatch && typeMatch;
    });
  }, [jobs, search, category, jobType]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setJobType("All");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-2xl font-bold text-blue-700">
            JobBoard<span className="text-slate-900">Lite</span>
          </a>

          <div className="flex gap-5 text-sm font-medium">
            <a href="/" className="hover:text-blue-700">Home</a>
            <a href="/post-job" className="hover:text-blue-700">Post a Job</a>
            <a href="/alerts" className="hover:text-blue-700">Job Alerts</a>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-r from-blue-950 to-blue-700 px-6 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold">Find Your Next Job</h1>
        <p className="mt-4 text-blue-100">
          Discover opportunities that match your skills and career goals.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company or location"
              className="rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border px-4 py-3"
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="rounded-lg border px-4 py-3"
            >
              {jobTypes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex justify-between">
            <p className="text-sm text-slate-500">
              {filteredJobs.length} jobs found
            </p>
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-blue-700 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading && (
          <p className="py-16 text-center text-slate-500">
            Loading jobs...
          </p>
        )}

        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            Could not load jobs: {error}
          </div>
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold">No jobs found</h2>
            <p className="mt-3 text-slate-500">
              Try changing your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-blue-700 px-5 py-3 text-white"
            >
              Clear Filters
            </button>
          </div>
        )}

        {!loading && !error && filteredJobs.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <article
                key={job.id}
                className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                    {job.category}
                  </span>

                  {job.is_featured && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      Featured
                    </span>
                  )}
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  {job.company}
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {job.title}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>📍 {job.location}</p>
                  <p>💼 {job.job_type}</p>
                  <p>💰 {job.salary || "Salary not specified"}</p>
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-slate-500">
                  {job.description}
                </p>

                <a
                  href={`mailto:?subject=${encodeURIComponent(`Application for ${job.title}`)}&body=${encodeURIComponent(`I am interested in the ${job.title} position at ${job.company}.`)}`}
                  className="mt-6 block rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Apply Now
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="bg-slate-950 px-6 py-8 text-center text-sm text-slate-400">
        © 2026 JobBoard Lite. All rights reserved.
      </footer>
    </main>
  );
}
