import { PDFDocument, rgb, PageSizes } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

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

const PAGE_W = PageSizes.A4[0];
const PAGE_H = PageSizes.A4[1];
const MARGIN_T = 50;
const MARGIN_B = 56;
const MARGIN_L = 44;
const MARGIN_R = 44;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
const RIGHT_X = PAGE_W - MARGIN_R;

const HEADER_Y = PAGE_H - MARGIN_T;
const FOOTER_Y = MARGIN_B;

const C = {
  black: rgb(0.04, 0.04, 0.04),
  gray: rgb(0.3, 0.3, 0.3),
  midGray: rgb(0.5, 0.5, 0.5),
  lightGray: rgb(0.75, 0.75, 0.75),
  divider: rgb(0.85, 0.85, 0.85),
  darkDivider: rgb(0.06, 0.06, 0.06),
};

const FONT_SIZES = {
  title: 17,
  sectionTitle: 13,
  body: 10,
  meta: 8,
  footer: 7,
  sigHeading: 14,
  sigParty: 11,
  sigText: 9,
};

const LINE_H = {
  body: 17,
  sig: 14,
};

interface SectionInfo {
  title: string;
  lines: string[];
}

function parseBody(body: string): SectionInfo[] {
  const parts = body.split(/\n\s*=+\s*\n/).filter(Boolean);
  return parts
    .map((p) => {
      const t = p.trim();
      const lines = t.split("\n").filter(Boolean);
      const first = lines[0] || "";
      return {
        title: first.replace(":", "").trim(),
        lines: lines.slice(1),
      };
    })
    .filter((s) => s.title || s.lines.length > 0);
}

function wrapText(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number,
): string[] {
  if (!text.trim()) return [""];
  const shaped = shapeText(text);
  const words = shaped.split(" ");
  const result: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth || !cur) {
      cur = test;
    } else {
      result.push(cur);
      cur = w;
    }
  }
  if (cur) result.push(cur);
  return result;
}

function drawLine(
  page: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: any,
  thickness: number,
) {
  page.drawLine({
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    thickness,
    color,
  });
}

function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  opts: {
    font?: any;
    size?: number;
    color?: any;
    rightAlign?: boolean;
  } = {},
) {
  const { font, size = 10, color = C.black, rightAlign = false } = opts;
  const display = shapeText(text);
  if (font) page.setFont(font);
  page.setFontSize(size);
  let drawX = x;
  if (rightAlign && font) {
    drawX = RIGHT_X - font.widthOfTextAtSize(display, size);
  }
  page.drawText(display, { x: drawX, y, size, color });
}

function drawFooter(
  page: any,
  pageNum: number,
  totalPages: number,
  font: any,
  dateStr: string,
) {
  const fy = FOOTER_Y + 4;
  drawLine(page, MARGIN_L, fy + 14, RIGHT_X, fy + 14, C.divider, 0.6);
  drawText(page, "True Level Production", MARGIN_L, fy, {
    font,
    size: FONT_SIZES.footer,
    color: C.midGray,
  });
  drawText(page, `${pageNum} / ${totalPages}`, RIGHT_X, fy, {
    font,
    size: FONT_SIZES.footer,
    color: C.midGray,
    rightAlign: true,
  });
}

interface ContractPdfInput {
  title: string;
  body: string;
  clientName: string;
  clientCompanyName?: string | null;
  contractNumber?: string;
  createdAt?: string;
}

