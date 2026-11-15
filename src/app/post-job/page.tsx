
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function PostJobPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    category: "",
    job_type: "",
    salary: "",
    description: "",
    contact_email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMessage("Please sign in before posting a job.");
        router.push("/login");
        return;
      }

      // Save the job and retrieve its ID
      const { data: newJob, error } = await supabase
        .from("jobs")
        .insert({
          employer_id: user.id,
          title: form.title,
          company: form.company,
          location: form.location,
          category: form.category,
          job_type: form.job_type,
          salary: form.salary || null,
          description: form.description,
          contact_email: form.contact_email,
          status: "published",
          is_featured: false,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Trigger matching job alert emails
      let emailMessage = "";

      try {
        const response = await fetch("/api/job-alerts/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId: newJob.id }),
        });

        const result = await response.json();

        if (response.ok) {
          emailMessage = ` Email alerts: ${result.sent} sent, ${result.failed} failed.`;
        } else {
          emailMessage = " Job saved, but email notifications could not be sent.";
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        emailMessage = " Job saved, but email notifications could not be sent.";
      }

      setSuccess(true);
      setMessage(
        "Job posted successfully!" + emailMessage
      );

      setForm({
        title: "",
        company: "",
        location: "",
        category: "",
        job_type: "",
        salary: "",
        description: "",
        contact_email: "",
      });
    } catch (error) {
      console.error("Job submission error:", error);
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
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-2xl font-bold text-blue-700">
          JobBoard<span className="text-slate-900">Lite</span>
        </a>

        <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Post a Job
          </h1>

          <p className="mt-2 text-slate-500">
            Find the right candidate for your company.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-semibold">Job Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Company Name *</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                required
                placeholder="Your company name"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="Remote, Lahore, Islamabad..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border bg-white px-4 py-3"
              >
                <option value="">Select Category</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Writing">Writing</option>
                <option value="Data">Data</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">Job Type *</label>
              <select
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                required
                className="w-full rounded-lg border bg-white px-4 py-3"
              >
                <option value="">Select Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">Salary</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. PKR 50,000 - 80,000"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Job Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe the job responsibilities and requirements..."
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Contact Email *</label>
              <input
                type="email"
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                required
                placeholder="careers@company.com"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Posting Job..." : "Submit Job"}
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

          <a
            href="/jobs"
            className="mt-6 block text-center text-sm font-semibold text-blue-700 hover:underline"
          >
            Browse All Jobs
          </a>
        </div>
      </div>
    </main>
  );
}
