
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: "employer",
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        setMessage("Account created successfully! You are logged in.");
        window.location.href = "/post-job";
      } else {
        setMessage("Account created! Please check your email to confirm your account, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = "/post-job";
      }
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg">
        <a href="/" className="text-2xl font-bold text-blue-700">
          JobBoard<span className="text-slate-900">Lite</span>
        </a>

        <h1 className="mt-8 text-3xl font-bold">
          {isSignUp ? "Create Employer Account" : "Welcome Back"}
        </h1>

        <p className="mt-2 text-slate-500">
          {isSignUp
            ? "Create an account to start posting jobs."
            : "Sign in to manage your job listings."}
        </p>

        <form onSubmit={handleAuth} className="mt-8 space-y-5">
          {isSignUp && (
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
                placeholder="Your full name"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "New employer?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="font-semibold text-blue-700 hover:underline"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </p>

        <a href="/" className="mt-6 block text-center text-sm text-slate-500 hover:text-blue-700">
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
