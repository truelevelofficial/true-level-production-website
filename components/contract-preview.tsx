export function ContractPreview({
  title,
  body,
  clientName,
  clientCompanyName,
  representativeName,
  totalPrice,
  contractNumber,
  createdAt,
}: {
  title: string;
  body: string;
  clientName: string;
  clientCompanyName?: string | null;
  representativeName?: string | null;
  totalPrice?: string | number | null;
  contractNumber?: string;
  createdAt?: string;
}) {
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

          <div className="contract-title-area">
            <h1 className="contract-title">{title}</h1>
          </div>

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

          <div className="contract-ending-sentence">
            حرر هذا العقد من نسختين أصليتين، تسلم كل طرف نسخة للعمل بموجبها.
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
                        <span className="sig-value">عبدالرحمن محمد</span>
                      </div>
                      <div className="sig-separator" />
                      <div className="sig-field">
                        <span className="sig-label">الصفة:</span>
                        <span className="sig-value">ممثل الشركة</span>
                      </div>
                      <div className="sig-field sig-field-tawqee">
                        <span className="sig-label">التوقيع:</span>
                        <span className="sig-line-draw" />
                      </div>
                      <div className="sig-blank-space" />
                      <div className="sig-seal-container">
                        <img alt="" src="/true-level-logo-black.png" className="sig-seal-stamp" />
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">التاريخ:</span>
                        <span className="sig-value">____ / ____ / 20__</span>
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
                        <span className="sig-value">____ / ____ / 20__</span>
                      </div>
                      <div className="sig-field">
                        <span className="sig-label">الختم:</span>
                        <span className="sig-stamp" />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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
  .no-print { display: none !important; }
  .contract-section { page-break-inside: avoid; }
  .contract-signatures { page-break-inside: avoid; break-inside: avoid; }
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

.contract-title-area { margin-bottom: 24px; text-align: center; }
.contract-title { font-size: 20px; font-weight: 800; color: #0d0d0d; margin: 0; letter-spacing: -0.02em; }

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

.contract-ending-sentence {
  margin-top: 48px;
  margin-bottom: 8px;
  padding: 14px 20px;
  border-top: 1.5px solid #0d0d0d;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #0d0d0d;
  line-height: 1.8;
}

.contract-signatures { margin-top: 28px; page-break-inside: avoid; break-inside: avoid; }
.sig-heading { font-size: 18px; font-weight: 800; color: #0d0d0d; margin: 0 0 24px 0; text-align: center; letter-spacing: 0.02em; }
.signature-table { width: 100%; border-collapse: collapse; }
.signature-cell { width: 48%; vertical-align: top; padding: 0; }
.signature-divider { width: 4%; border-left: 1px dashed #bbb; }
.signature-side { padding: 6px 0; }
.sig-party { font-size: 16px; font-weight: 800; color: #0d0d0d; margin: 0 0 4px 0; }
.sig-company { font-size: 14px; font-weight: 600; color: #0d0d0d; margin: 0 0 20px 0; }
.sig-field { margin: 10px 0; font-size: 14px; color: #0d0d0d; display: flex; align-items: baseline; gap: 8px; }
.sig-label { font-weight: 700; min-width: 58px; flex-shrink: 0; }
.sig-value { font-weight: 400; }
.sig-line-draw {
  display: inline-block;
  width: 200px;
  height: 0;
  border-bottom: 1.5px solid #0d0d0d;
  margin-right: 4px;
}
.sig-separator {
  width: 100%;
  height: 0;
  border-bottom: 1.5px solid #0d0d0d;
  margin: 16px 0;
}
.sig-blank-space {
  height: 40px;
}
.sig-seal-container {
  display: flex;
  justify-content: center;
  margin: 4px 0 12px 0;
}
.sig-seal-stamp {
  width: 100px;
  height: auto;
  opacity: 0.18;
  transform: rotate(-10deg);
}
`;
