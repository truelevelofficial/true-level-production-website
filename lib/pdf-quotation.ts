import { PDFDocument, rgb, PageSizes, StandardFonts, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

const COMPANY_INFO = {
  name: "True Level Production",
  phone: "01143331405",
  address1: "1ج عمارات الفاروقيه، جسر السويس، النزهة، القاهرة",
  address2: "الدور ٤، شقة 406",
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

  const infoData: { label: string; value: string }[][] = [
    [
      { label: "QUOTATION NO", value: quotation.quotationNo || "---" },
      { label: "ISSUE DATE", value: formatDate(quotation.createdAt) },
    ],
    [
      { label: "VALID UNTIL", value: formatDate(quotation.validUntil) },
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
  const clientSectionTop = y;
  const clientSectionBgH = 80;
  page.drawRectangle({ x: margin, y: y - clientSectionBgH, width: contentWidth, height: clientSectionBgH, color: cardBg });

  drawText(page, "CLIENT", margin, y - 6, { font: helvBold, size: 11, color: nearBlack });
  page.drawLine({ start: { x: margin, y: y - 16 }, end: { x: margin + 40, y: y - 16 }, thickness: 2, color: accentBlue });

  y -= 30;

  const clientDisplayName = quotation.client?.fullName || quotation.client?.companyName || "---";
  drawText(page, clientDisplayName, margin, y, { font: arabicFont, size: 12, color: nearBlack, rightAlign: hasArabic(clientDisplayName), rightEdge });
  y -= 18;

  drawText(page, quotation.client?.phone || "---", margin, y, { font: arabicFont, size: 10, color: midGray });

  y = clientSectionTop - clientSectionBgH - 16;

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
  const summaryBoxH = 120;
  const summaryPad = 18;

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

  let summaryInnerY = summaryBoxY - summaryPad;
  for (const item of summaryItems) {
    if (item.bold) {
      page.drawLine({ start: { x: summaryBoxX + 12, y: summaryInnerY + 6 }, end: { x: summaryBoxX + summaryBoxW - 12, y: summaryInnerY + 6 }, thickness: 1.2, color: lightDivider });
      summaryInnerY += 6;
    }
    drawText(page, item.label, summaryBoxX + 16, summaryInnerY, { font: helv, size: item.bold ? 13 : 9, color: item.bold ? nearBlack : midGray });
    drawText(page, item.value, summaryBoxX + summaryBoxW - 16, summaryInnerY, { font: helvBold, size: item.bold ? 14 : 10, color: nearBlack, rightAlign: true, rightEdge: summaryBoxX + summaryBoxW - 16 });
    summaryInnerY -= item.bold ? 30 : 22;
  }

  y = summaryBoxY - summaryBoxH - 20;

  // ══════════════════════════════════════════════════════
  // NOTES & TERMS
  // ══════════════════════════════════════════════════════
  const footerY = margin;
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
  drawText(page, COMPANY_INFO.phone, margin, footerY - 12, { font: helv, size: 8, color: midGray });
  drawText(page, COMPANY_INFO.address1, margin, footerY - 26, { font: arabicFont, size: 8, color: midGray, rightAlign: hasArabic(COMPANY_INFO.address1), rightEdge });
  drawText(page, COMPANY_INFO.address2, margin, footerY - 40, { font: arabicFont, size: 8, color: midGray, rightAlign: hasArabic(COMPANY_INFO.address2), rightEdge });

  // ══════════════════════════════════════════════════════
  // COMPANY SEAL (logo stamp, bottom-right corner)
  // ══════════════════════════════════════════════════════
  const sealCX = rightEdge - 72;
  const sealCY = footerY + 48;
  const sealR = 50;
  const sealClr = rgb(0.15, 0.15, 0.15);
  const sealOp = 0.2;
  const sealRot = 5;

  const rotP2 = (x: number, y: number): { x: number; y: number } => {
    const rad = (sealRot * Math.PI) / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    const dx = x - sealCX, dy = y - sealCY;
    return { x: sealCX + dx * c - dy * s, y: sealCY + dx * s + dy * c };
  };

  // Outer circle — stamp ring border
  page.drawEllipse({
    x: sealCX, y: sealCY, xScale: sealR, yScale: sealR,
    borderColor: sealClr, borderWidth: 1.5,
    opacity: sealOp, borderOpacity: sealOp,
    rotate: degrees(sealRot),
  });

  // Inner circle — double-ring effect for realistic seal look
  page.drawEllipse({
    x: sealCX, y: sealCY, xScale: sealR - 4, yScale: sealR - 4,
    borderColor: sealClr, borderWidth: 0.8,
    opacity: sealOp, borderOpacity: sealOp,
    rotate: degrees(sealRot),
  });

  // Logo as the seal artwork (centered within the ring)
  if (logoImage) {
    const sealLogoDims = logoImage.scaleToFit(72, 72);
    const slp = rotP2(sealCX - sealLogoDims.width / 2, sealCY - sealLogoDims.height / 2);
    page.drawImage(logoImage, {
      x: slp.x, y: slp.y,
      width: sealLogoDims.width,
      height: sealLogoDims.height,
      opacity: sealOp,
    });
  }

  // Subtle ink texture (deterministic pattern for distressed-rubber effect)
  const inkDots2: [number, number][] = [[-14,-9],[11,5],[-5,16],[18,-8],[-12,-18],[8,-15],[-20,7],[15,-12],[-7,-5],[5,-18],[-18,-3],[3,11],[-9,13],[13,-3],[-3,-13],[16,9],[-16,1],[1,14],[9,-7],[-9,3]];
  for (const [dx, dy] of inkDots2) {
    const dp = rotP2(sealCX + dx, sealCY + dy);
    page.drawEllipse({ x: dp.x, y: dp.y, xScale: 0.7, yScale: 0.7, color: sealClr, opacity: 0.05 });
  }

  return doc.save();
}
