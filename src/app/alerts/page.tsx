
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AlertsPage() {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const { error } = await supabase.from("job_alerts").insert([
        {
          email,
          category: category || null,
          keyword: keyword || null,
          is_active: true,
        },
      ]);

      if (error) {
        throw error;
      }

      setSuccess(true);
      setMessage(
        "Subscription saved successfully! You will be registered for matching job alerts."
      );

      setEmail("");
      setCategory("");
      setKeyword("");
    } catch (error) {
      console.error("Job alert error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-2xl">

        <a href="/" className="text-2xl font-bold text-blue-700">
          JobBoard<span className="text-slate-900">Lite</span>
        </a>

        <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">

          <h1 className="text-3xl font-bold text-slate-900">
            Job Alerts
          </h1>

          <p className="mt-3 text-slate-500">
            Subscribe to receive notifications about jobs that match
            your interests.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block font-semibold">
                Email Address *
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Preferred Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border bg-white px-4 py-3"
              >
                <option value="">All Categories</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Writing">Writing</option>
                <option value="Data">Data</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Job Keyword
              </label>

              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. React, Python, Designer"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Subscribing..." : "Subscribe to Job Alerts"}
            </button>

          </form>

          {message && (
            <div
              className={`mt-6 rounded-lg p-4 text-sm ${
                success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-400">
            You can unsubscribe from job alerts at any time.
          </p>

          <a
            href="/jobs"
            className="mt-6 block text-center text-sm font-semibold text-blue-700 hover:underline"
          >
            Browse Available Jobs
          </a>

        </div>
      </div>
    </main>
  );
}
