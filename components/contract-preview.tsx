export function ContractPreview({
  title,
  body,
  status,
  clientName,
  clientCompanyName,
  representativeName,
  totalPrice,
  contractNumber,
  createdAt,
}: {
  title: string;
  body: string;
  status: string;
  clientName: string;
  clientCompanyName?: string | null;
  representativeName?: string | null;
  totalPrice?: string | number | null;
  contractNumber?: string;
  createdAt?: string;
}) {
  const isDraft = status === "DRAFT";
  const sections = body.split(/\n\s*=+\s*\n/).filter(Boolean);

  return (
    <>
      <style>{printStyles}</style>
      <div className="contract-document">
        <div className="contract-page">
          <div className="contract-header">
            <div className="contract-logo">
              <img alt="True Level Production" src="/true-level-logo-black.svg" style={{ width: 160, height: "auto" }} />
            </div>
            <div className="contract-meta">
              {contractNumber ? <p className="meta-line">رقم العقد: {contractNumber}</p> : null}
              {createdAt ? <p className="meta-line">التاريخ: {new Date(createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</p> : null}
            </div>
          </div>

          <div className={`contract-status-badge ${isDraft ? "draft" : status.toLowerCase()}`}>
            {status === "DRAFT" ? "مسودة - غير ملزمة" : status === "SENT" ? "مرسل للعميل" : status === "SIGNED" ? "موقع" : "ملغي"}
          </div>

          <div className="contract-title-area">
            <h1 className="contract-title">{title}</h1>
          </div>

          {isDraft ? (
            <div className="contract-disclaimer">
              <strong>تنبيه قانوني:</strong> هذا المستند مسودة نموذج مبدئي قابلة للتعديل، ولا تعتبر بديلا عن مراجعة محام متخصص. يجب مراجعة هذا العقد قانونيا من قبل محام مرخص في جمهورية مصر العربية قبل التوقيع أو الاستخدام الرسمي.
            </div>
          ) : null}

          <div className="contract-body">
            {sections.map((section, i) => {
              const trimmed = section.trim();
              const lines = trimmed.split("\n").filter(Boolean);
              const firstLine = lines[0] || "";
              const restLines = lines.slice(1);

              if (!trimmed) return null;

              return (
                <div className="contract-section" key={i}>
                  <h2 className="section-title">{firstLine.replace(":", "").trim()}</h2>
                  {restLines.map((line, j) => <p className="section-paragraph" key={j}>{line}</p>)}
                </div>
              );
            })}
          </div>

          <div className="contract-signatures">
            <table className="signature-table">
              <tbody>
                <tr>
                  <td className="signature-cell">
                    <div className="signature-side">
                      <p className="sig-party">الطرف الأول</p>
                      <p className="sig-name">True Level Production</p>
                      <div className="sig-line"><span className="sig-label">الاسم:</span> <span className="sig-value">{representativeName || "______________"}</span></div>
                      <div className="sig-line"><span className="sig-label">الصفة:</span> <span className="sig-value">ممثل الشركة</span></div>
                      <div className="sig-line"><span className="sig-label">التوقيع:</span></div>
                      <div className="sig-space" />
                      <div className="sig-line"><span className="sig-label">التاريخ:</span> <span className="sig-value">___/___/20___</span></div>
                    </div>
                  </td>
                  <td className="signature-divider" />
                  <td className="signature-cell">
                    <div className="signature-side">
                      <p className="sig-party">الطرف الثاني</p>
                      <p className="sig-name">{clientCompanyName || clientName}</p>
                      <div className="sig-line"><span className="sig-label">الاسم:</span> <span className="sig-value">{clientName}</span></div>
                      <div className="sig-line"><span className="sig-label">الصفة:</span> <span className="sig-value">{clientCompanyName ? `ممثل ${clientCompanyName}` : "عميل"}</span></div>
                      <div className="sig-line"><span className="sig-label">التوقيع:</span></div>
                      <div className="sig-space" />
                      <div className="sig-line"><span className="sig-label">التاريخ:</span> <span className="sig-value">___/___/20___</span></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="sig-footer-note">حرر هذا العقد من نسختين، تسلم كل طرف نسخة واحدة للعمل بموجبه.</p>
          </div>

          <div className="contract-footer">
            <div className="footer-line" />
            <div className="footer-content">
              <span>True Level Production</span>
              <span className="footer-sep">|</span>
              <span>Cairo, Egypt</span>
              <span className="footer-sep">|</span>
              <span>{representativeName ? `Rep: ${representativeName}` : ""}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const printStyles = `
@media print {
  @page {
    size: A4;
    margin: 12mm 16mm 18mm 16mm;
  }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .contract-document { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; }
  .contract-status-badge { display: none; }
  .no-print { display: none !important; }
  .contract-section { page-break-inside: avoid; }
  .contract-signatures { page-break-inside: avoid; }
}
@media screen {
  .contract-document {
    max-width: 210mm;
    margin: 0 auto;
    background: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    padding: 40px 50px;
  }
  .contract-page {
    background: #fff;
  }
}
.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 2px solid #0d0d0d;
}
.contract-logo {
  flex-shrink: 0;
}
.contract-meta {
  text-align: left;
  direction: ltr;
}
.meta-line {
  margin: 0 0 3px 0;
  font-size: 10px;
  color: #555;
}
.contract-status-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.contract-status-badge.draft { background: #fef3c7; color: #92400e; }
.contract-status-badge.sent { background: #dbeafe; color: #1e40af; }
.contract-status-badge.signed { background: #d1fae5; color: #065f46; }
.contract-status-badge.cancelled { background: #fee2e2; color: #991b1b; }
.contract-title-area {
  margin-bottom: 22px;
  text-align: center;
}
.contract-title {
  font-size: 18px;
  font-weight: 800;
  color: #0d0d0d;
  margin: 0;
}
.contract-disclaimer {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 11px;
  line-height: 1.7;
  color: #92400e;
  text-align: center;
}
.contract-body {
  font-family: var(--font-cairo), 'Traditional Arabic', 'Noto Naskh Arabic', Tahoma, sans-serif;
  direction: rtl;
  text-align: right;
  font-size: 14px;
  line-height: 1.9;
  color: #1a1a1a;
}
.contract-section {
  margin-bottom: 18px;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #0d0d0d;
  margin: 20px 0 8px 0;
  padding-bottom: 3px;
  border-bottom: 1px solid #e0e0e0;
}
.section-paragraph {
  margin: 5px 0;
  text-align: justify;
}
.contract-signatures {
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid #d1d5db;
}
.signature-table {
  width: 100%;
  border-collapse: collapse;
}
.signature-cell {
  width: 48%;
  vertical-align: top;
  padding: 0;
}
.signature-divider {
  width: 4%;
  border-left: 1px dashed #ccc;
}
.signature-side {
  padding: 4px 0;
}
.sig-party {
  font-size: 15px;
  font-weight: 800;
  color: #0d0d0d;
  margin: 0 0 2px 0;
}
.sig-name {
  font-size: 13px;
  font-weight: 600;
  color: #0d0d0d;
  margin: 0 0 14px 0;
}
.sig-line {
  margin: 4px 0;
  font-size: 12px;
  color: #333;
  display: flex;
  align-items: baseline;
}
.sig-label {
  font-weight: 700;
  min-width: 50px;
  flex-shrink: 0;
}
.sig-value {
  font-weight: 400;
}
.sig-space {
  height: 36px;
  border-bottom: 1px solid #999;
  margin: 4px 0 8px 40px;
}
.sig-footer-note {
  margin-top: 20px;
  text-align: center;
  font-size: 11px;
  color: #555;
}
.contract-footer {
  margin-top: 32px;
  padding-top: 12px;
}
.footer-line {
  border-top: 1px solid #d1d5db;
  margin-bottom: 8px;
}
.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  color: #888;
  direction: ltr;
}
.footer-sep {
  color: #ccc;
}
`;
