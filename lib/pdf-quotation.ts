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

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });

  const headerRectHeight = 80;
  page.drawRectangle({
    x: 0, y: height - headerRectHeight, width, height: headerRectHeight, color: rgb(0.97, 0.97, 0.97),
  });

  try {
    const logoImage = await doc.embedPng(logoBytes);
    const logoDims = logoImage.scaleToFit(120, 60);
    page.drawImage(logoImage, { x: margin, y: height - 60 - 10, width: logoDims.width, height: logoDims.height });
  } catch { /* continue without logo */ }

  drawText(page, COMPANY_INFO.name, width - margin - 200, height - 28, { font: arabicFont, size: 14, rightAlign: true, rightEdge: width - margin });
  drawText(page, COMPANY_INFO.address, width - margin - 200, height - 44, { font: arabicFont, size: 8, color: rgb(0.3, 0.3, 0.3), rightAlign: true, rightEdge: width - margin });
  drawText(page, COMPANY_INFO.phone, width - margin - 200, height - 56, { font: arabicFont, size: 8, color: rgb(0.3, 0.3, 0.3), rightAlign: true, rightEdge: width - margin });
  drawText(page, COMPANY_INFO.email, width - margin - 200, height - 68, { font: arabicFont, size: 8, color: rgb(0.3, 0.3, 0.3), rightAlign: true, rightEdge: width - margin });

  let y = height - headerRectHeight - 20;

  drawText(page, "QUOTATION", margin, y - 20, { font: helvBold, size: 20 });

  y -= 50;

  const dividerColor = rgb(0.85, 0.85, 0.85);
  const labelColor = rgb(0.4, 0.4, 0.4);
  const textColor = rgb(0.02, 0.07, 0.12);
  const tableHeaderBg = rgb(0.96, 0.96, 0.96);

  const infoX = margin;
  const infoRightX = width - margin - 150;

  drawText(page, "Quotation No", infoX, y, { font: arabicFont, size: 8, color: labelColor });
  drawText(page, quotation.quotationNo || "---", infoX, y - 14, { font: arabicFont, size: 10 });

  drawText(page, "Issue Date", infoRightX, y, { font: arabicFont, size: 8, color: labelColor });
  drawText(page, formatDate(quotation.createdAt), infoRightX, y - 14, { font: arabicFont, size: 10, rightAlign: hasArabic(formatDate(quotation.createdAt)), rightEdge: infoRightX + 150 });

  y -= 40;

  drawText(page, "Valid Until", infoX, y, { font: arabicFont, size: 8, color: labelColor });
  drawText(page, formatDate(quotation.validUntil), infoX, y - 14, { font: arabicFont, size: 10 });

  drawText(page, "Status", infoRightX, y, { font: arabicFont, size: 8, color: labelColor });
  const statusMap: Record<string, string> = {
    DRAFT: "Draft", SENT: "Sent", ACCEPTED: "Accepted",
    REJECTED: "Rejected", EXPIRED: "Expired",
  };
  drawText(page, statusMap[quotation.status] || quotation.status, infoRightX, y - 14, { font: arabicFont, size: 10 });

  y -= 50;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: dividerColor });
  y -= 20;

  drawText(page, "CLIENT", margin, y, { font: helvBold, size: 11 });
  y -= 20;

  const clientName = quotation.client?.fullName || "---";
  drawText(page, clientName, margin, y, { font: arabicFont, size: 10, rightAlign: hasArabic(clientName), rightEdge });
  y -= 16;

  if (quotation.client?.companyName) {
    drawText(page, quotation.client.companyName, margin, y, { font: arabicFont, size: 10, color: rgb(0.3, 0.3, 0.3), rightAlign: hasArabic(quotation.client.companyName), rightEdge });
    y -= 16;
  }
  drawText(page, quotation.client?.phone || "---", margin, y, { font: arabicFont, size: 10, color: rgb(0.3, 0.3, 0.3) });
  y -= 16;
  drawText(page, quotation.client?.email || "", margin, y, { font: arabicFont, size: 10, color: rgb(0.3, 0.3, 0.3) });

  y -= 30;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: dividerColor });
  y -= 20;

  if (quotation.serviceType) {
    drawText(page, "SERVICE", margin, y, { font: helvBold, size: 11 });
    y -= 18;
    drawText(page, quotation.serviceType, margin, y, { font: arabicFont, size: 10, rightAlign: hasArabic(quotation.serviceType), rightEdge });
    y -= 30;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: dividerColor });
    y -= 20;
  }

  const tableTop = y;
  const colWidths = [contentWidth * 0.4, contentWidth * 0.12, contentWidth * 0.16, contentWidth * 0.12, contentWidth * 0.2];
  const rowHeight = 22;
  const headerRowHeight = 28;

  page.drawRectangle({
    x: margin, y: tableTop - headerRowHeight, width: contentWidth, height: headerRowHeight, color: tableHeaderBg,
  });

  let colX = margin;
  const headers = ["Description", "Qty", "Unit Price", "Discount", "Total"];
  for (let i = 0; i < headers.length; i++) {
    drawText(page, headers[i], colX + 6, tableTop - headerRowHeight + 8, { font: helvBold, size: 8, color: labelColor });
    colX += colWidths[i];
  }

  let rowY = tableTop - headerRowHeight - rowHeight;
  const items = quotation.items || [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i % 2 === 0) {
      page.drawRectangle({
        x: margin, y: rowY, width: contentWidth, height: rowHeight, color: rgb(0.99, 0.99, 0.99),
      });
    }

    const desc = String(item.description || "");
    drawText(page, desc, margin + 6, rowY + 5, { font: arabicFont, size: 9, rightAlign: hasArabic(desc), rightEdge: margin + colWidths[0] - 6 });
    drawText(page, String(Number(item.quantity)), margin + colWidths[0] + 6, rowY + 5, { font: arabicFont, size: 9 });
    drawText(page, formatCurrency(Number(item.unitPrice)), margin + colWidths[0] + colWidths[1] + 6, rowY + 5, { font: arabicFont, size: 9 });
    drawText(page, formatCurrency(Number(item.discount)), margin + colWidths[0] + colWidths[1] + colWidths[2] + 6, rowY + 5, { font: arabicFont, size: 9 });
    drawText(page, formatCurrency(Number(item.total)), margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 6, rowY + 5, { font: arabicFont, size: 9, color: rgb(0.04, 0.48, 1) });

    rowY -= rowHeight;
  }

  const tableBottom = rowY;
  page.drawLine({ start: { x: margin, y: tableTop }, end: { x: width - margin, y: tableTop }, thickness: 1, color: dividerColor });
  page.drawLine({ start: { x: margin, y: tableBottom }, end: { x: width - margin, y: tableBottom }, thickness: 1, color: dividerColor });

  const summaryX = width - margin - 180;
  const summaryWidth = 180;
  const summaryStartY = tableBottom - 10;
  let summaryY = summaryStartY;

  const summaryLabelColor = rgb(0.4, 0.4, 0.4);

  const summaryItems: { label: string; value: string; bold?: boolean }[] = [
    { label: "Subtotal", value: formatCurrency(Number(quotation.totalAmount)) },
    { label: "Discount", value: formatCurrency(Number(quotation.discount)) },
  ];

  if (Number(quotation.taxRate) > 0) {
    summaryItems.push({ label: `Tax (${Number(quotation.taxRate)}%)`, value: formatCurrency(Number(quotation.taxAmount)) });
  }
  summaryItems.push({ label: "Grand Total", value: formatCurrency(Number(quotation.grandTotal)), bold: true });

  for (const item of summaryItems) {
    if (item.bold) {
      page.drawLine({ start: { x: summaryX, y: summaryY + 2 }, end: { x: summaryX + summaryWidth, y: summaryY + 2 }, thickness: 1, color: dividerColor });
      summaryY += 6;
    }
    drawText(page, item.label, summaryX, summaryY, { font: arabicFont, size: item.bold ? 12 : 10, color: item.bold ? textColor : summaryLabelColor });
    drawText(page, item.value, summaryX + summaryWidth - 80, summaryY, { font: arabicFont, size: item.bold ? 12 : 10, color: item.bold ? rgb(0.04, 0.48, 1) : textColor, rightAlign: true, rightEdge: summaryX + summaryWidth });
    summaryY -= item.bold ? 22 : 18;
  }

  const footerY = margin - 10;
  const footerTop = footerY + 40;
  let detailsY = Math.min(summaryY - 20, height - margin - 200);
  detailsY = Math.max(detailsY, footerTop);

  if (quotation.notes) {
    page.drawLine({ start: { x: margin, y: detailsY }, end: { x: width - margin, y: detailsY }, thickness: 1, color: dividerColor });
    detailsY -= 16;
    drawText(page, "Notes", margin, detailsY, { font: helvBold, size: 10 });
    detailsY -= 16;
    const notesStr = String(quotation.notes);
    drawText(page, notesStr, margin, detailsY, { font: arabicFont, size: 9, color: rgb(0.3, 0.3, 0.3), rightAlign: hasArabic(notesStr), rightEdge });
    detailsY -= 10;
  }

  if (quotation.terms) {
    page.drawLine({ start: { x: margin, y: detailsY }, end: { x: width - margin, y: detailsY }, thickness: 1, color: dividerColor });
    detailsY -= 16;
    drawText(page, "Terms & Conditions", margin, detailsY, { font: helvBold, size: 10 });
    detailsY -= 16;
    const termsStr = String(quotation.terms);
    drawText(page, termsStr, margin, detailsY, { font: arabicFont, size: 9, color: rgb(0.3, 0.3, 0.3), rightAlign: hasArabic(termsStr), rightEdge });
  }

  const footerLineY = footerY + 10;
  page.drawLine({ start: { x: margin, y: footerLineY }, end: { x: width - margin, y: footerLineY }, thickness: 1, color: dividerColor });

  drawText(page, "Thank you for your business!", margin, footerY - 4, { font: arabicFont, size: 8, color: rgb(0.3, 0.3, 0.3) });
  drawText(page, COMPANY_INFO.name, margin, footerY - 18, { font: arabicFont, size: 8 });
  drawText(page, `${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, margin + 120, footerY - 18, { font: arabicFont, size: 8, color: rgb(0.3, 0.3, 0.3) });

  return doc.save();
}
