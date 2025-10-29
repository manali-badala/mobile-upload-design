// src/components/PDFViewer.tsx
import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";

interface PDFViewerProps {
  pdfUrl: string;
  onLoadError?: (error: Error) => void;
  onLoadSuccess?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  onLoadError,
  onLoadSuccess,
}) => {
  const [containerWidth, setContainerWidth] = useState(320);
  const [numPages, setNumPages] = useState<number>(1);

  useEffect(() => {
    const calculateWidth = () => {
      if (typeof window !== "undefined") {
        const availableWidth = window.innerWidth - 48;
        const maxWidth = 700;
        const minWidth = 260;
        setContainerWidth(
          Math.max(minWidth, Math.min(maxWidth, availableWidth))
        );
      }
    };

    calculateWidth();
    window.addEventListener("resize", calculateWidth);

    return () => {
      window.removeEventListener("resize", calculateWidth);
    };
  }, []);

  const handleLoadSuccess = ({ numPages: loadedPages }: PDFDocumentProxy) => {
    setNumPages(loadedPages);
    onLoadSuccess?.();
  };

  return (
    <div className="pdf-viewer">
      <Document
        file={pdfUrl}
        onLoadError={onLoadError}
        onLoadSuccess={handleLoadSuccess}
        loading={<p>Loading signed PDF…</p>}
        error={<p>Could not display the PDF.</p>}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={containerWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
