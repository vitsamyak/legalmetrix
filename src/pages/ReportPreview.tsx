import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BrandedLoader } from '../components/BrandedLoader';
import { ReportDocument } from '../components/ReportDocument';
// @ts-ignore
import * as html2pdfLib from 'html2pdf.js/dist/html2pdf.bundle.min.js';
const html2pdf = html2pdfLib.default || html2pdfLib;

export const ReportPreview = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [inspection, setInspection] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        if (!id) return;
        
        const { data: insData, error: insError } = await supabase!
          .from('inspections')
          .select('*, products(name, brand, category), profiles(full_name, region)')
          .eq('id', id)
          .single();
          
        if (insError) throw insError;
        setInspection(insData);

        const { data: violData, error: violError } = await supabase!
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPdf || !inspection) return;
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById('report-content');
      if (!element) return;
      
      const opt = {
        margin:       0,
        filename:     `LegalMetrix-AI-Report-${inspection.id?.substring(0,8)}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) {
    return <BrandedLoader fullScreen={false} subMessage="Loading report..." />;
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12 print:max-w-none print:m-0 print:p-0 print:space-y-0">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <div className="flex items-center space-x-4">
          <Link to="/reports">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-heading text-content tracking-tight">Report Preview</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>Print</Button>
          <Button 
            variant="primary" 
            onClick={handleDownloadPDF} 
            disabled={isGeneratingPdf}
            leftIcon={<Download className="w-4 h-4" />}
          >
            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="bg-[#E2E8F0] p-8 rounded-lg shadow-lg print:p-0 print:shadow-none print:bg-white">
        <ReportDocument 
          inspection={inspection} 
          violations={violations} 
          user={user} 
          reportDate={reportDate} 
        />
      </div>
    </div>
  );
};