export async function generateContractPdf(
  input: ContractPdfInput,
): Promise<Uint8Array> {
  const logoPath = path.join(process.cwd(), "public", "true-level-logo-black.png");
  if (!fs.existsSync(logoPath)) throw new Error(`Logo not found: ${logoPath}`);
  const logoBytes = fs.readFileSync(logoPath);

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansArabic-Regular.ttf",
  );
  if (!fs.existsSync(fontPath)) throw new Error(`Font not found: ${fontPath}`);
  const fontBytes = fs.readFileSync(fontPath);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const arabicFont = await doc.embedFont(fontBytes, { subset: true });
  // Use the same font for bold – we'll render at a slightly larger size
  // since NotoSansArabic has a single weight in our file.

  const page = doc.addPage(PageSizes.A4);
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: rgb(1, 1, 1),
  });

  let logoImage: any;
  try {
    logoImage = await doc.embedPng(logoBytes);
  } catch {
    // continue without logo
  }

  // ── Parse content ──
  const sections = parseBody(input.body);

  // ── Layout tracking ──
  const pages: any[] = [page];
  let currentPage = page;
  let cursorY = HEADER_Y;

  function addPage() {
    const p = doc.addPage(PageSizes.A4);
    p.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_W,
      height: PAGE_H,
      color: rgb(1, 1, 1),
    });
    pages.push(p);
    currentPage = p;
    cursorY = HEADER_Y;
  }

  function checkSpace(needed: number) {
    if (cursorY - needed < FOOTER_Y + 36) {
      addPage();
    }
  }

  // ── Draw header (logo + meta) on first page ──
  if (logoImage) {
    const logoDims = logoImage.scaleToFit(110, 50);
    const logoY = HEADER_Y - logoDims.height + 4;
    currentPage.drawImage(logoImage, {
      x: RIGHT_X - logoDims.width,
      y: logoY,
      width: logoDims.width,
      height: logoDims.height,
    });
    drawText(currentPage, "True Level Production", RIGHT_X, logoY - 10, {
      font: arabicFont,
      size: 6,
      color: C.midGray,
      rightAlign: true,
    });
  }

  const metaLines = [
    input.contractNumber ? `رقم العقد: ${input.contractNumber}` : "",
    input.createdAt
      ? `التاريخ: ${new Date(input.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}`
      : "",
  ].filter(Boolean);
  for (let mi = 0; mi < metaLines.length; mi++) {
    drawText(currentPage, metaLines[mi], MARGIN_L, HEADER_Y - 12 - mi * 13, {
      font: arabicFont,
      size: FONT_SIZES.meta,
      color: C.midGray,
    });
  }

  // header separator
  const headerLineY = HEADER_Y - 48;
  drawLine(currentPage, MARGIN_L, headerLineY, RIGHT_X, headerLineY, C.darkDivider, 1.2);

  cursorY = headerLineY - 24;

  // ── Contract title ──
  checkSpace(50);
  drawText(currentPage, input.title, MARGIN_L, cursorY, {
    font: arabicFont,
    size: FONT_SIZES.title,
    color: C.black,
  });
  cursorY -= FONT_SIZES.title + 14;
  drawLine(currentPage, MARGIN_L + 60, cursorY, RIGHT_X - 60, cursorY, C.divider, 0.5);
  cursorY -= 20;

  // ── Draw body sections ──
  for (const section of sections) {
    // Section title
    if (section.title && section.title !== input.title) {
      checkSpace(40 + (section.lines.length || 1) * LINE_H.body);
      drawText(currentPage, section.title, MARGIN_L, cursorY, {
        font: arabicFont,
        size: FONT_SIZES.sectionTitle,
        color: C.black,
      });
      const titleW =
        arabicFont.widthOfTextAtSize(shapeText(section.title), FONT_SIZES.sectionTitle);
      const ulY = cursorY - 2;
      drawLine(currentPage, MARGIN_L, ulY, MARGIN_L + Math.min(titleW + 20, CONTENT_W * 0.6), ulY, C.darkDivider, 0.8);
      cursorY -= FONT_SIZES.sectionTitle + 10;
    }

    // Section body lines
    for (const rawLine of section.lines) {
      const wrapped = wrapText(rawLine, arabicFont, FONT_SIZES.body, CONTENT_W);
      for (const wl of wrapped) {
        checkSpace(LINE_H.body);
        drawText(currentPage, wl, MARGIN_L, cursorY, {
          font: arabicFont,
          size: FONT_SIZES.body,
          color: C.black,
          rightAlign: true,
        });
        cursorY -= LINE_H.body;
      }
    }

    // spacing between sections
    cursorY -= 6;
  }

  // ── Closing sentence + Signatures ──
  checkSpace(200);

  // closing line and sentence
  drawLine(currentPage, MARGIN_L, cursorY, RIGHT_X, cursorY, C.darkDivider, 1.2);
  cursorY -= 14;
  drawText(currentPage, "حرر هذا العقد من نسختين أصليتين، تسلم كل طرف نسخة للعمل بموجبها.", RIGHT_X, cursorY, {
    font: arabicFont,
    size: 11,
    color: C.black,
    rightAlign: true,
  });
  cursorY -= 26;

  // signatures
  drawText(currentPage, "التوقيعات", RIGHT_X, cursorY, {
    font: arabicFont,
    size: FONT_SIZES.sigHeading,
    color: C.black,
    rightAlign: true,
  });
  cursorY -= 20;

  // two-column layout for signatures (right-aligned: first party on right)
  const midX = MARGIN_L + CONTENT_W / 2;
  drawLine(currentPage, midX, cursorY + 6, midX, cursorY - 130, C.divider, 0.8);

  const rightColX_R = RIGHT_X;
  const rightColW_R = CONTENT_W / 2 - 12;
  const leftColX_R = midX + 12;

  const sigCols = [
    {
      x: rightColX_R,
      w: rightColW_R,
      right: true,
      party: "الطرف الأول",
      company: "True Level Production",
      fields: [
        ["الاسم:", "______________________"],
        ["الصفة:", "ممثل الشركة"],
        ["التوقيع:", "______________________"],
        ["التاريخ:", "____ / ____ / 20__"],
        ["الختم:", "______________________"],
      ],
    },
    {
      x: leftColX_R,
      w: rightColW_R,
      right: false,
      party: "الطرف الثاني",
      company: input.clientCompanyName || input.clientName,
      fields: [
        ["الاسم:", input.clientName],
        ["الصفة:", input.clientCompanyName ? `ممثل ${input.clientCompanyName}` : "عميل"],
        ["التوقيع:", "______________________"],
        ["التاريخ:", "____ / ____ / 20__"],
        ["الختم:", "______________________"],
      ],
    },
  ];

  for (const col of sigCols) {
    let colY = cursorY;
    drawText(currentPage, col.party, col.x, colY, {
      font: arabicFont,
      size: FONT_SIZES.sigParty,
      color: C.black,
      rightAlign: col.right,
    });
    colY -= 16;
    drawText(currentPage, col.company, col.x, colY, {
      font: arabicFont,
      size: 10,
      color: C.gray,
      rightAlign: col.right,
    });
    colY -= 18;

    for (const [label, value] of col.fields) {
      if (col.right) {
        // right-aligned: label then value
        const labelW = arabicFont.widthOfTextAtSize(shapeText(label), FONT_SIZES.sigText);
        const valueX = col.x - labelW - 2;
        drawText(currentPage, label, valueX, colY, {
          font: arabicFont,
          size: FONT_SIZES.sigText,
          color: C.black,
        });
        drawText(currentPage, value, col.x, colY, {
          font: arabicFont,
          size: FONT_SIZES.sigText,
          color: C.black,
          rightAlign: true,
        });
      } else {
        const labelW = arabicFont.widthOfTextAtSize(shapeText(label), FONT_SIZES.sigText);
        drawText(currentPage, label, col.x, colY, {
          font: arabicFont,
          size: FONT_SIZES.sigText,
          color: C.black,
        });
        drawText(currentPage, value, col.x + labelW + 4, colY, {
          font: arabicFont,
          size: FONT_SIZES.sigText,
          color: C.black,
        });
      }
      colY -= 16;
    }
  }

  // ── Draw footers on all pages ──
  const dateStr = input.createdAt
    ? new Date(input.createdAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const num = i + 1;
    drawFooter(p, num, pages.length, arabicFont, dateStr);
  }

  return doc.save();
}
