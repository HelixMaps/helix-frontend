"use client";

import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Filter out overlay HUD and interactive UI elements from map snapshots.
 */
export const filterOverlayElements = (node) => {
  if (!node) return true;
  // Preserve SVG elements and text nodes
  if (node.nodeType === 3) return true;

  if (node.classList) {
    const classesToExclude = [
      "export-exclude",
      "export-modal",
      "react-flow__minimap",
      "react-flow__controls",
      "spatial-command-deck",
      "node-picker-container",
      "node-search-bar",
      "mode-badge",
      "details-drawer",
      "context-menu",
    ];

    if (classesToExclude.some((cls) => node.classList.contains(cls))) {
      return false;
    }
  }

  // Also check ancestor hierarchy
  if (typeof node.closest === "function") {
    if (
      node.closest(".export-exclude") ||
      node.closest(".export-modal") ||
      node.closest("[role='dialog']") ||
      node.closest(".react-flow__minimap") ||
      node.closest(".spatial-command-deck")
    ) {
      return false;
    }
  }

  return true;
};

/**
 * Helper to sanitize filenames across operating systems.
 */
export const sanitizeFilename = (name) => {
  if (!name || typeof name !== "string") return "mindmap";
  return name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "mindmap";
};

/**
 * Export the given DOM element as a PNG or JPEG image and trigger download.
 */
export async function exportMapImage({
  element,
  title = "Mind Map",
  format = "png",
  transparent = false,
  pixelRatio = 2,
  backgroundColor = "#141414",
}) {
  if (!element) {
    throw new Error("Canvas element not found for export");
  }

  const commonOptions = {
    filter: filterOverlayElements,
    pixelRatio: Math.min(Math.max(pixelRatio, 1), 3),
    backgroundColor: format === "png" && transparent ? null : backgroundColor,
    cacheBust: true,
  };

  let dataUrl;
  if (format === "jpeg" || format === "jpg") {
    dataUrl = await toJpeg(element, { ...commonOptions, quality: 0.95 });
  } else {
    dataUrl = await toPng(element, commonOptions);
  }

  // Trigger browser file download
  const link = document.createElement("a");
  const ext = format === "jpeg" || format === "jpg" ? "jpg" : "png";
  link.download = `${sanitizeFilename(title)}-snapshot.${ext}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}

/**
 * Export the given DOM element as a high-resolution, beautifully formatted landscape PDF.
 */
export async function exportMapPdf({
  element,
  title = "Mind Map",
  pixelRatio = 2,
  backgroundColor = "#141414",
}) {
  if (!element) {
    throw new Error("Canvas element not found for export");
  }

  // 1. Generate high-resolution PNG snapshot of the canvas
  const dataUrl = await toPng(element, {
    filter: filterOverlayElements,
    pixelRatio: Math.min(Math.max(pixelRatio, 1), 3),
    backgroundColor,
    cacheBust: true,
  });

  // 2. Measure image dimensions
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Failed to load snapshot for PDF generation"));
  });

  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;

  // 3. Initialize landscape PDF (standard A4)
  const isLandscape = imgWidth >= imgHeight;
  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Dark background fill
  pdf.setFillColor(20, 20, 20); // #141414
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Header dimensions & margins
  const margin = 28;
  const headerHeight = 36;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2 - headerHeight;

  // Fit image maintaining aspect ratio
  const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
  const renderWidth = imgWidth * scale;
  const renderHeight = imgHeight * scale;

  // Center image horizontally and vertically below header
  const posX = (pageWidth - renderWidth) / 2;
  const posY = margin + headerHeight + (availableHeight - renderHeight) / 2;

  // Header Title
  pdf.setTextColor(245, 245, 250);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, margin, margin + 14);

  // Subtitle Metadata & Timestamp
  pdf.setTextColor(140, 140, 155);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  pdf.text(`Helix Neural Workspace  |  Exported on ${dateStr}`, margin, margin + 26);

  // Add the map snapshot image to PDF
  pdf.addImage(dataUrl, "PNG", posX, posY, renderWidth, renderHeight, undefined, "FAST");

  // Trigger browser file download
  const filename = `${sanitizeFilename(title)}-snapshot.pdf`;
  pdf.save(filename);

  return filename;
}
