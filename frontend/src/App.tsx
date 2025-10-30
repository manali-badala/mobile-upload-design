// src/App.tsx
import React, { useEffect, useState } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import PDFViewer from "./components/PDFViewer";
import { signPdfOnServer } from "./services/signService";
import "./utils/pdfWorkerConfig";

const App: React.FC = () => {
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadLabel, setDownloadLabel] = useState<string>("signed.pdf");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setError(null);
    setSelectedFileName(file.name);
    setUploadedAt(new Date());

    if (signedPdfUrl) {
      URL.revokeObjectURL(signedPdfUrl);
      setSignedPdfUrl(null);
    }

    const baseName = file.name.replace(/\.pdf$/i, "") || "document";
    const signedTitle = `${baseName}_initialed`;
    const signedFileName = `${signedTitle}.pdf`;
    setDownloadLabel(signedFileName);
    setIsSigning(true);

    try {
      const signedBlob = await signPdfOnServer(file, signedTitle);
      const namedFile = new File([signedBlob], signedFileName, {
        type: "application/pdf",
      });
      const objectUrl = URL.createObjectURL(namedFile);
      setSignedPdfUrl(objectUrl);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't sign that PDF. Please try again.";
      setError(message);
    } finally {
      setIsSigning(false);
    }
  };

  const handleFileSelect = (file: File) => {
    void processFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) {
      return;
    }

    if (droppedFile.type !== "application/pdf") {
      setError("Please drop a valid PDF file.");
      return;
    }

    void processFile(droppedFile);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    return () => {
      if (signedPdfUrl) {
        URL.revokeObjectURL(signedPdfUrl);
      }
    };
  }, [signedPdfUrl]);

  const handleViewerError = (loadError: Error) => {
    console.error("Failed to load signed PDF", loadError);
    if (signedPdfUrl) {
      URL.revokeObjectURL(signedPdfUrl);
    }
    setSignedPdfUrl(null);
    setError("Failed to display the signed PDF.");
  };

  return (
    <div className="App">
      <div className="content">
        <h1>Upload & View Signed PDF</h1>
        <p className="subtitle">
          Choose a PDF and our mock signer will return a copy stamped with your initials at the bottom.
        </p>
        <div
          className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileUpload
            onFileSelect={handleFileSelect}
            isUploading={isSigning}
          />
          <p className="dropzone__hint">
            or drag and drop your PDF here
          </p>
        </div>
        {selectedFileName && (
          <p className="selected-file">
            <span className="selected-file__label">Selected file:</span>{" "}
            <span className="selected-file__name">{selectedFileName}</span>
          </p>
        )}
        {isSigning && (
          <div className="status status--info" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Signing your PDF…</span>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {signedPdfUrl && !isSigning && !error && (
          <div className="signed-output">
            <div className="status status--success" role="status">
              <span aria-hidden="true">✅</span>
              <span>Signed PDF ready to view below.</span>
            </div>
            <PDFViewer
              pdfUrl={signedPdfUrl}
              fileName={downloadLabel}
              uploadedAt={uploadedAt ?? undefined}
              onLoadError={handleViewerError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
