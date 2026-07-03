"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, FileIcon, Loader2 } from "lucide-react";

interface DownloadButtonProps {
  fileName: string;
  fileSize?: number;
  downloadUrl?: string;
  onDownload?: () => Promise<string | void>;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function DownloadButton({
  fileName,
  fileSize,
  downloadUrl,
  onDownload,
  className,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
      return;
    }

    if (onDownload) {
      setLoading(true);
      try {
        const url = await onDownload();
        if (url) {
          window.open(url, "_blank");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={loading || (!downloadUrl && !onDownload)}
      className={cn(
        "flex h-auto w-full items-center justify-between gap-3 px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col items-start overflow-hidden text-left">
          <span className="truncate text-sm font-medium">{fileName}</span>
          {fileSize !== undefined && (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(fileSize)}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Download</span>
          </>
        )}
      </div>
    </Button>
  );
}
