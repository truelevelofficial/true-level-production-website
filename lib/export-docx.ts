import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";

export async function generateContractDocx(title: string, body: string) {
  const lines = body.split("\n").filter((l) => l.trim());
  const children = lines.map((line) => {
    const trimmed = line.trim();
    const isHead = trimmed.includes(":") && trimmed.length < 80;
    return new Paragraph({
      children: [new TextRun({ text: trimmed, bold: isHead, size: 22, font: "Calibri" })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 200 },
    });
  });
  const doc = new Document({
    title,
    creator: "True Level Production",
    description: title,
    sections: [{ children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
