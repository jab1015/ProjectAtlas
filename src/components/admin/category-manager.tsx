"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderOpen, Pencil, Trash2, Plus, Check, X } from "lucide-react";

interface Category {
  _id: Id<"categories">;
  name: string;
  slug: string;
  productCount?: number;
}

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    try {
      await createCategory({ name });
      setNewName("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  }

  function startEditing(category: Category) {
    setEditingId(category._id);
    setEditName(category.name);
  }

  async function handleUpdate() {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;

    try {
      await updateCategory({ id: editingId, name });
      setEditingId(null);
      setEditName("");
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await deleteCategory({ id: deleteTarget._id });
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  }

  return (
    <>
      <div className="space-y-3">
        {/* Category list */}
        {categories.length === 0 && !isAdding ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No categories yet
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center gap-3 px-4 py-3"
              >
                {editingId === category._id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate();
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className="h-8 flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleUpdate}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={cancelEditing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">
                      {category.name}
                    </span>
                    {category.productCount !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {category.productCount}{" "}
                        {category.productCount === 1 ? "product" : "products"}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Inline add form */}
        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewName("");
                }
              }}
              className="h-9"
              autoFocus
            />
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;?
              Products in this category will not be deleted but will become
              uncategorized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
