"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Upload, File, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  productId: Id<"products">;
  onUpload: (data: {
    storageId: Id<"_storage">;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => void;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  // Return a simple generic icon — could be extended with type-specific icons
  switch (ext) {
    case "pdf":
      return <File className="h-8 w-8 text-destructive" />;
    case "zip":
    case "rar":
    case "7z":
      return <File className="h-8 w-8 text-secondary-foreground" />;
    case "mp4":
    case "mov":
    case "avi":
      return <File className="h-8 w-8 text-muted-foreground" />;
    case "mp3":
    case "wav":
    case "flac":
      return <File className="h-8 w-8 text-primary" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return <File className="h-8 w-8 text-accent-foreground" />;
    default:
      return <File className="h-8 w-8 text-muted-foreground" />;
  }
}

export function FileUploader({ productId, onUpload }: FileUploaderProps) {
  const generateUploadUrl = useMutation(api.productFiles.generateUploadUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: globalThis.File) => {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadingFileName(file.name);

      try {
        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload the file
        const result = await new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadUrl);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(new Response(xhr.responseText, { status: xhr.status }));
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Upload failed")));

          xhr.send(file);
        });

        const { storageId } = (await result.json()) as {
          storageId: string;
        };

        onUpload({
          storageId: storageId as Id<"_storage">,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
        });
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadingFileName("");
      }
    },
    [generateUploadUrl, onUpload]
  );

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50",
          isUploading && "pointer-events-none opacity-70"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {getFileIcon(uploadingFileName)}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{uploadingFileName}</p>
              <div className="mt-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                Drop a file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Upload product files for download
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
