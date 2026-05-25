export function ContractPreview({
  title,
  body,
  status,
  clientName,
  totalPrice,
  contractNumber,
  createdAt,
}: {
  title: string;
  body: string;
  status: string;
  clientName: string;
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
              <img alt="True Level Production" src="/black-logo.svg" style={{ width: 140, height: "auto" }} />
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
              const isSectionHeading = /^[أ-ي\s]{2,}:$/.test(trimmed) || /^[أ-ي\s]{2,}:/.test(trimmed);
              const lines = trimmed.split("\n").filter(Boolean);
              const firstLine = lines[0] || "";
              const restLines = lines.slice(1);

              if (!trimmed) return null;

              return (
                <div className={`contract-section ${isSectionHeading ? "section-head" : ""}`} key={i}>
                  {isSectionHeading ? (
                    <>
                      <h2 className="section-title">{firstLine.replace(":", "").trim()}</h2>
                      {restLines.map((line, j) => <p className="section-paragraph" key={j}>{line}</p>)}
                    </>
                  ) : (
                    <>
                      <h2 className="section-title">{firstLine}</h2>
                      {restLines.map((line, j) => <p className="section-paragraph" key={j}>{line}</p>)}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="contract-footer">
            <div className="footer-line" />
            <div className="footer-content">
              <span>True Level Production</span>
              <span className="footer-sep">|</span>
              <span>truelevelofficial@gmail.com</span>
              <span className="footer-sep">|</span>
              <span>Egypt</span>
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
    margin: 15mm 18mm 20mm 18mm;
  }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .contract-document { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; }
  .contract-status-badge { display: none; }
  .no-print { display: none !important; }
  .contract-page { page-break-after: always; }
  .contract-section { page-break-inside: avoid; }
  .contract-header { position: running(pageHeader); }
  .contract-footer { position: running(pageFooter); }
  @page { @top-right { content: element(pageHeader); } @bottom-center { content: element(pageFooter); } }
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
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #0d0d0d;
}
.contract-meta {
  text-align: left;
  direction: ltr;
}
.meta-line {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: #555;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.contract-status-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 16px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.contract-status-badge.draft { background: #fef3c7; color: #92400e; }
.contract-status-badge.sent { background: #dbeafe; color: #1e40af; }
.contract-status-badge.signed { background: #d1fae5; color: #065f46; }
.contract-status-badge.cancelled { background: #fee2e2; color: #991b1b; }
.contract-title-area {
  margin-bottom: 24px;
  text-align: center;
}
.contract-title {
  font-size: 20px;
  font-weight: 800;
  color: #0d0d0d;
  margin: 0;
  letter-spacing: -0.02em;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.contract-disclaimer {
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 28px;
  font-size: 12px;
  line-height: 1.7;
  color: #92400e;
  text-align: center;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.contract-body {
  font-family: 'Traditional Arabic', 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', 'Times New Roman', serif;
  direction: rtl;
  text-align: right;
  font-size: 14px;
  line-height: 2;
  color: #1a1a1a;
}
.contract-section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0d0d0d;
  margin: 24px 0 10px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid #e5e7eb;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.section-paragraph {
  margin: 6px 0;
  text-align: justify;
}
.contract-footer {
  margin-top: 40px;
  padding-top: 16px;
}
.footer-line {
  border-top: 1px solid #d1d5db;
  margin-bottom: 10px;
}
.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: #6b7280;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  direction: ltr;
}
.footer-sep {
  color: #d1d5db;
}
`;
