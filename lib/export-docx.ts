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

  const sigPar = (text: string, bold = false) =>
    new Paragraph({
      children: [new TextRun({ text, bold, size: 22, font: "Calibri" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 160, line: 360 },
    });

  children.push(
    new Paragraph({ spacing: { before: 600 } }),
    sigPar("التوقيعات", true),
    new Paragraph({ spacing: { before: 300 } }),
    sigPar("الطرف الأول:"),
    sigPar("True Level Production"),
    sigPar("الاسم: _______________"),
    sigPar("الصفة: ممثل الشركة"),
    sigPar("التوقيع: _______________"),
    sigPar("التاريخ: ___/___/20___"),
    new Paragraph({ spacing: { before: 300 } }),
    sigPar("الطرف الثاني:"),
    sigPar("الاسم: _______________"),
    sigPar("الصفة: _______________"),
    sigPar("التوقيع: _______________"),
    sigPar("التاريخ: ___/___/20___"),
    new Paragraph({ spacing: { before: 300 } }),
    sigPar("حرر هذا العقد من نسختين، تسلم كل طرف نسخة واحدة للعمل بموجبه.")
  );

  const doc = new Document({
    title,
    creator: "True Level Production",
    description: title,
    sections: [{ children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
