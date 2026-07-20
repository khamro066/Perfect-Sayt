"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/lib/toast-context";

interface Category {
  id: string;
  name: string;
  image: string | null;
  productCount: number;
}

async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) return null;
  return data.url as string;
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editImageRemoved, setEditImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function refetch() {
    fetch("/api/admin/categories").then((res) => res.json()).then(setCategories);
  }

  useEffect(refetch, []);

  function pickFile(file: File | undefined, setFile: (f: File) => void, setPreview: (u: string) => void) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Faqat JPG, PNG yoki WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Fayl hajmi 5MB dan katta");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submitAdd() {
    if (!newName.trim()) return showToast("Kategoriya nomini kiriting");
    setAdding(true);
    try {
      let image: string | null = null;
      if (newImageFile) {
        image = await uploadImage(newImageFile);
        if (!image) {
          showToast("Rasm yuklanmadi (kamida 600×600px bo'lishi kerak)");
          return;
        }
      }
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, image }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error);
      setNewName("");
      setNewImageFile(null);
      setNewImagePreview(null);
      showToast("Kategoriya qo'shildi");
      refetch();
    } finally {
      setAdding(false);
    }
  }

  async function submitRename(id: string) {
    setSaving(true);
    try {
      let image: string | null | undefined = undefined;
      if (editImageFile) {
        image = await uploadImage(editImageFile);
        if (!image) {
          showToast("Rasm yuklanmadi (kamida 600×600px bo'lishi kerak)");
          return;
        }
      } else if (editImageRemoved) {
        image = null;
      }
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editValue, ...(image !== undefined ? { image } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error);
      setEditing(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      setEditImageRemoved(false);
      showToast("Kategoriya yangilandi");
      refetch();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeleteTarget(null);
    if (!res.ok) {
      showToast(data.error ?? "Xatolik yuz berdi");
    } else {
      showToast("Kategoriya o'chirildi");
      refetch();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Yangi kategoriya qo&apos;shish</h2>
        <div className="mt-3.5 flex flex-wrap items-start gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Kategoriya nomi (masalan: Sandal)"
            className="min-w-[220px] flex-1 rounded-[10px] border border-line bg-bg px-3.5 py-3 text-sm outline-none"
          />
          <label className="flex h-[46px] cursor-pointer items-center gap-2 rounded-[10px] border border-dashed border-line bg-bg px-3.5 text-[13px] font-semibold text-ink">
            {newImagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- transient blob: object URL from local file input, next/image can't optimize these
              <img src={newImagePreview} alt="" className="h-7 w-7 rounded-[6px] object-cover" />
            ) : (
              <ImagePlus size={16} />
            )}
            {newImagePreview ? "Rasm tanlandi" : "Rasm (ixtiyoriy)"}
            <input
              ref={newFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0], setNewImageFile, setNewImagePreview)}
            />
          </label>
          <button
            onClick={submitAdd}
            disabled={adding}
            className="whitespace-nowrap rounded-[10px] bg-accent px-5.5 py-3 text-sm font-bold text-accent-ink disabled:opacity-60"
          >
            {adding ? "Yuklanmoqda…" : "+ Qo'shish"}
          </button>
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Mavjud kategoriyalar</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
          {categories.map((c) => {
            const isEditing = editing === c.id;
            const editPreview = editImageFile ? editImagePreview : editImageRemoved ? null : c.image;
            return (
              <div key={c.id} className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-bg p-4">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      {editPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element -- mixes blob: preview URLs and stored /uploads paths, next/image can't optimize either reliably here
                        <img src={editPreview} alt="" className="h-11 w-11 rounded-[8px] object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-surface-2 text-muted">
                          <ImagePlus size={16} />
                        </div>
                      )}
                      <div className="flex flex-1 gap-1.5">
                        <label className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[8px] border border-line bg-surface text-[11.5px] font-semibold text-ink">
                          Rasm
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              setEditImageRemoved(false);
                              pickFile(e.target.files?.[0], setEditImageFile, setEditImagePreview);
                            }}
                          />
                        </label>
                        {editPreview && (
                          <button
                            onClick={() => { setEditImageFile(null); setEditImagePreview(null); setEditImageRemoved(true); }}
                            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-line text-muted"
                            aria-label="Rasmni o'chirish"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="rounded-[10px] border border-accent bg-surface px-3 py-2 text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitRename(c.id)}
                        disabled={saving}
                        className="flex-1 rounded-[8px] bg-accent py-2 text-xs font-bold text-accent-ink disabled:opacity-60"
                      >
                        {saving ? "Saqlanmoqda…" : "Saqlash"}
                      </button>
                      <button
                        onClick={() => { setEditing(null); setEditImageFile(null); setEditImagePreview(null); setEditImageRemoved(false); }}
                        className="flex-1 rounded-[8px] border border-line py-2 text-xs font-semibold text-ink"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail, not worth next/image's sizing overhead
                        <img src={c.image} alt="" className="h-11 w-11 rounded-[8px] object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-surface-2 text-muted">
                          <ImagePlus size={16} />
                        </div>
                      )}
                      <div className="flex flex-1 items-center justify-between">
                        <span className="text-[14.5px] font-bold text-ink">{c.name}</span>
                        <span className="text-xs text-muted">{c.productCount} mahsulot</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(c.id); setEditValue(c.name); setEditImageFile(null); setEditImagePreview(null); setEditImageRemoved(false); }}
                        className="flex-1 rounded-[8px] border border-line py-2 text-xs font-semibold text-ink"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="flex-1 rounded-[8px] border border-danger py-2 text-xs font-semibold text-danger"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[270] flex items-center justify-center bg-black/40 p-5" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-[380px] rounded-block bg-surface p-7" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-ink">Kategoriyani o&apos;chirish</h3>
            <p className="mt-2 text-sm text-ink">«{deleteTarget.name}» kategoriyasini o&apos;chirmoqchimisiz?</p>
            <div className="mt-4 flex gap-2.5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-[12px] border border-line py-3 text-sm font-semibold text-ink">
                Bekor qilish
              </button>
              <button onClick={confirmDelete} className="flex-1 rounded-[12px] bg-danger py-3 text-sm font-bold text-white">
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
