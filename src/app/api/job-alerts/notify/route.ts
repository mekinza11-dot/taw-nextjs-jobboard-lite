
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://taw-nextjs-jobboard-lite.vercel.app";
    if (!apiKey || !supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 }
      );
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(apiKey);

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, company, location, category, job_type, salary, description")
      .eq("id", jobId)
      .eq("status", "published")
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Published job not found." },
        { status: 404 }
      );
    }

    const { data: alerts, error: alertsError } = await supabase
      .from("job_alerts")
      .select("id, email, category, keyword, unsubscribe_token")
      .eq("is_active", true);

    if (alertsError) throw alertsError;

    const matches = (alerts || []).filter((alert) => {
      const categoryMatches =
        !alert.category ||
        alert.category.toLowerCase() === job.category.toLowerCase();

      const keywordMatches =
        !alert.keyword ||
        `${job.title} ${job.company} ${job.description}`
          .toLowerCase()
          .includes(alert.keyword.toLowerCase());

      return categoryMatches && keywordMatches;
    });

    const results = await Promise.all(
      matches.map(async (alert) => {
        const unsubscribeUrl =
          `${appUrl}/unsubscribe?token=${encodeURIComponent(alert.unsubscribe_token)}`;

        const { error } = await resend.emails.send({
          from: "JobBoardLite <onboarding@resend.dev>",
          to: [alert.email],
          subject: `New job matching your alert: ${job.title}`,
          html: `
            <h2>New job on JobBoardLite!</h2>
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Category:</strong> ${job.category}</p>
            <p><strong>Type:</strong> ${job.job_type}</p>
            <p><strong>Salary:</strong> ${job.salary || "Not specified"}</p>
            <p>${job.description}</p>
            <hr />
            <p>You received this email because you subscribed to JobBoardLite job alerts.</p>
            <p>
              <a href="${unsubscribeUrl}">Unsubscribe from job alerts</a>
            </p>
          `,
        });

        return { email: alert.email, success: !error };
      })
    );

    return NextResponse.json({
      success: true,
      matchingAlerts: matches.length,
      sent: results.filter((result) => result.success).length,
      failed: results.filter((result) => !result.success).length,
    });
  } catch (error) {
    console.error("Job alert email error:", error);

    return NextResponse.json(
      { error: "Could not send job alert emails." },
      { status: 500 }
    );
  }
}
