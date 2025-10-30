import React, { useCallback, useMemo, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
  uploadedAt?: Date;
  onLoadError?: (error: Error) => void;
}

const formatTimestamp = (timestamp?: Date) => {
  if (!timestamp) {
    return "Received just now";
  }
  const now = Date.now();
  const diffMs = now - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Received just now";
  if (diffMinutes === 1) return "Received 1 min ago";
  if (diffMinutes < 60) return `Received ${diffMinutes} mins ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return "Received 1 hour ago";
  if (diffHours < 24) return `Received ${diffHours} hours ago`;
  return timestamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName,
  uploadedAt,
  onLoadError,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const initials = useMemo(() => {
    const safeName = fileName.trim();
    if (!safeName) return "PDF";
    const parts = safeName.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    if (parts.length === 0) {
      return safeName.slice(0, 2).toUpperCase();
    }
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [fileName]);

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const triggerDownload = useCallback(
    (href: string, openInNewTab = false) => {
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName;
      if (openInNewTab) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [fileName]
  );

  const handleDownload = useCallback(async () => {
    if (pdfUrl.startsWith("blob:") || pdfUrl.startsWith("data:")) {
      triggerDownload(pdfUrl);
      return;
    }

    try {
      setIsDownloading(true);
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      triggerDownload(blobUrl);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, opening in new tab", error);
      triggerDownload(pdfUrl, true);
    } finally {
      setIsDownloading(false);
    }
  }, [pdfUrl, triggerDownload]);

  const handlePdfError = useCallback(() => {
    setHasError(true);
    onLoadError?.(new Error("PDF preview failed to load."));
  }, [onLoadError]);

  if (hasError) {
    return (
      <div className="pdf-preview__fallback">
        <svg
          className="pdf-preview__fallback-icon"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: "#ef4444" }}
        >
          <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <polyline points="13 2 13 9 20 9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
        <p className="pdf-preview__fallback-filename">{fileName}</p>
        <p className="pdf-preview__fallback-message">
          Preview not available. You can still download the PDF.
        </p>
        <button
          type="button"
          onClick={handleDownload}
          className="pdf-preview__download"
          disabled={isDownloading}
        >
          {isDownloading ? "Preparing…" : "Download PDF"}
        </button>
      </div>
    );
  }

  const inlineIframeId = "pdf-preview-inline";

  return (
    <>
      <div className="pdf-preview">
        <div className="pdf-preview__meta">
          <div className="pdf-preview__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="pdf-preview__meta-text">
            <p className="pdf-preview__meta-name" title={fileName}>
              {fileName}
            </p>
            <p className="pdf-preview__meta-time">
              {formatTimestamp(uploadedAt)}
            </p>
          </div>
          <div className="pdf-preview__actions">
            <button
              type="button"
              className="pdf-preview__meta-download"
              onClick={handleDownload}
              disabled={isDownloading}
              aria-label="Download PDF"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              className="pdf-preview__meta-expand"
              onClick={openFullscreen}
              aria-label="Open fullscreen"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="m21 3-7 7" />
                <path d="m3 21 7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pdf-preview__frame">
          <iframe
            id={inlineIframeId}
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
            title={fileName}
            className="pdf-preview__iframe"
            onError={handlePdfError}
          />
        </div>
      </div>

      {isFullscreen && (
        <div className="pdf-preview__modal" role="dialog" aria-modal="true">
          <div className="pdf-preview__modal-body">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
              title={`${fileName} fullscreen`}
              className="pdf-preview__modal-iframe"
            />
          </div>
          <button
            type="button"
            className="pdf-preview__modal-close"
            onClick={closeFullscreen}
            aria-label="Close fullscreen"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default PDFViewer;
