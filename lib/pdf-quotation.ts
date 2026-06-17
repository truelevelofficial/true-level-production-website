import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

const COMPANY_INFO = {
  name: "True Level Production",
  address: "Cairo, Egypt",
  phone: "+20 100 123 4567",
  email: "info@truelevelproduction.com",
};

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ar-EG")} EGP`;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "---";
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateQuotationPdf(quotation: any): Promise<Uint8Array> {
  const fontPath = path.join(process.cwd(), "public", "fonts", "NotoNaskhArabic-Regular.ttf");
  const fontBoldPath = path.join(process.cwd(), "public", "fonts", "NotoNaskhArabic-Bold.ttf");
  const logoPath = path.join(process.cwd(), "public", "true-level-logo-black.png");

  console.log("[PDF] fontPath:", fontPath);
  console.log("[PDF] fontBoldPath:", fontBoldPath);
  console.log("[PDF] logoPath:", logoPath);

  if (!fs.existsSync(fontPath)) throw new Error(`Font not found: ${fontPath}`);
  if (!fs.existsSync(fontBoldPath)) throw new Error(`Bold font not found: ${fontBoldPath}`);
  if (!fs.existsSync(logoPath)) throw new Error(`Logo not found: ${logoPath}`);

  const fontBytes = fs.readFileSync(fontPath);
  const fontBoldBytes = fs.readFileSync(fontBoldPath);
  const logoBytes = fs.readFileSync(logoPath);

  console.log("[PDF] Font bytes loaded:", fontBytes.length);
  console.log("[PDF] Logo bytes loaded:", logoBytes.length);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const font = await doc.embedFont(fontBytes, { subset: true });
  const fontBold = await doc.embedFont(fontBoldBytes, { subset: true });

  const page = doc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;

  let y = height - margin;

  page.setFont(font);
  page.setFontSize(10);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1),
  });

  const headerRectHeight = 80;
  page.drawRectangle({
    x: 0,
    y: height - headerRectHeight,
    width,
    height: headerRectHeight,
    color: rgb(0.97, 0.97, 0.97),
  });

  if (logoBytes.length > 0) {
    try {
      const logoImage = await doc.embedPng(logoBytes);
      const logoDims = logoImage.scaleToFit(120, 60);
      page.drawImage(logoImage, {
        x: margin,
        y: height - 60 - 10,
        width: logoDims.width,
        height: logoDims.height,
      });
    } catch {
      // Logo embedding failed, continue without it
    }
  }

  page.setFont(fontBold);
  page.setFontSize(14);
  page.drawText(COMPANY_INFO.name, {
    x: width - margin - 200,
    y: height - 28,
    size: 14,
    color: rgb(0.02, 0.07, 0.12),
  });

  page.setFont(font);
  page.setFontSize(8);
  page.drawText(COMPANY_INFO.address, {
    x: width - margin - 200,
    y: height - 44,
    size: 8,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(COMPANY_INFO.phone, {
    x: width - margin - 200,
    y: height - 56,
    size: 8,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(COMPANY_INFO.email, {
    x: width - margin - 200,
    y: height - 68,
    size: 8,
    color: rgb(0.3, 0.3, 0.3),
  });

  y = height - headerRectHeight - 20;

  page.setFont(fontBold);
  page.setFontSize(20);
  page.drawText("QUOTATION", {
    x: margin,
    y: y - 20,
    size: 20,
    color: rgb(0.02, 0.07, 0.12),
  });

  y -= 50;

  const dividerColor = rgb(0.85, 0.85, 0.85);
  const labelColor = rgb(0.4, 0.4, 0.4);
  const textColor = rgb(0.02, 0.07, 0.12);
  const tableHeaderBg = rgb(0.96, 0.96, 0.96);

  const infoX = margin;
  const infoRightX = width - margin - 150;

  page.setFont(font);
  page.setFontSize(8);
  page.drawText("Quotation No", { x: infoX, y, size: 8, color: labelColor });
  page.setFont(fontBold);
  page.setFontSize(10);
  page.drawText(quotation.quotationNo || "---", { x: infoX, y: y - 14, size: 10, color: textColor });
  page.setFont(font);
  page.setFontSize(8);
  page.drawText("Issue Date", { x: infoRightX, y, size: 8, color: labelColor });
  page.setFont(fontBold);
  page.setFontSize(10);
  page.drawText(formatDate(quotation.createdAt), { x: infoRightX, y: y - 14, size: 10, color: textColor });

  y -= 40;

  page.setFont(font);
  page.setFontSize(8);
  page.drawText("Valid Until", { x: infoX, y, size: 8, color: labelColor });
  page.setFont(fontBold);
  page.setFontSize(10);
  page.drawText(formatDate(quotation.validUntil), { x: infoX, y: y - 14, size: 10, color: textColor });

  page.setFont(font);
  page.setFontSize(8);
  page.drawText("Status", { x: infoRightX, y, size: 8, color: labelColor });
  page.setFont(fontBold);
  page.setFontSize(10);
  const statusMap: Record<string, string> = {
    DRAFT: "Draft", SENT: "Sent", ACCEPTED: "Accepted",
    REJECTED: "Rejected", EXPIRED: "Expired",
  };
  page.drawText(statusMap[quotation.status] || quotation.status, { x: infoRightX, y: y - 14, size: 10, color: textColor });

  y -= 50;

  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: dividerColor });
  y -= 20;

  page.setFont(fontBold);
  page.setFontSize(11);
  page.drawText("CLIENT", { x: margin, y, size: 11, color: textColor });
  y -= 20;

  page.setFont(font);
  page.setFontSize(10);
  page.drawText(quotation.client?.fullName || "---", { x: margin, y, size: 10, color: textColor });
  y -= 16;
  if (quotation.client?.companyName) {
    page.drawText(quotation.client.companyName, { x: margin, y, size: 10, color: rgb(0.3, 0.3, 0.3) });
    y -= 16;
  }
  page.drawText(quotation.client?.phone || "---", { x: margin, y, size: 10, color: rgb(0.3, 0.3, 0.3) });
  y -= 16;
  page.drawText(quotation.client?.email || "", { x: margin, y, size: 10, color: rgb(0.3, 0.3, 0.3) });

  y -= 30;

  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: dividerColor });
  y -= 20;

  if (quotation.serviceType) {
    page.setFont(fontBold);
    page.setFontSize(11);
    page.drawText("SERVICE", { x: margin, y, size: 11, color: textColor });
    y -= 18;
    page.setFont(font);
    page.setFontSize(10);
    page.drawText(quotation.serviceType, { x: margin, y, size: 10, color: textColor });
    y -= 30;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: dividerColor });
    y -= 20;
  }

  const tableTop = y;
  const colWidths = [contentWidth * 0.4, contentWidth * 0.12, contentWidth * 0.16, contentWidth * 0.12, contentWidth * 0.2];
  const rowHeight = 22;
  const headerRowHeight = 28;

  let colX = margin;
  const headers = ["Description", "Qty", "Unit Price", "Discount", "Total"];

  page.drawRectangle({
    x: margin, y: tableTop - headerRowHeight, width: contentWidth, height: headerRowHeight,
    color: tableHeaderBg,
  });

  page.setFont(fontBold);
  page.setFontSize(8);
  colX = margin;
  for (let i = 0; i < headers.length; i++) {
    page.drawText(headers[i], { x: colX + 6, y: tableTop - headerRowHeight + 8, size: 8, color: labelColor });
    colX += colWidths[i];
  }

  let rowY = tableTop - headerRowHeight - rowHeight;
  const items = quotation.items || [];

  page.setFont(font);
  page.setFontSize(9);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i % 2 === 0) {
      page.drawRectangle({
        x: margin, y: rowY, width: contentWidth, height: rowHeight,
        color: rgb(0.99, 0.99, 0.99),
      });
    }

    colX = margin;
    page.drawText(String(item.description || ""), {
      x: colX + 6, y: rowY + 5, size: 9, color: textColor,
    });
    colX += colWidths[0];

    page.drawText(String(Number(item.quantity)), {
      x: colX + 6, y: rowY + 5, size: 9, color: textColor,
    });
    colX += colWidths[1];

    page.drawText(formatCurrency(Number(item.unitPrice)), {
      x: colX + 6, y: rowY + 5, size: 9, color: textColor,
    });
    colX += colWidths[2];

    page.drawText(formatCurrency(Number(item.discount)), {
      x: colX + 6, y: rowY + 5, size: 9, color: textColor,
    });
    colX += colWidths[3];

    page.setFont(fontBold);
    page.drawText(formatCurrency(Number(item.total)), {
      x: colX + 6, y: rowY + 5, size: 9, color: rgb(0.04, 0.48, 1),
    });
    page.setFont(font);

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
    summaryItems.push({
      label: `Tax (${Number(quotation.taxRate)}%)`,
      value: formatCurrency(Number(quotation.taxAmount)),
    });
  }

  summaryItems.push({ label: "Grand Total", value: formatCurrency(Number(quotation.grandTotal)), bold: true });

  for (const item of summaryItems) {
    if (item.bold) {
      page.drawLine({ start: { x: summaryX, y: summaryY + 2 }, end: { x: summaryX + summaryWidth, y: summaryY + 2 }, thickness: 1, color: dividerColor });
      summaryY += 6;
    }
    page.setFont(item.bold ? fontBold : font);
    page.setFontSize(item.bold ? 12 : 10);
    page.drawText(item.label, { x: summaryX, y: summaryY, size: item.bold ? 12 : 10, color: item.bold ? textColor : summaryLabelColor });
    page.drawText(item.value, { x: summaryX + summaryWidth - 80, y: summaryY, size: item.bold ? 12 : 10, color: item.bold ? rgb(0.04, 0.48, 1) : textColor });
    summaryY -= item.bold ? 22 : 18;
  }

  const detailsStartY = margin + 120;
  let detailsY = detailsStartY;

  if (quotation.notes) {
    page.drawLine({ start: { x: margin, y: detailsY }, end: { x: width - margin, y: detailsY }, thickness: 1, color: dividerColor });
    detailsY -= 16;
    page.setFont(fontBold);
    page.setFontSize(10);
    page.drawText("Notes", { x: margin, y: detailsY, size: 10, color: textColor });
    detailsY -= 16;
    page.setFont(font);
    page.setFontSize(9);
    const notesLines = wrapText(String(quotation.notes), 80);
    for (const line of notesLines) {
      page.drawText(line, { x: margin, y: detailsY, size: 9, color: rgb(0.3, 0.3, 0.3) });
      detailsY -= 14;
    }
    detailsY -= 10;
  }

  if (quotation.terms) {
    page.drawLine({ start: { x: margin, y: detailsY }, end: { x: width - margin, y: detailsY }, thickness: 1, color: dividerColor });
    detailsY -= 16;
    page.setFont(fontBold);
    page.setFontSize(10);
    page.drawText("Terms & Conditions", { x: margin, y: detailsY, size: 10, color: textColor });
    detailsY -= 16;
    page.setFont(font);
    page.setFontSize(9);
    const termsLines = wrapText(String(quotation.terms), 80);
    for (const line of termsLines) {
      page.drawText(line, { x: margin, y: detailsY, size: 9, color: rgb(0.3, 0.3, 0.3) });
      detailsY -= 14;
    }
  }

  const footerY = margin - 10;
  page.drawLine({ start: { x: margin, y: footerY + 10 }, end: { x: width - margin, y: footerY + 10 }, thickness: 1, color: dividerColor });

  page.setFont(font);
  page.setFontSize(8);
  page.drawText("Thank you for your business!", {
    x: margin, y: footerY - 4, size: 8, color: rgb(0.3, 0.3, 0.3),
  });

  page.setFont(fontBold);
  page.setFontSize(8);
  page.drawText(COMPANY_INFO.name, {
    x: margin, y: footerY - 18, size: 8, color: textColor,
  });
  page.setFont(font);
  page.drawText(`${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, {
    x: margin + 120, y: footerY - 18, size: 8, color: rgb(0.3, 0.3, 0.3),
  });

  return doc.save();
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const lines: string[] = [];
  const words = text.split(" ");
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
}
