"use client";

import { createContext, useContext, useId, useRef, useState } from "react";

export type Obj = Record<string, unknown>;

type Base = { k: string; label: string; help?: string; required?: boolean };
export type Field =
  | (Base & { type: "text" | "number" | "url" | "date"; placeholder?: string })
  | (Base & { type: "textarea"; rows?: number; placeholder?: string })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "image"; folder: string })
  | (Base & { type: "images"; folder: string })
  | (Base & { type: "strings"; add?: string })
  | (Base & { type: "paragraphs"; rows?: number })
  | (Base & { type: "group"; fields: Field[] })
  | (Base & { type: "list"; fields: Field[]; add: string; title: (item: Obj, i: number) => string; make: () => Obj });

/** Services the forms need from the admin shell. */
export type AdminTools = {
  preview: (path: string) => string;
  upload: (file: File, folder: string) => Promise<string>;
};
export const ToolsContext = createContext<AdminTools | null>(null);
export const useTools = () => {
  const t = useContext(ToolsContext);
  if (!t) throw new Error("ToolsContext missing");
  return t;
};

export const inputCls =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[15px] text-[#1f2421] outline-none transition focus:border-[#d0181f] focus:ring-2 focus:ring-[#d0181f]/15";
export const btn = {
  base: "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
  primary: "bg-[#d0181f] text-white hover:bg-[#a8131a]",
  dark: "bg-[#1f2421] text-white hover:bg-black",
  ghost: "border border-black/15 bg-white text-[#1f2421] hover:bg-black/5",
  danger: "border border-[#d0181f]/30 bg-white text-[#a8131a] hover:bg-[#d0181f]/10",
  icon: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-white text-sm hover:bg-black/5 disabled:opacity-30",
};

function Label({ id, f, children }: { id?: string; f: Base; children?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#1f2421]">
        {f.label}
        {f.required && <span className="text-[#d0181f]"> *</span>}
      </label>
      {children}
    </div>
  );
}
const Help = ({ text }: { text?: string }) => (text ? <p className="mt-1 text-xs text-black/55">{text}</p> : null);

const move = <T,>(arr: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const a = arr.slice();
  [a[i], a[j]] = [a[j], a[i]];
  return a;
};

export function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  return (
    <div className="grid gap-5">
      {fields.map((f) => (
        <FieldView key={f.k} f={f} value={value?.[f.k]} onChange={(v) => onChange({ ...value, [f.k]: v })} />
      ))}
    </div>
  );
}

