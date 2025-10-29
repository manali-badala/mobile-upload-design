// src/components/FileUpload.tsx
import React, { useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setFileName(file.name);
        setError("");
        onFileSelect(file);
      } else {
        setError("Please upload a valid PDF file.");
      }
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        aria-label="Upload PDF document"
      />
      <p className="file-name">
        {fileName ? `Selected file: ${fileName}` : "No file selected"}
      </p>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileUpload;
