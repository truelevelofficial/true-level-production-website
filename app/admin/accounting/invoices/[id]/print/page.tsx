import { getInvoiceById, getCompanySettings } from "@/lib/admin-data";

function statusStyle(status: string) {
  if (status === "DRAFT") return { background: "#fef3c7", color: "#92400e" };
  if (status === "SENT") return { background: "#dbeafe", color: "#1d4ed8" };
  return { background: "#dcfce7", color: "#166534" };
}

function statusLabel(status: string) {
  if (status === "DRAFT") return "مسودة";
  if (status === "SENT") return "مرسلة";
  if (status === "PAID") return "مدفوعة";
  return "ملغية";
}

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, settings] = await Promise.all([getInvoiceById(id), getCompanySettings()]);
  if (!invoice) return <p className="p-10 text-center text-lg font-bold text-red-600">الفاتورة غير موجودة</p>;

  const isOverdue = Number(invoice.remainingAmount) > 0;

  return (
    <html dir="rtl">
      <head>
        <title>فاتورة {invoice.invoiceNo}</title>
        <style>{`
          @page { margin: 20mm 15mm; size: A4; }
          body { font-family: 'Traditional Arabic', Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 20px; }
          .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0B7CFF; padding-bottom: 20px; margin-bottom: 20px; }
          .hdr-l h1 { font-size: 28px; color: #0B7CFF; margin: 0; }
          .hdr-l p { margin: 4px 0; font-size: 12px; color: #555; }
          .hdr-r { text-align: left; }
          .hdr-r h2 { font-size: 24px; margin: 0; color: #1a1a2e; }
          .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-b { width: 45%; }
          .info-b h3 { font-size: 14px; color: #0B7CFF; margin: 0 0 8px 0; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          .info-b p { margin: 4px 0; font-size: 13px; }
          table.w { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          table.w th { background: #0B7CFF; color: white; padding: 10px 8px; font-size: 13px; text-align: center; }
          table.w td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 13px; text-align: center; }
          .tot { width: 300px; margin-right: auto; }
          .tot td { font-weight: bold; border-top: 2px solid #1a1a2e; }
          .nt { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
          .nt h4 { font-size: 14px; color: #0B7CFF; margin: 0 0 8px 0; }
          .nt p { font-size: 12px; color: #555; margin: 0; }
          .ft { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 15px; }
          .sig { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig-b { width: 40%; }
          .sig-b h4 { font-size: 13px; color: #0B7CFF; margin: 0 0 4px 0; }
          .sig-l { border-bottom: 1px solid #1a1a2e; height: 40px; margin-top: 4px; }
          .stamp { border: 2px dashed #1a1a2e; height: 80px; width: 120px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #888; margin-top: 8px; }
        `}</style>
      </head>
      <body>
        <div className="hdr">
          <div className="hdr-l">
            <h1>{settings.companyName || "True Level Production"}</h1>
            <p>{settings.companyAddress || ""}</p>
            <p>{settings.companyPhone || ""}</p>
            <p>{settings.companyEmail || ""}</p>
          </div>
          <div className="hdr-r">
            <h2>فاتورة</h2>
            <div className="status" style={statusStyle(invoice.status)}>{statusLabel(invoice.status)}</div>
          </div>
        </div>

        <div className="info">
          <div className="info-b">
            <h3>بيانات الفاتورة</h3>
            <p><strong>رقم الفاتورة:</strong> {invoice.invoiceNo}</p>
            <p><strong>تاريخ الفاتورة:</strong> {new Date(invoice.invoiceDate).toLocaleDateString("ar-EG")}</p>
            <p><strong>تاريخ الاستحقاق:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("ar-EG") : "---"}</p>
            <p><strong>العملة:</strong> {invoice.currency}</p>
          </div>
          <div className="info-b">
            <h3>بيانات العميل</h3>
            <p><strong>{invoice.client.fullName}</strong></p>
            {invoice.client.companyName ? <p>{invoice.client.companyName}</p> : null}
            <p>{invoice.client.phone}</p>
            {invoice.client.address ? <p>{invoice.client.address}</p> : null}
          </div>
        </div>

        <table className="w">
          <thead>
            <tr>
              <th style={{ textAlign: "right" }}>الوصف</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الخصم</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item: any) => (
              <tr key={item.id}>
                <td style={{ textAlign: "right" }}>{item.description}</td>
                <td>{Number(item.quantity)}</td>
                <td>{Number(item.unitPrice).toLocaleString()} {invoice.currency}</td>
                <td>{Number(item.discount).toLocaleString()} {invoice.currency}</td>
                <td>{Number(item.total).toLocaleString()} {invoice.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="tot">
          <table className="w">
            <tbody>
              <tr><td style={{ textAlign: "left" }}>الإجمالي قبل الخصم</td><td style={{ textAlign: "left" }}>{Number(invoice.subtotal).toLocaleString()} {invoice.currency}</td></tr>
              <tr><td style={{ textAlign: "left" }}>الخصم</td><td style={{ textAlign: "left" }}>{Number(invoice.discount).toLocaleString()} {invoice.currency}</td></tr>
              <tr><td style={{ textAlign: "left" }}>الضريبة ({Number(invoice.taxRate)}%)</td><td style={{ textAlign: "left" }}>{Number(invoice.taxAmount).toLocaleString()} {invoice.currency}</td></tr>
              <tr style={{ fontSize: "18px" }}><td style={{ textAlign: "left", color: "#0B7CFF" }}><strong>الإجمالي النهائي</strong></td><td style={{ textAlign: "left", color: "#0B7CFF" }}><strong>{Number(invoice.total).toLocaleString()} {invoice.currency}</strong></td></tr>
              <tr><td style={{ textAlign: "left" }}>المبلغ المدفوع</td><td style={{ textAlign: "left", color: "#16a34a" }}>{Number(invoice.paidAmount).toLocaleString()} {invoice.currency}</td></tr>
              <tr><td style={{ textAlign: "left" }}>المبلغ المتبقي</td><td style={{ textAlign: "left", color: isOverdue ? "#dc2626" : "#16a34a" }}>{Number(invoice.remainingAmount).toLocaleString()} {invoice.currency}</td></tr>
            </tbody>
          </table>
        </div>

        {invoice.notes || invoice.terms ? (
          <div className="nt">
            {invoice.notes ? <><h4>ملاحظات</h4><p>{invoice.notes}</p></> : null}
            {invoice.terms ? <><h4 style={{ marginTop: "10px" }}>الشروط</h4><p>{invoice.terms}</p></> : null}
          </div>
        ) : null}

        <div className="sig">
          <div className="sig-b">
            <h4>الطرف الأول (الشركة)</h4>
            <p style={{ fontSize: "12px", margin: "0" }}>{settings.companyLegalName || settings.companyName || "True Level Production"}</p>
            <div className="sig-l"></div>
            <p style={{ fontSize: "11px", color: "#888", margin: "2px 0" }}>التوقيع</p>
            <div className="stamp">الختم</div>
          </div>
          <div className="sig-b">
            <h4>الطرف الثاني (العميل)</h4>
            <p style={{ fontSize: "12px", margin: "0" }}>{invoice.client.fullName}</p>
            {invoice.client.companyName ? <p style={{ fontSize: "12px", margin: "0" }}>{invoice.client.companyName}</p> : null}
            <div className="sig-l"></div>
            <p style={{ fontSize: "11px", color: "#888", margin: "2px 0" }}>التوقيع</p>
            <div className="stamp">الختم</div>
          </div>
        </div>

        <div className="ft">
          <p>{settings.companyName || "True Level Production"} &mdash; {settings.companyAddress || ""}</p>
          <p>{settings.companyPhone ? "ت: ".concat(settings.companyPhone) : ""}{settings.companyEmail ? " | بريد: ".concat(settings.companyEmail) : ""}</p>
          <p>فاتورة رقم {invoice.invoiceNo} &mdash; تاريخ {new Date(invoice.invoiceDate).toLocaleDateString("ar-EG")}</p>
        </div>

        <script dangerouslySetInnerHTML={{ __html: "window.print();" }} />
      </body>
    </html>
  );
}
