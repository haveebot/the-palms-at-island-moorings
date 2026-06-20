import { NextResponse } from "next/server";
import { validateRegisterInterest } from "@/lib/leads-shared";
import { persistRegisterInterest } from "@/lib/leads";
import { notifyNewLead } from "@/lib/notify";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = validateRegisterInterest(body as Record<string, string>);

  if (!result.ok) {
    // Honeypot tripped → pretend success so bots get no signal.
    if (result.error === "spam") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const saved = await persistRegisterInterest(result.value);
    // Best-effort alert (no-op until a sender is configured) — never block the response.
    await notifyNewLead({ id: saved.id, ...result.value }).catch(() => {});
    return NextResponse.json({ ok: true, id: saved.id }, { status: 200 });
  } catch (err) {
    console.error("[palms] register-interest persist failed", err);
    return NextResponse.json(
      { error: "We couldn't save that just now. Please try again." },
      { status: 500 },
    );
  }
}
