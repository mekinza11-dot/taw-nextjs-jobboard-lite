
"use client";

import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const testSupabase = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*");

    console.log("Supabase data:", data);
    console.log("Supabase error:", error);

    if (error) {
      alert("Connection error: " + error.message);
    } else {
      alert("Supabase connected successfully!");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-bold text-blue-700">
            JobBoard<span className="text-slate-900">Lite</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="/jobs" className="text-sm font-medium hover:text-blue-700">Find Jobs</a>
            <a href="/post-job" className="text-sm font-medium hover:text-blue-700">For Employers</a>
            <a href="/alerts" className="text-sm font-medium hover:text-blue-700">Job Alerts</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold hover:text-blue-700">Sign In</a>
            <a href="/post-job" className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
              Post a Job
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-950 to-blue-700 px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
            Your next opportunity starts here
          </span>

          <h1 className="mt-8 text-4xl font-extrabold leading-tight md:text-6xl">
            Find the job that
            <br />
            moves you forward.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Discover exciting opportunities, connect with great companies,
            and take the next step in your career.
          </p>

          <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 rounded-xl bg-white p-3 shadow-xl md:flex-row">
            <input
              type="text"
              placeholder="Job title or keyword"
              className="min-w-0 flex-1 rounded-lg px-4 py-3 text-slate-900 outline-none"
            />
            <input
              type="text"
              placeholder="Location"
              className="min-w-0 flex-1 rounded-lg px-4 py-3 text-slate-900 outline-none"
            />
            <a href="/jobs" className="rounded-lg bg-blue-700 px-8 py-3 font-semibold text-white hover:bg-blue-800">
              Search Jobs
            </a>
          </div>

          <p className="mt-5 text-sm text-blue-100">
            Popular: Developer, Designer, Marketing, Remote
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Explore Job Categories</h2>
          <p className="mt-3 text-slate-500">
            Find opportunities that match your interests.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["💻", "Technology"],
            ["📊", "Marketing"],
            ["🎨", "Design"],
            ["💼", "Business"],
          ].map(([icon, category]) => (
            <div key={category} className="rounded-xl border bg-white p-7 text-center transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-3 font-semibold">{category}</h3>
              <p className="mt-1 text-sm text-slate-500">Explore opportunities</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-semibold text-blue-700">CAREER OPPORTUNITIES</p>
              <h2 className="mt-2 text-3xl font-bold">Featured Jobs</h2>
              <p className="mt-3 text-slate-500">
                Handpicked opportunities to help you grow.
              </p>
            </div>
            <a href="/jobs" className="font-semibold text-blue-700 hover:underline">
              View all jobs →
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                company: "TechNova",
                role: "Frontend Developer",
                location: "Remote",
                type: "Full-time",
                salary: "$1,500 - $2,500",
                icon: "💻",
              },
              {
                company: "Creative Studio",
                role: "UI/UX Designer",
                location: "New York, USA",
                type: "Contract",
                salary: "$1,000 - $2,000",
                icon: "🎨",
              },
              {
                company: "Growth Labs",
                role: "Digital Marketing Specialist",
                location: "London, UK",
                type: "Full-time",
                salary: "$2,000 - $3,000",
                icon: "📈",
              },
            ].map((job) => (
              <article key={job.role} className="rounded-xl border border-slate-200 p-6 transition hover:border-blue-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                    {job.icon}
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Featured
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">{job.company}</p>
                <h3 className="mt-1 text-xl font-bold">{job.role}</h3>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-3 py-2">📍 {job.location}</span>
                  <span className="rounded-md bg-slate-100 px-3 py-2">{job.type}</span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t pt-5">
                  <div>
                    <p className="text-xs text-slate-500">Salary</p>
                    <p className="mt-1 font-semibold">{job.salary}</p>
                  </div>
                  <a href="/jobs" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                    Apply Now
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Employer Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl bg-blue-50 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold">Looking to hire great talent?</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Connect with qualified candidates and find the right people for your team.
          </p>
          <a href="/post-job" className="mt-7 inline-block rounded-lg bg-blue-700 px-7 py-3 font-semibold text-white hover:bg-blue-800">
            Post Your First Job
          </a>
        </div>
      </section>

      {/* Supabase Connection Test */}
      <section className="px-6 pb-12 text-center">
        <button
          onClick={testSupabase}
          className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
        >
          Test Supabase Connection
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 py-8 text-center text-sm text-slate-400">
        <p>© 2026 JobBoard Lite. All rights reserved.</p>
        <p className="mt-2">Connecting talent with opportunity.</p>
      </footer>
    </main>
  );
}
