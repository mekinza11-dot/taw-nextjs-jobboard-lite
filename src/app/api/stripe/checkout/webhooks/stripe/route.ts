
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeKey);

  // Read the raw request body for Stripe signature verification
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true });
      }

      const jobId = session.metadata?.job_id;
      const employerId = session.metadata?.employer_id;

      if (!jobId || !employerId) {
        return NextResponse.json(
          { error: "Missing payment metadata." },
          { status: 400 }
        );
      }

      // Verify the payment record exists and belongs to this employer
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("id, job_id, employer_id, status")
        .eq("stripe_session_id", session.id)
        .eq("job_id", jobId)
        .eq("employer_id", employerId)
        .single();

      if (paymentError || !payment) {
        return NextResponse.json(
          { error: "Payment record not found." },
          { status: 404 }
        );
      }

      // Make webhook retries safe
      if (payment.status === "paid") {
        return NextResponse.json({ received: true });
      }

      // Confirm the job still belongs to this employer
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("id")
        .eq("id", jobId)
        .eq("employer_id", employerId)
        .single();

      if (jobError || !job) {
        return NextResponse.json(
          { error: "Matching job not found." },
          { status: 404 }
        );
      }

      const { error: updatePaymentError } = await supabase
        .from("payments")
        .update({ status: "paid" })
        .eq("id", payment.id)
        .eq("status", "pending");

      if (updatePaymentError) {
        throw updatePaymentError;
      }

      const { error: updateJobError } = await supabase
        .from("jobs")
        .update({ is_featured: true })
        .eq("id", jobId)
        .eq("employer_id", employerId);

      if (updateJobError) {
        // Return an error so Stripe can retry the webhook
        throw updateJobError;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
