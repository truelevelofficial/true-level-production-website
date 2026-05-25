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
            <div className="contract-meta">
              {contractNumber ? <p className="meta-line">رقم العدد: {contractNumber}</p> : null}
              {createdAt ? <p className="meta-line">التاريخ: {new Date(createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</p> : null}
            </div>
            <div className="contract-logo">
              <img alt="True Level Production" src="/true-level-logo-black.png" style={{ width: 140, height: "auto" }} />
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
              <svg className="disclaimer-icon" fill="none" height="16" stroke="#92400e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              <span><strong>تنبيه قانوني:</strong> هذا المستند مسودة نموذج مبدئي قابلة للتعديل، ولا تعتبر بديلا عن مراجعة محام متخصص. يجب مراجعة هذا العقد قانونيا من قبل محام مرخص في جمهورية مصر العربية قبل التوقيع أو الاستخدام الرسمي.</span>
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
                  {restLines.map((line, j) => {
                    const isClause = /^\d+[\.\)]/.test(line.trim());
                    return <p className={`section-paragraph${isClause ? " clause" : ""}`} key={j}>{line}</p>;
                  })}
                </div>
              );
            })}
          </div>

          <div className="contract-signatures">
            <h2 className="sig-heading">التوقيعات</h2>
            <table className="signature-table">
              <tbody>
                <tr>
                  <td className="signature-cell">
                    <div className="signature-side">
                      <p className="sig-party">الطرف الأول</p>
                      <p className="sig-company">True Level Production</p>
                      <div className="sig-field">
                        <span className="sig-label">الاسم:</span>
                        <span className="sig-value">{representativeName || "______________"}</span>
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">الصفة:</span>
                        <span className="sig-value">ممثل الشركة</span>
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">التوقيع:</span>
                        <span className="sig-line-draw" />
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">التاريخ:</span>
                        <span className="sig-value">___/___/20___</span>
                      </div>
                    </div>
                  </td>
                  <td className="signature-divider" />
                  <td className="signature-cell">
                    <div className="signature-side">
                      <p className="sig-party">الطرف الثاني</p>
                      <p className="sig-company">{clientCompanyName || clientName}</p>
                      <div className="sig-field">
                        <span className="sig-label">الاسم:</span>
                        <span className="sig-value">{clientName}</span>
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">الصفة:</span>
                        <span className="sig-value">{clientCompanyName ? `ممثل ${clientCompanyName}` : "عميل"}</span>
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">التوقيع:</span>
                        <span className="sig-line-draw" />
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">التاريخ:</span>
                        <span className="sig-value">___/___/20___</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="sig-footer-note">حرر هذا العقد من نسختين، تسلم كل طرف نسخة واحدة للعمل بموجبه.</p>
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
    margin: 14mm 18mm 20mm 18mm;
  }
  * { font-family: var(--font-cairo), 'Traditional Arabic', 'Noto Naskh Arabic', Tahoma, sans-serif; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
  .contract-document { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
  .contract-status-badge { display: none; }
  .no-print { display: none !important; }
  .contract-section { page-break-inside: avoid; }
  .contract-signatures { page-break-inside: avoid; }
  .contract-header { page-break-after: avoid; }
  .contract-title-area { page-break-after: avoid; }
}
@media screen {
  .contract-document {
    max-width: 210mm;
    margin: 0 auto;
    background: #fff;
    border-radius: 0.75rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    padding: 44px 52px;
  }
  .contract-page { background: #fff; }
}

.contract-document {
  font-family: var(--font-cairo), 'Traditional Arabic', 'Noto Naskh Arabic', Tahoma, sans-serif;
  direction: rtl;
  color: #1a1a1a;
}

.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #0d0d0d;
}
.contract-logo { flex-shrink: 0; }
.contract-meta { text-align: left; direction: ltr; }
.meta-line { margin: 0 0 4px 0; font-size: 11px; color: #555; line-height: 1.5; }

.contract-status-badge {
  display: inline-block;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.contract-status-badge.draft { background: #fef3c7; color: #92400e; }
.contract-status-badge.sent { background: #dbeafe; color: #1e40af; }
.contract-status-badge.signed { background: #d1fae5; color: #065f46; }
.contract-status-badge.cancelled { background: #fee2e2; color: #991b1b; }

.contract-title-area { margin-bottom: 24px; text-align: center; }
.contract-title { font-size: 20px; font-weight: 800; color: #0d0d0d; margin: 0; letter-spacing: -0.02em; }

.contract-disclaimer {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 28px;
  font-size: 12px;
  line-height: 1.8;
  color: #92400e;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.disclaimer-icon { flex-shrink: 0; }

.contract-body { font-size: 14px; line-height: 1.9; text-align: right; }
.contract-section { margin-bottom: 22px; }
.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #0d0d0d;
  margin: 24px 0 10px 0;
  padding-bottom: 4px;
  border-bottom: 1.5px solid #d4d4d4;
}
.section-paragraph { margin: 6px 0; text-align: justify; }
.section-paragraph.clause { margin: 4px 0 4px 12px; }

.contract-signatures { margin-top: 40px; padding-top: 24px; border-top: 1.5px solid #0d0d0d; }
.sig-heading { font-size: 17px; font-weight: 800; color: #0d0d0d; margin: 0 0 20px 0; text-align: center; }
.signature-table { width: 100%; border-collapse: collapse; }
.signature-cell { width: 48%; vertical-align: top; padding: 0; }
.signature-divider { width: 4%; border-left: 1px dashed #bbb; }
.signature-side { padding: 4px 0; }
.sig-party { font-size: 16px; font-weight: 800; color: #0d0d0d; margin: 0 0 2px 0; }
.sig-company { font-size: 14px; font-weight: 600; color: #333; margin: 0 0 18px 0; }
.sig-field { margin: 8px 0; font-size: 13px; color: #333; display: flex; align-items: baseline; gap: 6px; }
.sig-label { font-weight: 700; min-width: 52px; flex-shrink: 0; }
.sig-value { font-weight: 400; }
.sig-line-draw {
  display: inline-block;
  width: 180px;
  height: 0;
  border-bottom: 1px solid #666;
  margin-right: 4px;
}
.sig-footer-note { margin-top: 24px; text-align: center; font-size: 12px; color: #555; }
`;
