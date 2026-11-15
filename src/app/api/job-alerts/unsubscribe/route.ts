
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Unsubscribe service is not configured." },
        { status: 503 }
      );
    }

    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid unsubscribe link." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: subscription, error: findError } = await supabase
      .from("job_alerts")
      .select("id, is_active")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (findError) throw findError;

    if (!subscription) {
      return NextResponse.json(
        { error: "Invalid unsubscribe link." },
        { status: 404 }
      );
    }

    if (subscription.is_active) {
      const { error: updateError } = await supabase
        .from("job_alerts")
        .update({ is_active: false })
        .eq("id", subscription.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "You have successfully unsubscribed from JobBoardLite job alerts.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);

    return NextResponse.json(
      { error: "Unable to unsubscribe. Please try again." },
      { status: 500 }
    );
  }
}
