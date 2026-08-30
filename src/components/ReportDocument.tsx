import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ReportDocumentProps {
  inspection: any;
  violations: any[];
  user: any;
  reportDate: string;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ inspection, violations, user, reportDate }) => {
  if (!inspection) return null;

  return (
    <div id="report-content" className="bg-[#ffffff] text-[#0f172a] max-w-[800px] mx-auto min-h-[1000px] shadow p-12 relative overflow-hidden font-sans">
      <div className="border-b-2 border-[#0f172a] pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0f172a] mb-1 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2" /> LEGALMETRIX AI
          </h1>
          <div className="text-sm font-bold text-[#475569]">AI-ASSISTED LEGAL METROLOGY INSPECTION REPORT</div>
        </div>
        <div className="text-right text-sm text-[#475569]">
          <div className="font-bold">Inspection ID: {inspection.id?.substring(0, 8)}</div>
          <div>Report Date: {reportDate}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase text-[#64748b] mb-2 border-b border-[#e2e8f0] pb-1">Inspection Information</h3>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Inspection ID:</span> {inspection.id}</div>
            <div><span className="font-medium">Inspector Name:</span> {inspection.profiles?.full_name || user?.name || 'Inspector'}</div>
            <div><span className="font-medium">Region:</span> {inspection.profiles?.region || user?.region || 'Unknown'}</div>
            <div><span className="font-medium">Date:</span> {new Date(inspection.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-[#64748b] mb-2 border-b border-[#e2e8f0] pb-1">Product Information</h3>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Product Name:</span> {inspection.products?.name}</div>
            <div><span className="font-medium">Brand/Company:</span> {inspection.products?.brand || 'N/A'}</div>
            <div><span className="font-medium">Category:</span> {inspection.products?.category || 'N/A'}</div>
            {inspection.batch_lot_number && <div><span className="font-medium">Batch/Lot:</span> {inspection.batch_lot_number}</div>}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase text-[#64748b] mb-3 border-b border-[#e2e8f0] pb-1">Compliance Summary</h3>
        <div className="flex items-center space-x-4 bg-[#f8fafc] p-4 rounded border border-[#e2e8f0]">
          <div className={`text-4xl font-black ${
            inspection.compliance_score === null || inspection.compliance_score === undefined 
              ? 'text-[#94a3b8]' 
              : inspection.compliance_score >= 90 
                ? 'text-[#059669]' 
                : inspection.compliance_score >= 70 
                  ? 'text-[#d97706]' 
                  : 'text-[#e11d48]'
          }`}>
            {inspection.compliance_score !== null && inspection.compliance_score !== undefined 
              ? `${inspection.compliance_score}%` 
              : '--'}
          </div>
          <div>
            <div className={`font-bold ${inspection.status === 'Compliant' ? 'text-[#047857]' : inspection.status === 'Non-Compliant' ? 'text-[#be123c]' : 'text-[#b45309]'}`}>
              {inspection.status?.toUpperCase() || 'UNKNOWN'}
            </div>
            <div className="text-sm text-[#475569]">
              {violations.length > 0 ? 
                `${violations.length} potential violation(s) detected based on Legal Metrology Rules.` : 
                inspection.status === 'Needs Review' ?
                `Insufficient or unclear evidence. Compliance could not be reliably determined.` :
                `No violations detected during this inspection.`}
            </div>
          </div>
        </div>
      </div>

      {violations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase text-[#64748b] mb-3 border-b border-[#e2e8f0] pb-1">Violation Details</h3>
          <table className="w-full text-sm text-left border-collapse border border-[#cbd5e1]">
            <thead className="bg-[#f1f5f9]">
              <tr>
                <th className="border border-[#cbd5e1] p-2 font-bold text-[#334155]">Rule Reference</th>
                <th className="border border-[#cbd5e1] p-2 font-bold text-[#334155]">Issue Detected</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((viol) => (
                <tr key={viol.id}>
                  <td className="border border-[#cbd5e1] p-2 font-medium text-[#334155]">{viol.title}</td>
                  <td className="border border-[#cbd5e1] p-2 text-[#e11d48] italic">{viol.ai_analysis || 'Manual violation'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inspection.notes && (
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase text-[#64748b] mb-3 border-b border-[#e2e8f0] pb-1">Inspector Notes</h3>
          <div className="p-4 border border-[#cbd5e1] bg-[#ffffff] text-sm italic text-[#334155]">
            "{inspection.notes}" - {inspection.profiles?.full_name || user?.name || 'Inspector'}
          </div>
        </div>
      )}

      {/* Legal Verification Stamp Section */}
      <div className="mt-16 pt-8 border-t border-[#cbd5e1] break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          {/* Stamp Graphic */}
          <div className="flex-shrink-0 relative opacity-90">
            <div className="border-[3px] border-[#475569] rounded-sm p-1">
              <div className="border-[1.5px] border-[#475569] rounded-sm px-6 py-4 flex flex-col items-center justify-center text-[#334155] text-center min-w-[200px]">
                <ShieldCheck className="w-7 h-7 mb-2 text-[#475569]" />
                <div className="font-black tracking-widest text-lg text-[#1e293b]">LEGALMETRIX AI</div>
                <div className="font-bold tracking-widest text-sm border-y border-[#475569] w-full py-1 my-2 text-[#1e293b]">
                  INSPECTION VERIFIED
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">AI-ASSISTED REPORT</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#334155]">DIGITAL RECORD</div>
              </div>
            </div>
            {/* Subtle double-stamp effect */}
            <div className="absolute inset-0 border-[3px] rounded-sm -rotate-2 pointer-events-none" style={{ borderColor: 'rgba(148, 163, 184, 0.3)' }}></div>
          </div>
          
          {/* Verification Info */}
          <div className="flex-1">
            <h4 className="text-sm font-bold uppercase text-[#334155] mb-3">Digital Verification Record</h4>
            <table className="text-xs text-[#475569] mb-4">
              <tbody>
                <tr>
                  <td className="pr-4 py-1 font-semibold">Inspection ID:</td>
                  <td className="font-mono text-[#1e293b]">{inspection.id}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-1 font-semibold">Report Date:</td>
                  <td className="text-[#1e293b]">{reportDate}</td>
                </tr>
                <tr>
                  <td className="pr-4 py-1 font-semibold">Status:</td>
                  <td className="font-bold text-[#1e293b]">
                    {inspection.status === 'Compliant' || inspection.status === 'Non-Compliant' 
                      ? 'VERIFIED COMPLETED' 
                      : inspection.status === 'Needs Review' 
                        ? 'VERIFICATION PENDING'
                        : 'PROCESSING'}
                  </td>
                </tr>
                <tr>
                  <td className="pr-4 py-1 font-semibold">Record Type:</td>
                  <td className="italic text-[#334155]">Digitally generated record</td>
                </tr>
              </tbody>
            </table>
            <div className="text-[10.5px] text-[#64748b] leading-relaxed text-justify">
              This AI-assisted report is generated from inspection data submitted to LegalMetrix AI. It does not constitute a government-issued certificate or final enforcement determination. Final findings remain subject to verification by the competent authority and applicable law.
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer Footer */}
      <div className="absolute bottom-12 left-12 right-12 text-[10px] text-[#64748b] text-center border-t border-[#e2e8f0] pt-4">
        <span className="font-bold">Disclaimer:</span> LegalMetrix AI provides AI-assisted preliminary compliance analysis. 
        Final determination and enforcement decisions remain strictly subject to inspection officer verification and applicable law.
        <br />
        Source Reference: Department of Consumer Affairs, Government of India (https://consumeraffairs.gov.in/)
      </div>
    </div>
  );
};
