import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";

export async function generateContractDocx(title: string, body: string) {
  const lines = body.split("\n").filter((l) => l.trim());
  const children = lines.map((line) => {
    const trimmed = line.trim();
    const isHead = trimmed.includes(":") && trimmed.length < 80;
    return new Paragraph({
      children: [new TextRun({ text: trimmed, bold: isHead, size: 22, font: "Calibri" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200, line: 360 },
    });
  });

  children.push(
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      children: [new TextRun({ text: "حرر هذا العقد من نسختين أصليتين، تسلم كل طرف نسخة للعمل بموجبها.", bold: true, size: 22, font: "Calibri" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200, line: 360 },
    }),
  );

  const sigPar = (text: string, bold = false) =>
    new Paragraph({
      children: [new TextRun({ text, bold, size: 22, font: "Calibri" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 140, line: 360 },
    });

  children.push(
    new Paragraph({ spacing: { before: 400 } }),
    sigPar("التوقيعات", true),
    new Paragraph({ spacing: { before: 200 } }),
    sigPar("الطرف الأول:"),
    sigPar("True Level Production"),
    sigPar("الاسم: عبدالرحمن محمد"),
    sigPar("__________________________________"),
    sigPar("الصفة: ممثل الشركة"),
    sigPar("التوقيع: ______________________"),
    new Paragraph({ spacing: { before: 120 } }),
    new Paragraph({ spacing: { before: 100 } }),
    sigPar("[الختم الرسمي]"),
    new Paragraph({ spacing: { before: 120 } }),
    sigPar("التاريخ: ____ / ____ / 20__"),
    new Paragraph({ spacing: { before: 300 } }),
    sigPar("الطرف الثاني:"),
    sigPar("الاسم: ______________________"),
    sigPar("الصفة: ______________________"),
    sigPar("التوقيع: ______________________"),
    sigPar("التاريخ: ____ / ____ / 20__"),
    sigPar("الختم: ______________________"),
  );

  const doc = new Document({
    title,
    creator: "True Level Production",
    description: title,
    sections: [{ children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
