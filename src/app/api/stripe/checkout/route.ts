
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Payment service is not configured yet." },
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the logged-in user
    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 }
      );
    }

    // Confirm that this job belongs to the logged-in employer
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, employer_id, is_featured")
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

    const stripe = new Stripe(stripeKey);

    // Fixed server-side test price: $5.00 USD
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Featured Job: ${job.title}`,
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      metadata: {
        job_id: job.id,
        employer_id: userData.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
    });

    // Save the pending payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        job_id: job.id,
        employer_id: userData.user.id,
        stripe_session_id: session.id,
        amount: 500,
        currency: "usd",
        status: "pending",
      });

    if (paymentError) {
      return NextResponse.json(
        { error: "Could not save the payment record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 }
    );
  }
}
