import { PDFDocument, rgb, PageSizes, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

const COMPANY_INFO = {
  name: "True Level Production",
  address: "Cairo, Egypt",
  phone: "+20 100 123 4567",
  email: "info@truelevelproduction.com",
};

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

function hasArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

function shapeText(text: string): string {
  if (!text || !hasArabic(text)) return text;
  try {
    const { ArabicShaper } = require("arabic-persian-reshaper") as {
      ArabicShaper: { convertArabic: (s: string) => string };
    };
    const bidiFactory = require("bidi-js") as () => {
      getEmbeddingLevels: (s: string) => any;
      getReorderedString: (s: string, levels: any) => string;
    };
    const bidi = bidiFactory();
    const reshaped = ArabicShaper.convertArabic(text);
    const levels = bidi.getEmbeddingLevels(reshaped);
    return bidi.getReorderedString(reshaped, levels);
  } catch {
    return text;
  }
}

function getFontWidth(font: any, text: string, size: number): number {
  if (!font || typeof font.widthOfTextAtSize !== "function") {
    return text.length * size * 0.55;
  }
  try {
    return font.widthOfTextAtSize(text, size);
  } catch {
    return text.length * size * 0.55;
  }
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US")} EGP`;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "---";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function drawText(page: any, text: string, x: number, y: number, opts: {
  font?: any; size?: number; color?: any; rightAlign?: boolean; rightEdge?: number;
}) {
  const { font, size = 10, color = rgb(0.02, 0.07, 0.12), rightAlign = false, rightEdge = 0 } = opts;
  const displayText = shapeText(text);
  if (font) page.setFont(font);
  page.setFontSize(size);
  let drawX = x;
  if (rightAlign && rightEdge > 0 && font) {
    drawX = rightEdge - getFontWidth(font, displayText, size);
  }
  page.drawText(displayText, { x: drawX, y, size, color });
}

