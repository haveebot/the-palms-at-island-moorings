import { verifyUnsub } from "@/lib/unsubscribe";
import { updateContact } from "@/lib/contacts";
import { SITE } from "@/lib/site";

function page(title: string, msg: string, status = 200): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · ${SITE.shortName}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:#14201E;color:#F4F0E9;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:1.5rem}main{max-width:30rem;text-align:center}h1{font-weight:500;font-size:1.4rem;color:#B08A4F;margin-bottom:.6rem}p{line-height:1.5;opacity:.9}</style></head><body><main><h1>${title}</h1><p>${msg}</p></main></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const c = url.searchParams.get("c");
  const t = url.searchParams.get("t");
  const secret = process.env.HUB_SESSION_SECRET || "";
  if (c && t && secret && (await verifyUnsub(c, t, secret))) {
    await updateContact(c, { status: "do-not-contact" });
    return page("You're unsubscribed", `You won't receive further messages from ${SITE.name}. You can close this page.`);
  }
  return page("Link not valid", "This unsubscribe link is invalid or has expired.", 400);
}
