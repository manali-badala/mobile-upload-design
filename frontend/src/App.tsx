// src/App.tsx
import React, { useEffect, useState } from "react";
import "./App.css";
import FileUpload from "./components/FileUpload";
import PDFViewer from "./components/PDFViewer";
import { signPdfOnServer } from "./services/signService";
import "./utils/pdfWorkerConfig";

const App: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [downloadLabel, setDownloadLabel] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
    setError(null);
    setSignedPdfUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
    setDownloadLabel(null);
  };

  const handleSignPdf = async () => {
    if (!pdfFile) {
      setError("Please choose a PDF file before signing.");
      return;
    }

    if (!signerName.trim()) {
      setError("Please enter the signer name.");
      return;
    }

    setIsSigning(true);
    setError(null);

    try {
      const signedBlob = await signPdfOnServer(pdfFile, signerName.trim());
      const objectUrl = URL.createObjectURL(signedBlob);
      setSignedPdfUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return objectUrl;
      });
      setDownloadLabel(`${signerName.trim()}_signed.pdf`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sign PDF. Please try again.";
      setError(message);
    } finally {
      setIsSigning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (signedPdfUrl) {
        URL.revokeObjectURL(signedPdfUrl);
      }
    };
  }, [signedPdfUrl]);

  const handlePdfLoadError = (loadError: Error) => {
    console.error("Failed to load signed PDF", loadError);
    setError("Failed to load the signed PDF.");
  };

  const handlePdfLoadSuccess = () => {
    setError(null);
  };

  return (
    <div className="App">
      <div className="content">
        <h1>Mobile PDF Upload and Signing</h1>
        <p className="subtitle">
          Upload a document, sign it with your name, then view or download the signed copy instantly.
        </p>
        <FileUpload onFileSelect={handleFileSelect} />
        <input
          type="text"
          placeholder="Signer name"
          value={signerName}
          onChange={(event) => setSignerName(event.target.value)}
          className="signer-input"
          aria-label="Signer name"
        />
        {pdfFile && (
          <button onClick={handleSignPdf} disabled={isSigning}>
            {isSigning ? "Signing..." : "Sign PDF"}
          </button>
        )}
        {error && <p className="error">{error}</p>}
        {signedPdfUrl && (
          <div className="signed-output">
            {!error && (
              <PDFViewer
                pdfUrl={signedPdfUrl}
                onLoadError={handlePdfLoadError}
                onLoadSuccess={handlePdfLoadSuccess}
              />
            )}
            <a
              href={signedPdfUrl}
              download={downloadLabel || "signed.pdf"}
              className="download-button"
            >
              Download Signed PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
