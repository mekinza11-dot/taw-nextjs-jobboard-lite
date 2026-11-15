
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Demo payment is not configured." },
        { status: 503 }
      );
    }

    const { jobId, accessToken } = await request.json();

    if (!jobId || !accessToken) {
      return NextResponse.json(
        { error: "Job ID and login token are required." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !userData.user) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, is_featured")
      .eq("id", jobId)
      .eq("employer_id", userData.user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job not found or you do not own this job." },
        { status: 404 }
      );
    }

    if (job.is_featured) {
      return NextResponse.json(
        { error: "This job is already featured." },
        { status: 400 }
      );
    }

    // Record a clearly labelled simulated payment
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        job_id: job.id,
        employer_id: userData.user.id,
        stripe_session_id: `DEMO-${crypto.randomUUID()}`,
        amount: 500,
        currency: "usd",
        status: "demo_paid",
      });

    if (paymentError) {
      throw paymentError;
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({ is_featured: true })
      .eq("id", job.id)
      .eq("employer_id", userData.user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Demo payment successful. Job featured in demo mode.",
    });
  } catch (error) {
    console.error("Demo payment error:", error);

    return NextResponse.json(
      { error: "Demo payment failed. Please try again." },
      { status: 500 }
    );
  }
}
