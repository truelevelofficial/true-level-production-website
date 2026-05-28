import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType } from "docx";

export async function generateInvoiceDocx(invoice: any, settings: Record<string, string>) {
  const children: (Paragraph | Table)[] = [];

  const p = (text: string, bold = false, size = 22, spacing = 200) =>
    new Paragraph({ children: [new TextRun({ text, bold, size, font: "Calibri" })], alignment: AlignmentType.RIGHT, spacing: { after: spacing, line: 360 } });

  const emptyP = (spacing = 200) => new Paragraph({ spacing: { after: spacing } });

  children.push(
    p(`فاتورة ضريبية - ${invoice.invoiceNo}`, true, 32, 400),
    emptyP(),
    p(`رقم الفاتورة: ${invoice.invoiceNo}`),
    p(`تاريخ الفاتورة: ${new Date(invoice.invoiceDate).toLocaleDateString("ar-EG")}`),
    p(`تاريخ الاستحقاق: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("ar-EG") : "---"}`),
    p(`العملة: ${invoice.currency}`),
    emptyP(400),
    p("فاتورة إلى:", true, 24),
    p(`الاسم: ${invoice.client.fullName}`),
    ...(invoice.client.companyName ? [p(`الشركة: ${invoice.client.companyName}`)] : []),
    p(`الهاتف: ${invoice.client.phone}`),
    ...(invoice.client.address ? [p(`العنوان: ${invoice.client.address}`)] : []),
    emptyP(400),
  );

  const headerRow = new TableRow({
    tableHeader: true,
    children: ["الوصف", "الكمية", "سعر الوحدة", "الخصم", "الإجمالي"].map((text) =>
      new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, font: "Calibri" })], alignment: AlignmentType.RIGHT })] })
    ),
  });

  const dataRows = (invoice.items || []).map((item: any) =>
    new TableRow({
      children: [item.description, String(Number(item.quantity)), `${Number(item.unitPrice).toLocaleString()} EGP`, `${Number(item.discount).toLocaleString()} EGP`, `${Number(item.total).toLocaleString()} EGP`].map((text) =>
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: "Calibri" })], alignment: AlignmentType.RIGHT })] })
      ),
    })
  );

  children.push(
    new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
    emptyP(300),
    p(`الإجمالي قبل الخصم: ${Number(invoice.subtotal).toLocaleString()} ${invoice.currency}`, false, 22, 160),
    p(`الخصم: ${Number(invoice.discount).toLocaleString()} ${invoice.currency}`, false, 22, 160),
    p(`الضريبة (${Number(invoice.taxRate)}%): ${Number(invoice.taxAmount).toLocaleString()} ${invoice.currency}`, false, 22, 160),
    p(`الإجمالي النهائي: ${Number(invoice.total).toLocaleString()} ${invoice.currency}`, true, 26, 300),
    p(`المبلغ المدفوع: ${Number(invoice.paidAmount).toLocaleString()} ${invoice.currency}`, false, 22, 160),
    p(`المبلغ المتبقي: ${Number(invoice.remainingAmount).toLocaleString()} ${invoice.currency}`, false, 22, 300),
    ...(invoice.notes ? [p(`ملاحظات: ${invoice.notes}`, false, 20, 160)] : []),
    ...(invoice.terms ? [p(`الشروط: ${invoice.terms}`, false, 20, 160)] : []),
    emptyP(400),
    p("التوقيعات:", true, 24),
    emptyP(),
    p("الطرف الأول:"),
    p(settings.companyLegalName || "True Level Production"),
    p("التوقيع: _______________"),
    p("التاريخ: ___/___/20___"),
    emptyP(200),
    p("الطرف الثاني:"),
    p(invoice.client.fullName),
    ...(invoice.client.companyName ? [p(`ممثل: ${invoice.client.companyName}`)] : []),
    p("التوقيع: _______________"),
    p("التاريخ: ___/___/20___"),
  );

  const doc = new Document({
    title: `فاتورة ${invoice.invoiceNo}`,
    creator: settings.companyName || "True Level Production",
    description: `فاتورة ${invoice.invoiceNo}`,
    sections: [{ children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}
