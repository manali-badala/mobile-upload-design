import React, { useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isUploading = false,
}) => {
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setError("");
        onFileSelect(file);
      } else {
        setError("Please upload a valid PDF file.");
      }
      e.target.value = "";
    }
  };

  return (
    <div className="file-upload">
      <label className={`file-upload-label ${isUploading ? "disabled" : ""}`}>
        <span>{isUploading ? "Uploading…" : "Tap to choose a PDF"}</span>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          aria-label="Upload PDF document"
          disabled={isUploading}
        />
      </label>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileUpload;
