"use client";

import { useState } from "react";
import { File, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "../../../convex/_generated/dataModel";

interface ProductFile {
  _id: Id<"productFiles">;
  displayName: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  sortOrder?: number;
}

interface FileListProps {
  files: ProductFile[];
  onDelete: (fileId: Id<"productFiles">) => void;
  onReorder: (fileId: Id<"productFiles">, direction: "up" | "down") => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${size} ${units[i]}`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <File className="h-5 w-5 text-destructive" />;
    case "zip":
    case "rar":
    case "7z":
      return <File className="h-5 w-5 text-secondary-foreground" />;
    case "mp4":
    case "mov":
    case "avi":
      return <File className="h-5 w-5 text-muted-foreground" />;
    case "mp3":
    case "wav":
    case "flac":
      return <File className="h-5 w-5 text-primary" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return <File className="h-5 w-5 text-accent-foreground" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

export function FileList({ files, onDelete, onReorder }: FileListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ProductFile | null>(null);

  if (files.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <File className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No files uploaded yet
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y rounded-lg border">
        {files.map((file, index) => (
          <div
            key={file._id}
            className="flex items-center gap-3 px-4 py-3"
          >
            {getFileIcon(file.fileName)}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {file.displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.fileSize)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onReorder(file._id, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onReorder(file._id, "down")}
                disabled={index === files.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(file)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
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
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.displayName}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget._id);
                  setDeleteTarget(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
