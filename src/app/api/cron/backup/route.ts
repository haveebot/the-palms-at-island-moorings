import { NextResponse } from "next/server";
import { backupAll } from "@/lib/backup";

// Vercel Cron hits this daily. Vercel auto-sends Authorization: Bearer <CRON_SECRET>
// when CRON_SECRET is set in the project env. Not under /api/hub, so the session
// proxy doesn't gate it — this route gates itself on the secret.
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const result = await backupAll();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[palms] backup failed", err);
    return NextResponse.json({ error: "Backup failed." }, { status: 500 });
  }
}
