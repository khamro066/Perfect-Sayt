"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";

interface Category {
  id: string;
  name: string;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function refetch() {
    fetch("/api/admin/categories").then((res) => res.json()).then(setCategories);
  }

  useEffect(refetch, []);

  async function submitAdd() {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (!res.ok) return showToast(data.error);
    setNewName("");
    showToast("Kategoriya qo'shildi");
    refetch();
  }

  async function submitRename(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue }),
    });
    const data = await res.json();
    if (!res.ok) return showToast(data.error);
    setEditing(null);
    showToast("Kategoriya yangilandi");
    refetch();
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
        <div className="mt-3.5 flex flex-wrap gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Kategoriya nomi (masalan: Sandal)"
            className="min-w-[220px] flex-1 rounded-[10px] border border-line bg-bg px-3.5 py-3 text-sm outline-none"
          />
          <button onClick={submitAdd} className="whitespace-nowrap rounded-[10px] bg-accent px-5.5 py-3 text-sm font-bold text-accent-ink">
            + Qo&apos;shish
          </button>
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface p-5.5">
        <h2 className="font-bold text-ink">Mavjud kategoriyalar</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
          {categories.map((c) => {
            const isEditing = editing === c.id;
            return (
              <div key={c.id} className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-bg p-4">
                {isEditing ? (
                  <>
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="rounded-[10px] border border-accent bg-surface px-3 py-2 text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => submitRename(c.id)} className="flex-1 rounded-[8px] bg-accent py-2 text-xs font-bold text-accent-ink">
                        Saqlash
                      </button>
                      <button onClick={() => setEditing(null)} className="flex-1 rounded-[8px] border border-line py-2 text-xs font-semibold text-ink">
                        Bekor qilish
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[14.5px] font-bold text-ink">{c.name}</span>
                      <span className="text-xs text-muted">{c.productCount} mahsulot</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(c.id); setEditValue(c.name); }}
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
