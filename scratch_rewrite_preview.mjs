import fs from 'fs';
const content = `import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Download, Printer, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const ReportPreview = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [inspection, setInspection] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        if (!id) return;
        
        const { data: insData, error: insError } = await supabase
          .from('inspections')
          .select('*, products(name, brand, category), profiles(full_name, region)')
          .eq('id', id)
          .single();
          
        if (insError) throw insError;
        setInspection(insData);

        const { data: violData, error: violError } = await supabase
          .from('violations')
          .select('*')
          .eq('inspection_id', id);
          
        if (violError) throw violError;
        if (violData) setViolations(violData);

      } catch (err) {
        console.error('Error fetching report detail:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-content-muted">Loading report...</div>;
  }

  if (!inspection) {
    return <div className="p-12 text-center text-danger">Report not found</div>;
  }

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/reports">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Report Preview</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" leftIcon={<Printer className="w-4 h-4" />}>Print</Button>
          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>Download PDF</Button>
        </div>
      </div>

      <div className="bg-[#E2E8F0] p-8 rounded-lg shadow-lg">
        {/* Printable Report Surface (White/Light for PDF output) */}
        <div className="bg-white text-slate-900 max-w-[800px] mx-auto min-h-[1000px] shadow p-12 relative overflow-hidden font-sans">
          
          <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 flex items-center">
                <ShieldCheck className="w-6 h-6 mr-2" /> LEGALMETRIX AI
              </h1>
              <div className="text-sm font-bold text-slate-600">AI-ASSISTED LEGAL METROLOGY INSPECTION REPORT</div>
            </div>
            <div className="text-right text-sm text-slate-600">
              <div className="font-bold">Inspection ID: {inspection.id?.substring(0, 8)}</div>
              <div>Report Date: {reportDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 border-b border-slate-200 pb-1">Inspection Information</h3>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Inspection ID:</span> {inspection.id}</div>
                <div><span className="font-medium">Inspector Name:</span> {inspection.profiles?.full_name || user.name}</div>
                <div><span className="font-medium">Region:</span> {inspection.profiles?.region || user.region || 'Unknown'}</div>
                <div><span className="font-medium">Date:</span> {new Date(inspection.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 border-b border-slate-200 pb-1">Product Information</h3>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Product Name:</span> {inspection.products?.name}</div>
                <div><span className="font-medium">Brand/Company:</span> {inspection.products?.brand || 'N/A'}</div>
                <div><span className="font-medium">Category:</span> {inspection.products?.category || 'N/A'}</div>
                {inspection.batch_lot_number && <div><span className="font-medium">Batch/Lot:</span> {inspection.batch_lot_number}</div>}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1">Compliance Summary</h3>
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded border border-slate-200">
              <div className={\`text-4xl font-black \${inspection.compliance_score >= 90 ? 'text-emerald-600' : inspection.compliance_score >= 70 ? 'text-amber-600' : 'text-rose-600'}\`}>
                {inspection.compliance_score || 0}%
              </div>
              <div>
                <div className={\`font-bold \${inspection.status === 'Compliant' ? 'text-emerald-700' : inspection.status === 'Non-Compliant' ? 'text-rose-700' : 'text-amber-700'}\`}>
                  {inspection.status?.toUpperCase() || 'UNKNOWN'}
                </div>
                <div className="text-sm text-slate-600">
                  {violations.length > 0 ? 
                    \`\${violations.length} potential violation(s) detected based on Legal Metrology Rules.\` : 
                    \`No violations detected during this inspection.\`}
                </div>
              </div>
            </div>
          </div>

          {violations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1">Violation Details</h3>
              <table className="w-full text-sm text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 font-bold">Rule Reference</th>
                    <th className="border border-slate-300 p-2 font-bold">Issue Detected</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((viol) => (
                    <tr key={viol.id}>
                      <td className="border border-slate-300 p-2 font-medium">{viol.title}</td>
                      <td className="border border-slate-300 p-2 text-rose-600 italic">{viol.ai_analysis || 'Manual violation'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {inspection.notes && (
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1">Inspector Notes</h3>
              <div className="p-4 border border-slate-300 bg-white text-sm italic text-slate-700">
                "{inspection.notes}" - {inspection.profiles?.full_name || user.name}
              </div>
            </div>
          )}

          {/* Legal Disclaimer Footer */}
          <div className="absolute bottom-12 left-12 right-12 text-[10px] text-slate-500 text-center border-t border-slate-200 pt-4">
            <span className="font-bold">Disclaimer:</span> LegalMetrix AI provides AI-assisted preliminary compliance analysis. 
            Final determination and enforcement decisions remain strictly subject to inspection officer verification and applicable law.
            <br />
            Source Reference: Department of Consumer Affairs, Government of India (https://consumeraffairs.gov.in/)
          </div>
        </div>
      </div>
    </div>
  );
};
`;
fs.writeFileSync('src/pages/ReportPreview.tsx', content);
