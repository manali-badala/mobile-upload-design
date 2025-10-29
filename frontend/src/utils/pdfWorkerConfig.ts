// src/utils/pdfWorkerConfig.ts
import { pdfjs } from "react-pdf";

// Tell pdf.js where the worker lives so it can render PDFs off the main thread.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
