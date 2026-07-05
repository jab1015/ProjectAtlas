"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface InventionCardMenuProps {
  inventionId: Id<"inventions">;
  inventionTitle: string;
  /** Called after a successful delete so the parent can update its UI. */
  onDeleted?: () => void;
}

/**
 * Three-dot context menu for an invention card.
 * Contains a Delete action with a confirmation dialog.
 * The ⋮ icon is always visible on mobile, opacity-0 on desktop until the
 * parent card is hovered (achieved via the `group` + `group-hover` pattern —
 * the parent card must have the `group` class applied).
 */
export function InventionCardMenu({
  inventionId,
  inventionTitle,
  onDeleted,
}: InventionCardMenuProps) {
  const router = useRouter();
  const deleteInvention = useMutation(api.journeyEngine.deleteInvention);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteInvention({ inventionId });
      setConfirmOpen(false);
      toast({ title: "Project deleted successfully." });
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Visible always on mobile (sm:opacity-0 → revealed on group-hover) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            aria-label="Project options"
            // Stop propagation so clicking the menu button doesn't navigate
            // when the card itself is a <Link>.
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Confirmation Dialog ──────────────────────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogDescription className="pt-1">
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {inventionTitle}
              </span>{" "}
              and all data associated with it.
              <br />
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
