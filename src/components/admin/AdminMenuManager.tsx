"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatPricePence, parsePriceToPence } from "@/lib/menu/format";
import type {
  MenuCategory,
  MenuData,
  MenuItem,
  MenuLocationSlug,
  MenuType,
  MenuVariant,
} from "@/lib/menu/types";
import { locations } from "@/lib/data/locations";
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

function AdminTabGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded border border-gold/20 bg-surface-alt/60 p-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded px-5 py-3 text-lg transition",
            value === opt.value
              ? "bg-gold text-background"
              : "text-muted hover:bg-gold/10 hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function AdminMenuManager() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [locationSlug, setLocationSlug] =
    useState<MenuLocationSlug>("kentish-town");
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

  const branchMenu = menu?.branches[locationSlug];
  const categories = branchMenu
    ? menuType === "daily"
      ? branchMenu.daily
      : branchMenu.lunch
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
          locationSlug,
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
      await menuAction({
        action: "createCategory",
        locationSlug,
        menuType,
        name: name.trim(),
      });
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

  async function handleRenameCategory(category: MenuCategory) {
    const name = prompt("Category name", category.name);
    if (!name?.trim() || name.trim() === category.name) return;
    setSaving(true);
    try {
      await menuAction({
        action: "updateCategory",
        id: category.id,
        name: name.trim(),
      });
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rename failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCategoryNote(
    category: MenuCategory,
    note: string,
  ) {
    setSaving(true);
    try {
      await menuAction({
        action: "updateCategory",
        id: category.id,
        note,
      });
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleReorderCategory(
    categoryId: string,
    direction: "up" | "down",
  ) {
    setSaving(true);
    try {
      await menuAction({ action: "reorderCategory", id: categoryId, direction });
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleReorderItem(itemId: string, direction: "up" | "down") {
    setSaving(true);
    try {
      await menuAction({ action: "reorderItem", id: itemId, direction });
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-xl text-muted">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        Loading menu…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-normal text-foreground">
          Menu management
        </h2>
        <p className="mt-2 text-xl text-muted">
          Edit daily and lunch menus for each branch
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="border border-red-800/40 bg-red-950/25 px-5 py-4 text-lg text-red-200"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <AdminTabGroup
          value={locationSlug}
          onChange={setLocationSlug}
          options={locations.map((l) => ({
            value: l.slug as MenuLocationSlug,
            label: l.shortName,
          }))}
        />
        <AdminTabGroup
          value={menuType}
          onChange={setMenuType}
          options={[
            { value: "daily" as const, label: "Daily menu" },
            { value: "lunch" as const, label: "Lunch menu" },
          ]}
        />
        <Button size="md" onClick={handleAddCategory} disabled={saving}>
          Add category
        </Button>
      </div>

      {menuType === "lunch" && menu && branchMenu && (
        <div className="luxury-card p-6">
          <label className="block">
            <span className="label-caps">
              Lunch hours note —{" "}
              {locations.find((l) => l.slug === locationSlug)?.shortName}
            </span>
            <div className="mt-3 flex flex-wrap gap-3">
              <input
                value={branchMenu.lunchNote}
                onChange={(e) =>
                  setMenu({
                    ...menu,
                    branches: {
                      ...menu.branches,
                      [locationSlug]: {
                        ...branchMenu,
                        lunchNote: e.target.value,
                      },
                    },
                  })
                }
                className="luxury-input min-w-[240px] flex-1"
              />
              <Button
                size="md"
                variant="outline"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await menuAction({
                      action: "updateLunchNote",
                      locationSlug,
                      note: branchMenu.lunchNote,
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
          </label>
        </div>
      )}

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="luxury-card px-8 py-16 text-center text-xl text-muted">
            No categories yet. Add one to start building this menu.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="luxury-card overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.id ? null : category.id,
                  )
                }
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <div>
                  <h3 className="font-display text-2xl text-foreground">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-lg text-muted">
                    {category.items.length}{" "}
                    {category.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <span className="text-2xl text-gold">
                  {expandedCategory === category.id ? "−" : "+"}
                </span>
              </button>

            {expandedCategory === category.id && (
              <div className="border-t border-gold/15 px-6 pb-6">
                <div className="mb-4 flex flex-wrap gap-3 pt-5">
                  <Button size="md" onClick={() => openNewItem(category)}>
                    Add item
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleRenameCategory(category)}
                  >
                    Rename
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleReorderCategory(category.id, "up")}
                    disabled={saving}
                  >
                    Move up
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleReorderCategory(category.id, "down")}
                    disabled={saving}
                  >
                    Move down
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    Delete category
                  </Button>
                </div>

                <label className="mb-6 block">
                  <span className="label-caps">Category note (optional)</span>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <input
                      key={category.id}
                      defaultValue={category.note ?? ""}
                      placeholder="Shown on the public menu under this section"
                      className="luxury-input min-w-[240px] flex-1"
                      onBlur={(e) => {
                        if (e.target.value !== (category.note ?? "")) {
                          handleSaveCategoryNote(category, e.target.value);
                        }
                      }}
                    />
                  </div>
                </label>

                <ul className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                      <li
                        key={item.id}
                        className="rounded border border-gold/15 bg-surface-alt/40 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-display text-xl text-foreground">
                              {item.name}
                              {item.featured && (
                                <span className="ml-3 text-base text-gold">
                                  Signature
                                </span>
                              )}
                            </p>
                            {item.description && (
                              <p className="mt-2 text-lg text-muted">
                                {item.description}
                              </p>
                            )}
                            <ul className="mt-3 space-y-1 text-lg">
                              {item.variants.map((v) => (
                                <li key={v.id} className="text-muted">
                                  {v.protein ? `${v.protein}: ` : ""}
                                  <span className="font-medium text-gold-light">
                                    {formatPricePence(v.pricePence)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {item.tags.length > 0 && (
                              <p className="mt-3 text-base text-muted">
                                {item.tags.join(" · ")}
                              </p>
                            )}
                          </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
                          <button
                            type="button"
                            disabled={itemIndex === 0 || saving}
                            onClick={() => handleReorderItem(item.id, "up")}
                            className="text-base text-muted hover:text-gold disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={
                              itemIndex === category.items.length - 1 || saving
                            }
                            onClick={() => handleReorderItem(item.id, "down")}
                            className="text-base text-muted hover:text-gold disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditItem(item)}
                            className="text-lg text-gold hover:text-gold-light"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="text-lg text-red-300 hover:text-red-200"
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
          ))
        )}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto luxury-card p-8 shadow-2xl">
            <h3 className="font-display text-3xl text-foreground">
              {editingItem ? "Edit menu item" : "New menu item"}
            </h3>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="label-caps">Name</span>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                  className="luxury-input mt-3"
                />
              </label>

              <label className="block">
                <span className="label-caps">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  rows={3}
                  className="luxury-input mt-3 resize-none"
                />
              </label>

              <label className="block">
                <span className="label-caps">Tags (comma-separated)</span>
                <input
                  value={draft.tags}
                  onChange={(e) =>
                    setDraft({ ...draft, tags: e.target.value })
                  }
                  placeholder="Gluten free, Vegetarian"
                  className="luxury-input mt-3"
                />
              </label>

              <label className="flex items-center gap-3 text-lg text-muted">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) =>
                    setDraft({ ...draft, featured: e.target.checked })
                  }
                  className="h-5 w-5 accent-gold"
                />
                Signature dish
              </label>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="label-caps">Protein options & prices</span>
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
                    className="text-lg text-gold hover:text-gold-light"
                  >
                    Add option
                  </button>
                </div>
                <ul className="mt-3 space-y-3">
                  {draft.variants.map((variant, index) => (
                    <li key={index} className="flex gap-3">
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
                        className="luxury-input flex-1"
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
                        className="luxury-input w-28"
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
                        className="px-2 text-2xl text-red-300 hover:text-red-200"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-base text-muted">
                  Leave protein blank for a single-price dish. Add one row per
                  protein option with its own price.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setDraft(null);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
              <Button size="md" onClick={handleSaveItem} disabled={saving}>
                {saving ? "Saving…" : "Save item"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
