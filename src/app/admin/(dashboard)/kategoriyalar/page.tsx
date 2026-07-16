"use client";

import { useState } from "react";
import { useAdminData } from "@/lib/admin-data-context";
import { useToast } from "@/lib/toast-context";

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, renameCategory, deleteCategory } = useAdminData();
  const { showToast } = useToast();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function submitAdd() {
    const result = addCategory(newName);
    if (result === "empty") return showToast("Kategoriya nomini kiriting");
    if (result === "duplicate") return showToast("Bunday kategoriya allaqachon mavjud");
    setNewName("");
    showToast("Kategoriya qo'shildi");
  }

  function submitRename(oldName: string) {
    const result = renameCategory(oldName, editValue);
    if (result === "empty") return showToast("Kategoriya nomini kiriting");
    if (result === "duplicate") return showToast("Bunday kategoriya allaqachon mavjud");
    setEditing(null);
    showToast("Kategoriya yangilandi");
  }

  function confirmDelete(name: string) {
    const result = deleteCategory(name);
    setDeleteTarget(null);
    if (result === "in-use") {
      showToast("Bu kategoriyada mahsulotlar mavjud — avval ularni boshqa kategoriyaga o'tkazing");
    } else {
      showToast("Kategoriya o'chirildi");
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
            const count = products.filter((p) => p.category === c).length;
            const isEditing = editing === c;
            return (
              <div key={c} className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-bg p-4">
                {isEditing ? (
                  <>
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="rounded-[10px] border border-accent bg-surface px-3 py-2 text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => submitRename(c)} className="flex-1 rounded-[8px] bg-accent py-2 text-xs font-bold text-accent-ink">
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
                      <span className="text-[14.5px] font-bold text-ink">{c}</span>
                      <span className="text-xs text-muted">{count} mahsulot</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(c); setEditValue(c); }}
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
            <p className="mt-2 text-sm text-ink">«{deleteTarget}» kategoriyasini o&apos;chirmoqchimisiz?</p>
            <div className="mt-4 flex gap-2.5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-[12px] border border-line py-3 text-sm font-semibold text-ink">
                Bekor qilish
              </button>
              <button onClick={() => confirmDelete(deleteTarget)} className="flex-1 rounded-[12px] bg-danger py-3 text-sm font-bold text-white">
                O&apos;chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
