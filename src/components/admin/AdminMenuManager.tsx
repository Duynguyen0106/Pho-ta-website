"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPricePence, parsePriceToPence } from "@/lib/menu/format";
import type {
  MenuCategory,
  MenuData,
  MenuItem,
  MenuType,
  MenuVariant,
} from "@/lib/menu/types";
import { cn } from "@/lib/utils";

async function menuAction(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

interface VariantDraft {
  id?: string;
  protein: string;
  price: string;
}

function variantsToDraft(variants: MenuVariant[]): VariantDraft[] {
  return variants.map((v) => ({
    id: v.id,
    protein: v.protein,
    price: (v.pricePence / 100).toFixed(2),
  }));
}

function draftToVariants(drafts: VariantDraft[]) {
  return drafts
    .filter((d) => d.price.trim())
    .map((d) => ({
      id: d.id,
      protein: d.protein.trim(),
      pricePence: parsePriceToPence(`£${d.price.replace("£", "")}`),
    }));
}

export function AdminMenuManager() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [menuType, setMenuType] = useState<MenuType>("daily");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    description: string;
    tags: string;
    featured: boolean;
    variants: VariantDraft[];
    categoryId: string;
  } | null>(null);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMenu(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const categories = menu
    ? menuType === "daily"
      ? menu.daily
      : menu.lunch
    : [];

  function openNewItem(category: MenuCategory) {
    setEditingItem(null);
    setDraft({
      categoryId: category.id,
      name: "",
      description: "",
      tags: "",
      featured: false,
      variants: [{ protein: "", price: "" }],
    });
  }

  function openEditItem(item: MenuItem) {
    setEditingItem(item);
    setDraft({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      tags: item.tags.join(", "),
      featured: item.featured,
      variants: variantsToDraft(item.variants),
    });
  }

  async function handleSaveItem() {
    if (!draft) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: draft.name,
        description: draft.description,
        tags: draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured: draft.featured,
        variants: draftToVariants(draft.variants),
      };

      if (editingItem) {
        await menuAction({ action: "updateItem", id: editingItem.id, ...payload });
      } else {
        await menuAction({
          action: "createItem",
          categoryId: draft.categoryId,
          ...payload,
        });
      }

      setDraft(null);
      setEditingItem(null);
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setSaving(true);
    try {
      await menuAction({ action: "deleteItem", id: item.id });
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory() {
    const name = prompt("Category name");
    if (!name?.trim()) return;
    setSaving(true);
    try {
      await menuAction({ action: "createCategory", menuType, name: name.trim() });
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(category: MenuCategory) {
    if (!confirm(`Delete category "${category.name}" and all its items?`)) return;
    setSaving(true);
    try {
      await menuAction({ action: "deleteCategory", id: category.id });
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete category");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-[#5c534a]">Loading menu…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-lg border border-[#e8e0d4] bg-white p-1">
          {(["daily", "lunch"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMenuType(type)}
              className={cn(
                "rounded-md px-4 py-2 text-sm capitalize transition",
                menuType === type
                  ? "bg-[#1a3c34] text-white"
                  : "text-[#5c534a] hover:bg-[#f5f2ed]",
              )}
            >
              {type} menu
            </button>
          ))}
        </div>
        <Button size="sm" onClick={handleAddCategory} disabled={saving}>
          Add category
        </Button>
      </div>

      {menuType === "lunch" && menu && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium text-[#5c534a]">
            Lunch hours note
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={menu.lunchNote}
              onChange={(e) =>
                setMenu({ ...menu, lunchNote: e.target.value })
              }
              className="flex-1 rounded-lg border border-[#e8e0d4] px-3 py-2 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await menuAction({
                    action: "updateLunchNote",
                    note: menu.lunchNote,
                  });
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Update failed");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save note
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-xl bg-white shadow-sm">
            <button
              type="button"
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category.id ? null : category.id,
                )
              }
              className="flex w-full items-center justify-between px-4 py-4 text-left"
            >
              <div>
                <h3 className="font-serif text-lg text-[#1a3c34]">
                  {category.name}
                </h3>
                <p className="text-sm text-[#8a7f72]">
                  {category.items.length} items
                </p>
              </div>
              <span className="text-[#8a7f72]">
                {expandedCategory === category.id ? "−" : "+"}
              </span>
            </button>

            {expandedCategory === category.id && (
              <div className="border-t border-[#e8e0d4] px-4 pb-4">
                <div className="mb-3 flex gap-2 pt-3">
                  <Button size="sm" onClick={() => openNewItem(category)}>
                    Add item
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    Delete category
                  </Button>
                </div>

                <ul className="space-y-3">
                  {category.items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-[#e8e0d4] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-[#1a3c34]">
                            {item.name}
                            {item.featured && (
                              <span className="ml-2 text-xs text-[#c9a962]">
                                Signature
                              </span>
                            )}
                          </p>
                          {item.description && (
                            <p className="mt-1 text-sm text-[#5c534a]">
                              {item.description}
                            </p>
                          )}
                          <ul className="mt-2 space-y-0.5 text-sm">
                            {item.variants.map((v) => (
                              <li key={v.id} className="text-[#5c534a]">
                                {v.protein ? `${v.protein}: ` : ""}
                                <span className="font-medium">
                                  {formatPricePence(v.pricePence)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {item.tags.length > 0 && (
                            <p className="mt-2 text-xs text-[#8a7f72]">
                              {item.tags.join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => openEditItem(item)}
                            className="text-sm text-[#1a3c34] underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="text-sm text-red-600 underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl text-[#1a3c34]">
              {editingItem ? "Edit menu item" : "New menu item"}
            </h3>

            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="text-[#5c534a]">Name</span>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="text-[#5c534a]">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                <span className="text-[#5c534a]">Tags (comma-separated)</span>
                <input
                  value={draft.tags}
                  onChange={(e) =>
                    setDraft({ ...draft, tags: e.target.value })
                  }
                  placeholder="Gluten free, Vegetarian"
                  className="mt-1 w-full rounded-lg border border-[#e8e0d4] px-3 py-2"
                />
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) =>
                    setDraft({ ...draft, featured: e.target.checked })
                  }
                />
                Signature dish
              </label>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5c534a]">
                    Protein options & prices
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        variants: [
                          ...draft.variants,
                          { protein: "", price: "" },
                        ],
                      })
                    }
                    className="text-sm text-[#1a3c34] underline"
                  >
                    Add option
                  </button>
                </div>
                <ul className="mt-2 space-y-2">
                  {draft.variants.map((variant, index) => (
                    <li key={index} className="flex gap-2">
                      <input
                        value={variant.protein}
                        onChange={(e) => {
                          const variants = [...draft.variants];
                          variants[index] = {
                            ...variants[index],
                            protein: e.target.value,
                          };
                          setDraft({ ...draft, variants });
                        }}
                        placeholder="Chicken, Beef, etc."
                        className="flex-1 rounded-lg border border-[#e8e0d4] px-3 py-2 text-sm"
                      />
                      <input
                        value={variant.price}
                        onChange={(e) => {
                          const variants = [...draft.variants];
                          variants[index] = {
                            ...variants[index],
                            price: e.target.value,
                          };
                          setDraft({ ...draft, variants });
                        }}
                        placeholder="12.50"
                        className="w-24 rounded-lg border border-[#e8e0d4] px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            variants: draft.variants.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                        className="text-sm text-red-600"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-[#8a7f72]">
                  Leave protein blank for a single-price dish. Add one row per
                  protein option with its own price.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(null);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveItem} disabled={saving}>
                {saving ? "Saving…" : "Save item"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