function FieldView({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  switch (f.type) {
    case "text":
    case "url":
    case "date":
    case "number":
      return (
        <div>
          <Label id={id} f={f} />
          <input
            id={id}
            type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text"}
            className={inputCls}
            value={value == null ? "" : String(value)}
            placeholder={f.placeholder}
            onChange={(e) => onChange(f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
          />
          <Help text={f.help} />
        </div>
      );
    case "textarea":
      return (
        <div>
          <Label id={id} f={f} />
          <textarea id={id} rows={f.rows ?? 4} className={`${inputCls} resize-y leading-relaxed`} value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
          <Help text={f.help} />
        </div>
      );
    case "paragraphs":
      return (
        <div>
          <Label id={id} f={f} />
          <textarea
            id={id}
            rows={f.rows ?? 7}
            className={`${inputCls} resize-y leading-relaxed`}
            defaultValue={((value as string[]) ?? []).join("\n\n")}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
              )
            }
          />
          <Help text={f.help ?? "Leave an empty line between paragraphs."} />
        </div>
      );
    case "select":
      return (
        <div>
          <Label id={id} f={f} />
          <select id={id} className={inputCls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Help text={f.help} />
        </div>
      );
    case "strings":
      return <StringsField f={f} value={(value as string[]) ?? []} onChange={onChange} />;
    case "image":
      return <ImageField f={f} value={String(value ?? "")} onChange={onChange} />;
    case "images":
      return <ImagesField f={f} value={(value as string[]) ?? []} onChange={onChange} />;
    case "group":
      return (
        <fieldset className="rounded-xl border border-black/10 bg-black/[0.015] p-4">
          <legend className="px-1 text-[13px] font-semibold">{f.label}</legend>
          <Help text={f.help} />
          <div className="mt-2">
            <Fields fields={f.fields} value={(value as Obj) ?? {}} onChange={onChange} />
          </div>
        </fieldset>
      );
    case "list":
      return <ListField f={f} value={(value as Obj[]) ?? []} onChange={onChange} />;
  }
}

function StringsField({ f, value, onChange }: { f: Extract<Field, { type: "strings" }>; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <Label f={f} />
      <div className="grid gap-2">
        {value.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input aria-label={`${f.label} ${i + 1}`} className={inputCls} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" className={btn.icon} onClick={() => onChange(move(value, i, -1))} disabled={i === 0} aria-label="Move up">
              ↑
            </button>
            <button type="button" className={btn.icon} onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1} aria-label="Move down">
              ↓
            </button>
            <button type="button" className={btn.icon} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove">
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={`${btn.base} ${btn.ghost} mt-2`} onClick={() => onChange([...value, ""])}>
        + {f.add ?? "Add"}
      </button>
      <Help text={f.help} />
    </div>
  );
}

function useUploader(folder: string) {
  const { upload } = useTools();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const run = async (files: File[]) => {
    setBusy(true);
    setErr("");
    const out: string[] = [];
    try {
      for (const f of files) out.push(await upload(f, folder));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
    setBusy(false);
    return out;
  };
  return { busy, err, run };
}

export function ImageField({ f, value, onChange }: { f: Base & { folder: string }; value: string; onChange: (v: string) => void }) {
  const { preview } = useTools();
  const input = useRef<HTMLInputElement>(null);
  const { busy, err, run } = useUploader(f.folder);
  return (
    <div>
      <Label f={f} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-black/5">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-black/50">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" className={`${btn.base} ${btn.ghost}`} disabled={busy} onClick={() => input.current?.click()}>
            {busy ? "Processing…" : value ? "Replace image" : "Upload image"}
          </button>
          {value && !f.required && (
            <button type="button" className={`${btn.base} ${btn.danger}`} onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const [path] = await run([file]);
            if (path) onChange(path);
          }}
        />
      </div>
      {err && <p className="mt-2 text-sm text-[#a8131a]">{err}</p>}
      <Help text={f.help} />
    </div>
  );
}

function ImagesField({ f, value, onChange }: { f: Extract<Field, { type: "images" }>; value: string[]; onChange: (v: string[]) => void }) {
  const { preview } = useTools();
  const input = useRef<HTMLInputElement>(null);
  const { busy, err, run } = useUploader(f.folder);
  return (
    <div>
      <Label f={f} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((src, i) => (
          <li key={src + i} className="overflow-hidden rounded-lg border border-black/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview(src)} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="flex items-center justify-between gap-1 p-1.5">
              <button type="button" className={btn.icon} onClick={() => onChange(move(value, i, -1))} disabled={i === 0} aria-label="Move left">
                ←
              </button>
              <button type="button" className={btn.icon} onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1} aria-label="Move right">
                →
              </button>
              <button type="button" className={btn.icon} onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove image">
                ✕
              </button>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-black/20 text-sm text-black/60 hover:border-[#d0181f] hover:text-[#d0181f]"
          >
            <span className="text-2xl leading-none">+</span>
            {busy ? "Processing…" : "Add images"}
          </button>
        </li>
      </ul>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (!files.length) return;
          const paths = await run(files);
          if (paths.length) onChange([...value, ...paths]);
        }}
      />
      {err && <p className="mt-2 text-sm text-[#a8131a]">{err}</p>}
      <Help text={f.help ?? "You can select several photos at once. Use the arrows to change the order."} />
    </div>
  );
}

function ListField({ f, value, onChange }: { f: Extract<Field, { type: "list" }>; value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <Label f={f} />
      <div className="grid gap-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-xl border border-black/10 bg-white">
            <div className="flex items-center gap-2 p-2 pl-3">
              <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-medium" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span className="mr-2 inline-block w-4 text-black/40">{open === i ? "▾" : "▸"}</span>
                {f.title(item, i) || <span className="text-black/40">(empty)</span>}
              </button>
              <button type="button" className={btn.icon} onClick={() => onChange(move(value, i, -1))} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button type="button" className={btn.icon} onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1} aria-label="Move down">
                ↓
              </button>
              <button
                type="button"
                className={btn.icon}
                aria-label="Remove"
                onClick={() => {
                  if (confirm(`Remove "${f.title(item, i) || "this item"}"?`)) {
                    onChange(value.filter((_, j) => j !== i));
                    setOpen(null);
                  }
                }}
              >
                ✕
              </button>
            </div>
            {open === i && (
              <div className="border-t border-black/10 p-4">
                <Fields fields={f.fields} value={item} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className={`${btn.base} ${btn.ghost} mt-2`}
        onClick={() => {
          onChange([...value, f.make()]);
          setOpen(value.length);
        }}
      >
        + {f.add}
      </button>
      <Help text={f.help} />
    </div>
  );
}
