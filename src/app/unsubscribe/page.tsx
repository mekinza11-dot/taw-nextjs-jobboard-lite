
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing your request...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function handleUnsubscribe() {
      if (!token) {
        setMessage("Invalid unsubscribe link.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/job-alerts/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to unsubscribe.");
        }

        setSuccess(true);
        setMessage(result.message);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    handleUnsubscribe();
  }, [token]);

  let messageStyle = "bg-red-50 text-red-700";

  if (loading) {
    messageStyle = "bg-blue-50 text-blue-700";
  } else if (success) {
    messageStyle = "bg-green-50 text-green-700";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <a href="/" className="text-2xl font-bold text-blue-700">
          JobBoard<span className="text-slate-900">Lite</span>
        </a>

        <h1 className="mt-8 text-2xl font-bold text-slate-900">
          Unsubscribe from Job Alerts
        </h1>

        <p className={"mt-5 rounded-lg p-4 text-sm " + messageStyle}>
          {message}
        </p>

        <a
          href="/jobs"
          className="mt-8 inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Browse Jobs
        </a>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<p>Loading unsubscribe page...</p>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
