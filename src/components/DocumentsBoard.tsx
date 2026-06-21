"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { DOC_CATEGORIES, formatBytes, type DocRecord } from "@/lib/documents-shared";

/** Group docs into category sections, ordered by DOC_CATEGORIES then any extras. */
function groupByCategory(docs: DocRecord[]): [string, DocRecord[]][] {
  const groups = new Map<string, DocRecord[]>();
  for (const d of docs) {
    const k = d.category || "Other";
    const list = groups.get(k) ?? [];
    list.push(d);
    groups.set(k, list);
  }
  const extras = [...groups.keys()].filter((k) => !DOC_CATEGORIES.includes(k));
  return [...DOC_CATEGORIES, ...extras]
    .filter((k) => groups.has(k))
    .map((k) => [k, groups.get(k)!] as [string, DocRecord[]]);
}

export function DocumentsBoard({ docs }: { docs: DocRecord[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState(DOC_CATEGORIES[0]);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    setProgress(0);
    try {
      // 1) Stream the file straight to Blob (multipart for large files) — never
      //    touches the 4.5MB serverless body cap.
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/documents-upload",
        clientPayload: category,
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      // 2) Record the metadata row (tiny JSON POST, behind hub auth).
      const res = await fetch("/api/hub/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, category, url: blob.url, size: file.size }),
      });
      if (!res.ok) throw new Error("record failed");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      setErr("Upload failed. Try again.");
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    await fetch(`/api/hub/documents/${id}`, { method: "DELETE" }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  const field = "rounded-md border border-[var(--color-sand)] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]";
  const sections = groupByCategory(docs);

  return (
    <div className="space-y-8">
      <h1 className="display text-2xl text-[var(--color-anchor)]">Documents</h1>

      <form onSubmit={onUpload} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-sand)]/20 p-5">
        <input ref={fileRef} type="file" required className="text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
          {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink)] disabled:opacity-60">
          {busy ? (progress > 0 ? `Uploading… ${progress}%` : "Uploading…") : "Upload"}
        </button>
        {err && <span className="text-sm text-red-700">{err}</span>}
      </form>

      <p className="text-sm text-[var(--color-muted)]">Plans, renderings, brand assets, agreements, media — up to 2&nbsp;GB per file. Share with agents and buyers.</p>

      {sections.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No documents yet.</p>
      ) : (
        <div className="space-y-10">
          {sections.map(([cat, items]) => (
            <section key={cat} className="space-y-3">
              <div className="flex items-baseline gap-3 border-b border-[var(--color-anchor)]/20 pb-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-anchor)]">{cat}</h2>
                <span className="text-xs text-[var(--color-muted)]">{items.length}</span>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-sand)] text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    <th className="py-2 pr-4 font-medium">Document</th>
                    <th className="py-2 pr-4 font-medium">Size</th>
                    <th className="py-2 pr-4 font-medium">Uploaded</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d) => (
                    <tr key={d.id} className="border-b border-[var(--color-sand)]/50">
                      <td className="py-3 pr-4 font-medium">
                        <a href={d.url} target="_blank" rel="noreferrer" className="hover:text-[var(--color-anchor)] hover:underline">{d.name}</a>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-[var(--color-muted)]">{formatBytes(d.size)}</td>
                      <td className="whitespace-nowrap py-3 pr-4 text-[var(--color-muted)]">{new Date(d.uploadedAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => remove(d.id)} disabled={busy} className="text-xs text-[var(--color-muted)] hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