export async function generateQuotationPdf(quotation: any): Promise<Uint8Array> {
  const logoPath = path.join(process.cwd(), "public", "true-level-logo-black.png");
  if (!fs.existsSync(logoPath)) throw new Error(`Logo not found: ${logoPath}`);
  const logoBytes = fs.readFileSync(logoPath);

  const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansArabic-Regular.ttf");
  if (!fs.existsSync(fontPath)) throw new Error(`Font not found: ${fontPath}`);
  const fontBytes = fs.readFileSync(fontPath);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const arabicFont = await doc.embedFont(fontBytes, { subset: true });

  const page = doc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;
  const rightEdge = width - margin;

  // Colors
  const white = rgb(1, 1, 1);
  const nearBlack = rgb(0.08, 0.08, 0.08);
  const darkGray = rgb(0.15, 0.15, 0.15);
  const midGray = rgb(0.4, 0.4, 0.4);
  const lightBg = rgb(0.95, 0.95, 0.96);
  const lightDivider = rgb(0.88, 0.88, 0.88);
  const accentBlue = rgb(0.04, 0.48, 1);
  const cardBg = rgb(0.97, 0.97, 0.98);

  page.drawRectangle({ x: 0, y: 0, width, height, color: white });

  let y = height - margin;

  // ══════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════
  const headerBgH = 100;
  page.drawRectangle({ x: 0, y: height - headerBgH, width, height: headerBgH, color: lightBg });

  let logoImage: any;
  try {
    logoImage = await doc.embedPng(logoBytes);
  } catch { /* continue */ }

  if (logoImage) {
    const logoDims = logoImage.scaleToFit(156, 78);
    const logoY = height - 78 - 12;
    page.drawImage(logoImage, { x: margin, y: logoY, width: logoDims.width, height: logoDims.height });
    drawText(page, COMPANY_INFO.name, margin, logoY - 8, { font: helvBold, size: 7, color: midGray });
  }

  drawText(page, "QUOTATION", width - margin, height - 42, { font: helvBold, size: 22, rightAlign: true, rightEdge: width - margin });
  drawText(page, "QUOTATION", width - margin, height - 66, { font: helv, size: 8, color: midGray, rightAlign: true, rightEdge: width - margin });

  y = height - headerBgH - 24;

  // ══════════════════════════════════════════════════════
  // DOCUMENT INFO CARD
  // ══════════════════════════════════════════════════════
  const infoCardH = 80;
  const infoCardY = y - infoCardH;
  page.drawRectangle({ x: margin, y: infoCardY, width: contentWidth, height: infoCardH, color: cardBg });
  page.drawRectangle({ x: margin, y: infoCardY, width: contentWidth, height: infoCardH, color: rgb(0.9, 0.9, 0.92), borderColor: rgb(0.82, 0.82, 0.84), borderWidth: 1 });
  // Draw card border manually (pdf-lib rectangle with border)
  const borderColor = rgb(0.82, 0.82, 0.84);
  const half = contentWidth / 2;

  const statusMap: Record<string, string> = {
    DRAFT: "Draft", SENT: "Sent", ACCEPTED: "Accepted",
    REJECTED: "Rejected", EXPIRED: "Expired",
  };

  const infoData: { label: string; value: string }[][] = [
    [
      { label: "QUOTATION NO", value: quotation.quotationNo || "---" },
      { label: "ISSUE DATE", value: formatDate(quotation.createdAt) },
    ],
    [
      { label: "VALID UNTIL", value: formatDate(quotation.validUntil) },
      { label: "STATUS", value: statusMap[quotation.status] || quotation.status },
    ],
  ];

  let infoRowY = infoCardY + infoCardH - 16;
  for (const row of infoData) {
    for (let ci = 0; ci < row.length; ci++) {
      const col = row[ci];
      const colX = margin + ci * half + 14;
      drawText(page, col.label, colX, infoRowY, { font: helv, size: 7, color: midGray });
      drawText(page, col.value, colX, infoRowY - 14, { font: helvBold, size: 10, color: nearBlack, rightAlign: ci > 0, rightEdge: colX + half - 28 });
    }
    infoRowY -= 26;
  }

  y = infoCardY - 24;

  // ══════════════════════════════════════════════════════
  // CLIENT SECTION
  // ══════════════════════════════════════════════════════
  const clientSectionBgH = 100;
  page.drawRectangle({ x: margin, y: y - clientSectionBgH, width: contentWidth, height: clientSectionBgH, color: cardBg });

  drawText(page, "CLIENT", margin, y - 6, { font: helvBold, size: 11, color: nearBlack });
  page.drawLine({ start: { x: margin, y: y - 16 }, end: { x: margin + 40, y: y - 16 }, thickness: 2, color: accentBlue });

  y -= 30;

  const clientName = quotation.client?.fullName || "---";
  drawText(page, clientName, margin, y, { font: arabicFont, size: 12, color: nearBlack, rightAlign: hasArabic(clientName), rightEdge });
  y -= 18;

  if (quotation.client?.companyName) {
    drawText(page, quotation.client.companyName, margin, y, { font: arabicFont, size: 10, color: midGray, rightAlign: hasArabic(quotation.client.companyName), rightEdge });
    y -= 16;
  }
  drawText(page, quotation.client?.phone || "---", margin, y, { font: arabicFont, size: 10, color: midGray });
  y -= 16;
  drawText(page, quotation.client?.email || "", margin, y, { font: arabicFont, size: 10, color: midGray });

  y = y - clientSectionBgH + 100 - 16;

  // ══════════════════════════════════════════════════════
  // SERVICE SECTION
  // ══════════════════════════════════════════════════════
  if (quotation.serviceType) {
    drawText(page, "SERVICE", margin, y, { font: helvBold, size: 11, color: nearBlack });
    page.drawLine({ start: { x: margin, y: y - 10 }, end: { x: margin + 40, y: y - 10 }, thickness: 2, color: accentBlue });
    y -= 22;

    const svc = String(quotation.serviceType);
    drawText(page, svc, margin + 4, y, { font: arabicFont, size: 11, color: nearBlack, rightAlign: hasArabic(svc), rightEdge });
    y -= 18;

    page.drawLine({ start: { x: margin, y }, end: { x: rightEdge, y }, thickness: 0.5, color: lightDivider });
    y -= 12;
  }

  // ══════════════════════════════════════════════════════
  // ITEMS TABLE
  // ══════════════════════════════════════════════════════
  const tableTop = y;
  const colWidths = [contentWidth * 0.40, contentWidth * 0.12, contentWidth * 0.18, contentWidth * 0.12, contentWidth * 0.18];
  const rowHeight = 28;
  const headerRowHeight = 30;

  // Table header (dark)
  page.drawRectangle({
    x: margin, y: tableTop - headerRowHeight, width: contentWidth, height: headerRowHeight, color: darkGray,
  });

  const colLabels = ["Description", "Qty", "Unit Price", "Discount", "Total"];
  let colX = margin;
  for (let i = 0; i < colLabels.length; i++) {
    drawText(page, colLabels[i], colX + 8, tableTop - headerRowHeight + 9, { font: helvBold, size: 8, color: white });
    colX += colWidths[i];
  }

  let rowY = tableTop - headerRowHeight - rowHeight;
  const items = quotation.items || [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Alternating row bg
    if (i % 2 === 0) {
      page.drawRectangle({ x: margin, y: rowY, width: contentWidth, height: rowHeight, color: rgb(0.98, 0.98, 0.99) });
    }

    const desc = String(item.description || "");
    drawText(page, desc, margin + 8, rowY + 8, { font: arabicFont, size: 9, color: nearBlack, rightAlign: hasArabic(desc), rightEdge: margin + colWidths[0] - 8 });

    drawText(page, String(Number(item.quantity)), margin + colWidths[0] + 8, rowY + 8, { font: arabicFont, size: 9 });

    drawText(page, formatCurrency(Number(item.unitPrice)), margin + colWidths[0] + colWidths[1] - 4, rowY + 8, { font: arabicFont, size: 9, rightAlign: true, rightEdge: margin + colWidths[0] + colWidths[1] + colWidths[2] - 8 });

    drawText(page, formatCurrency(Number(item.discount)), margin + colWidths[0] + colWidths[1] + colWidths[2] - 4, rowY + 8, { font: arabicFont, size: 9, rightAlign: true, rightEdge: margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] - 8 });

    drawText(page, formatCurrency(Number(item.total)), margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] - 4, rowY + 8, { font: arabicFont, size: 9, color: accentBlue, rightAlign: true, rightEdge: rightEdge - 8 });

    rowY -= rowHeight;
  }

  const tableBottom = rowY;

  // Table bottom line
  page.drawLine({ start: { x: margin, y: tableBottom }, end: { x: rightEdge, y: tableBottom }, thickness: 1, color: darkGray });
  page.drawLine({ start: { x: margin, y: tableTop }, end: { x: rightEdge, y: tableTop }, thickness: 0.5, color: lightDivider });

  // ══════════════════════════════════════════════════════
  // TOTALS BOX
  // ══════════════════════════════════════════════════════
  const summaryBoxW = contentWidth * 0.42;
  const summaryBoxX = rightEdge - summaryBoxW;
  const summaryBoxY = tableBottom - 16;
  const summaryBoxH = 90;

  page.drawRectangle({ x: summaryBoxX, y: summaryBoxY - summaryBoxH, width: summaryBoxW, height: summaryBoxH, color: white });
  page.drawRectangle({ x: summaryBoxX, y: summaryBoxY - summaryBoxH, width: summaryBoxW, height: summaryBoxH, color: rgb(0.92, 0.92, 0.94), borderColor: lightDivider, borderWidth: 1 });

  const summaryItems: { label: string; value: string; bold?: boolean }[] = [
    { label: "SUBTOTAL", value: formatCurrency(Number(quotation.totalAmount)) },
    { label: "DISCOUNT", value: formatCurrency(Number(quotation.discount)) },
  ];

  if (Number(quotation.taxRate) > 0) {
    summaryItems.push({ label: `TAX (${Number(quotation.taxRate)}%)`, value: formatCurrency(Number(quotation.taxAmount)) });
  }
  summaryItems.push({ label: "GRAND TOTAL", value: formatCurrency(Number(quotation.grandTotal)), bold: true });

  let summaryInnerY = summaryBoxY - 16;
  for (const item of summaryItems) {
    if (item.bold) {
      page.drawLine({ start: { x: summaryBoxX + 10, y: summaryInnerY + 4 }, end: { x: summaryBoxX + summaryBoxW - 10, y: summaryInnerY + 4 }, thickness: 1, color: lightDivider });
      summaryInnerY += 4;
    }
    drawText(page, item.label, summaryBoxX + 14, summaryInnerY, { font: helv, size: item.bold ? 11 : 9, color: item.bold ? nearBlack : midGray });
    drawText(page, item.value, summaryBoxX + summaryBoxW - 14, summaryInnerY, { font: helvBold, size: item.bold ? 12 : 10, color: item.bold ? nearBlack : nearBlack, rightAlign: true, rightEdge: summaryBoxX + summaryBoxW - 14 });
    summaryInnerY -= item.bold ? 24 : 20;
  }

  y = summaryBoxY - summaryBoxH - 20;

  // ══════════════════════════════════════════════════════
  // NOTES & TERMS
  // ══════════════════════════════════════════════════════
  const footerY = margin - 10;
  const footerTop = footerY + 60;
  let detailsY = Math.min(y, height - margin - 200);
  detailsY = Math.max(detailsY, footerTop);

  if (quotation.notes) {
    page.drawLine({ start: { x: margin, y: detailsY }, end: { x: rightEdge, y: detailsY }, thickness: 0.5, color: lightDivider });
    detailsY -= 16;
    drawText(page, "NOTES", margin, detailsY, { font: helvBold, size: 9, color: nearBlack });
    detailsY -= 16;
    const notesStr = String(quotation.notes);
    drawText(page, notesStr, margin + 2, detailsY, { font: arabicFont, size: 9, color: midGray, rightAlign: hasArabic(notesStr), rightEdge });
    detailsY -= 10;
  }

  if (quotation.terms) {
    page.drawLine({ start: { x: margin, y: detailsY }, end: { x: rightEdge, y: detailsY }, thickness: 0.5, color: lightDivider });
    detailsY -= 16;
    drawText(page, "TERMS & CONDITIONS", margin, detailsY, { font: helvBold, size: 9, color: nearBlack });
    detailsY -= 16;
    const termsStr = String(quotation.terms);
    drawText(page, termsStr, margin + 2, detailsY, { font: arabicFont, size: 9, color: midGray, rightAlign: hasArabic(termsStr), rightEdge });
  }

  // ══════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════
  page.drawLine({ start: { x: margin, y: footerY + 18 }, end: { x: rightEdge, y: footerY + 18 }, thickness: 1, color: lightDivider });

  drawText(page, COMPANY_INFO.name, margin, footerY + 2, { font: helvBold, size: 9, color: nearBlack });
  drawText(page, COMPANY_INFO.phone, margin, footerY - 12, { font: helv, size: 7, color: midGray });
  drawText(page, COMPANY_INFO.email, margin + 160, footerY - 12, { font: helv, size: 7, color: midGray });
  drawText(page, "truelevelproduction.com", margin + 310, footerY - 12, { font: helv, size: 7, color: midGray });

  // ══════════════════════════════════════════════════════
  // COMPANY STAMP (watermark, bottom-right corner)
  // ══════════════════════════════════════════════════════
  const stampCX = rightEdge - 70;
  const stampCY = footerY + 52;
  const stampR2 = 42;
  const stampClr = rgb(0.18, 0.18, 0.18);
  const sOp = 0.16;

  page.drawEllipse({
    x: stampCX, y: stampCY, xScale: stampR2, yScale: stampR2,
    borderColor: stampClr, borderWidth: 1.2,
    opacity: sOp, borderOpacity: sOp,
  });

  const sf = helvBold;
  const ts = 6;
  page.drawText("TRUE LEVEL", { x: stampCX - sf.widthOfTextAtSize("TRUE LEVEL", ts) / 2, y: stampCY + 9, size: ts, font: sf, color: stampClr, opacity: sOp });
  page.drawText("PRODUCTION", { x: stampCX - sf.widthOfTextAtSize("PRODUCTION", ts) / 2, y: stampCY - 1, size: ts, font: sf, color: stampClr, opacity: sOp });

  page.drawLine({ start: { x: stampCX - 20, y: stampCY - 8 }, end: { x: stampCX + 20, y: stampCY - 8 }, thickness: 0.4, color: stampClr, opacity: sOp });

  const sf2 = helv;
  page.drawText("EST. 2024", { x: stampCX - sf2.widthOfTextAtSize("EST. 2024", 5.5) / 2, y: stampCY - 16, size: 5.5, font: sf2, color: stampClr, opacity: sOp });
  page.drawText("OFFICIAL", { x: stampCX - sf2.widthOfTextAtSize("OFFICIAL", 4.5) / 2, y: stampCY - 25, size: 4.5, font: sf2, color: stampClr, opacity: sOp });
  page.drawText("DOCUMENT", { x: stampCX - sf2.widthOfTextAtSize("DOCUMENT", 4.5) / 2, y: stampCY - 31, size: 4.5, font: sf2, color: stampClr, opacity: sOp });

  return doc.save();
}
