import React, { useRef } from 'react';
import { Award, Download, X, Share2, ShieldCheck, QrCode, CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { SAHAYAKThread } from '../ui/SAHAYAKThread';

export interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  recipientName?: string;
  usn?: string;
  department?: string;
  itemName?: string;
  itemTitle?: string;
  caseId?: string;
  date?: string;
  pointsAwarded?: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  recipientName,
  usn,
  department,
  itemName,
  itemTitle,
  caseId = 'NIE-LF-8842',
  date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  pointsAwarded = 75
}) => {
  const { studentUser, user } = useAuth();
  const currentUser = studentUser || user;

  if (!isOpen) return null;

  const displayName = recipientName || studentName || currentUser?.fullName || currentUser?.name || 'Shaik Zayan Ahmed';
  const displayUsn = usn || (currentUser as any)?.usn || '4NI21CS001';
  const displayDept = department || (currentUser as any)?.branch || (currentUser as any)?.department || 'Computer Science & Engineering';
  const displayItem = itemTitle || itemName || 'Safely Recovered Campus Belongings';
  const certReference = `NIE-CERT-${caseId.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  const handleDownloadPDF = () => {
    // Generate clean, high-resolution printable HTML for PDF generation
    const printWindow = window.open('', '_blank', 'width=950,height=700');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>SAHAYAK Certificate of Integrity - ${displayName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
          }
          body {
            background-color: #f7f6f0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 15px;
          }
          .cert-container {
            width: 100%;
            max-width: 900px;
            background: #ffffff;
            border: 10px double #C49A45;
            border-radius: 16px;
            padding: 40px 50px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            position: relative;
            background-image: radial-gradient(circle at center, #fffdf8 0%, #fbf9f2 100%);
          }
          .cert-header {
            margin-bottom: 20px;
          }
          .institution {
            font-size: 14px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #C49A45;
            font-weight: 800;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            color: #1A365D;
            margin: 8px 0 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .subtitle {
            font-size: 13px;
            color: #64748B;
            letter-spacing: 0.5px;
          }
          .gold-divider {
            width: 120px;
            height: 3px;
            background: linear-gradient(90deg, #E5C378, #C49A45, #A07828);
            margin: 15px auto;
            border-radius: 2px;
          }
          .presentation-text {
            font-size: 13px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 10px;
          }
          .student-name {
            font-size: 32px;
            font-weight: 900;
            color: #1A365D;
            margin: 10px 0;
            font-family: Georgia, serif;
            letter-spacing: 0.5px;
            border-bottom: 2px dashed #C49A45;
            display: inline-block;
            padding: 0 20px 5px;
          }
          .student-meta {
            font-size: 13px;
            color: #334155;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .citation {
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            max-width: 680px;
            margin: 0 auto 20px;
          }
          .item-box {
            display: inline-block;
            background: #F1F5F9;
            border: 1px solid #CBD5E1;
            padding: 6px 18px;
            border-radius: 8px;
            font-weight: 700;
            color: #0F172A;
            margin-top: 4px;
          }
          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E2E8F0;
          }
          .sig-block {
            text-align: center;
            width: 200px;
          }
          .sig-line {
            border-top: 1px solid #1A365D;
            margin-top: 35px;
            padding-top: 4px;
            font-size: 11px;
            font-weight: 700;
            color: #1A365D;
            text-transform: uppercase;
          }
          .sig-title {
            font-size: 10px;
            color: #64748B;
          }
          .seal-block {
            text-align: center;
          }
          .seal-circle {
            width: 70px;
            height: 70px;
            border: 3px dashed #C49A45;
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 800;
            color: #C49A45;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cert-id {
            font-size: 10px;
            color: #94A3B8;
            font-family: monospace;
            margin-top: 4px;
          }
          @media print {
            body {
              background: transparent;
              padding: 0;
            }
            .cert-container {
              box-shadow: none;
              border: 8px double #C49A45;
            }
          }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="cert-header">
            <div class="institution">The National Institute of Engineering, Mysuru</div>
            <div class="title">Certificate of Campus Stewardship</div>
            <div class="subtitle">SAHAYAK Good Samaritan Honor & Integrity Recognition • ${date}</div>
            <div class="gold-divider"></div>
          </div>

          <div class="presentation-text">This certificate is honorably presented to</div>
          <div class="student-name">${displayName}</div>
          <div class="student-meta">USN: ${displayUsn} &nbsp;|&nbsp; Dept: ${displayDept}</div>

          <div class="citation">
            In formal recognition of exemplary integrity, honesty, and active campus responsibility in safeguarding and returning property to the rightful owner:
            <br>
            <div class="item-box">${displayItem}</div>
          </div>

          <div class="cert-footer">
            <div class="sig-block">
              <div class="sig-line">Dr. Proctor Desk</div>
              <div class="sig-title">Dean of Student Affairs, NIE</div>
            </div>

            <div class="seal-block">
              <div class="seal-circle">SAHAYAK<br>VERIFIED<br>OFFICIAL</div>
              <div class="cert-id">${certReference}</div>
            </div>

            <div class="sig-block">
              <div class="sig-line">Chief Security Officer</div>
              <div class="sig-title">NIE Campus Security Wing</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-sahayak-cream-soft rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-sahayak-gold/60 text-center space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-sahayak-cream hover:bg-sahayak-cream-soft text-sahayak-text-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header Emblem */}
        <div className="flex flex-col items-center">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-sahayak-gold to-sahayak-gold-dark flex items-center justify-center text-white shadow-neumorph-sm mb-2 border-4 border-white">
            <Award className="w-10 h-10" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-sahayak-gold-dark">
            The National Institute of Engineering, Mysuru
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-sahayak-blue-deep mt-0.5">
            Certificate of Campus Stewardship
          </h2>
          <p className="text-xs text-sahayak-text-secondary mt-0.5">
            SAHAYAK Official Recovery & Integrity Recognition • {date}
          </p>
        </div>

        <SAHAYAKThread showIcon text="Verified Campus Handover" />

        {/* Certificate Body Text */}
        <div className="bg-sahayak-cream p-5 sm:p-6 rounded-2xl border border-sahayak-brown/15 text-sm leading-relaxed text-sahayak-text-primary space-y-2.5">
          <p className="text-xs uppercase tracking-wider text-sahayak-text-secondary">This is proudly awarded to</p>
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-sahayak-blue-deep tracking-wide">{displayName}</h3>
          
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sahayak-text-muted">
            <span className="px-2.5 py-0.5 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-mono font-bold">
              USN: {displayUsn}
            </span>
            <span>•</span>
            <span className="text-sahayak-text-secondary">
              {displayDept}
            </span>
          </div>

          <p className="text-xs text-sahayak-text-secondary max-w-md mx-auto pt-1">
            for demonstrating exemplary honesty, campus citizenship, and active responsibility in safeguarding and returning:
          </p>
          <p className="font-semibold text-sm sm:text-base text-sahayak-text-primary bg-white/80 py-2 px-4 rounded-xl border border-sahayak-gold/40 inline-block shadow-sm">
            {displayItem}
          </p>
        </div>

        {/* Verification Footprint */}
        <div className="grid grid-cols-2 gap-3 text-xs text-left bg-sahayak-cream-soft p-3.5 rounded-xl border border-sahayak-brown/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-sahayak-text-muted block">Certificate ID</span>
            <span className="font-mono font-bold text-sahayak-blue text-xs">{certReference}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-sahayak-text-muted block">Finder Reward Credited</span>
            <span className="font-bold text-sahayak-success text-xs">+{pointsAwarded} Good Samaritan Points</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-3 rounded-xl bg-sahayak-blue text-white font-bold text-xs sm:text-sm shadow-neumorph hover:bg-sahayak-blue-mid transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-sahayak-gold" />
            <span>Download Certificate (PDF)</span>
          </button>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(`I earned the SAHAYAK Campus Stewardship Certificate at NIE Mysuru! Reference: ${certReference}`);
                alert('Milestone details copied to clipboard!');
              }
            }}
            className="px-5 py-3 rounded-xl bg-sahayak-cream border border-sahayak-brown/20 text-sahayak-text-primary font-bold text-xs shadow-neumorph hover:border-sahayak-blue transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Milestone</span>
          </button>
        </div>
      </div>
    </div>
  );
};

